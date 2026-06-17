import os
import uuid
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from groq import Groq
from pydantic import BaseModel, Field

from database import supabase

load_dotenv()

router = APIRouter(prefix="/api/saarthi", tags=["Saarthi"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are SBI Saarthi, a friendly and helpful SBI bank assistant. 
Always respond in Hinglish (mix of Hindi and English). 
Keep responses under 100 words. Be warm and helpful.
Always try to resolve queries without branch visit.
Guide to YONO app when possible.
If branch visit truly needed, say so and offer token booking.
Never give wrong financial advice."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = None
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    intent: str


def classify_intent(message: str) -> str:
    text = message.lower().strip()

    if "balance" in text or "account balance" in text:
        return "balance"
    if "passbook" in text:
        return "passbook"
    if any(kw in text for kw in ("cash", "withdrawal", "withdraw")):
        return "cash"
    if "fd" in text or "fixed deposit" in text:
        return "fd"
    if "kyc" in text:
        return "kyc"
    if any(kw in text for kw in ("loan", "home loan", "car loan", "personal loan")):
        return "loan"
    return "general"


def detect_intent(message: str) -> Optional[str]:
    text = message.lower().strip()

    if "balance" in text or "account balance" in text:
        return (
            "Aapka account balance YONO SBI app se dekh sakte hain! Steps: "
            "1) YONO open karein 2) Accounts tab 3) Balance instantly dikhega. "
            "Branch aane ki zaroorat nahi! 😊"
        )

    if any(kw in text for kw in ("passbook",)):
        return (
            "Passbook update YONO se possible hai! YONO → Accounts → Statement → "
            "Download PDF. Free hai aur instant hai! 📱"
        )

    if any(kw in text for kw in ("cash", "withdrawal", "withdraw")):
        return (
            "₹10,000 tak UPI se free withdrawal possible hai. Bade amount ke liye "
            "token book karein. Current wait: ~18 min"
        )

    if any(kw in text for kw in ("fd", "fixed deposit")):
        return (
            "FD YONO se ghar baithe open karein! YONO → Deposits → Open FD. "
            "Best rates available online. Chahiye help?"
        )

    if "kyc" in text:
        return (
            "KYC update Video KYC se ghar se ho sakti hai! YONO → Services → "
            "Video KYC. Documents ready rakhein: Aadhaar + PAN"
        )

    return None


def is_loan_intent(message: str) -> bool:
    return classify_intent(message) == "loan"


def call_groq(message: str, history: List[ChatMessage]) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Groq API key not configured. Please set GROQ_API_KEY in backend/.env",
        )

    try:
        client = Groq(api_key=GROQ_API_KEY)
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history[-10:]:
            if msg.role in ("user", "assistant"):
                messages.append({"role": msg.role, "content": msg.content})

        messages.append({"role": "user", "content": message})

        completion = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=256,
        )

        reply = completion.choices[0].message.content
        return reply.strip() if reply else "Maaf kijiye, response generate nahi ho paya. Dobara try karein."

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Groq API error: {str(exc)}",
        ) from exc


def log_chat(session_id: str, role: str, message: str, intent: Optional[str] = None) -> None:
    if not supabase:
        return
    try:
        supabase.table("chat_logs").insert(
            {
                "session_id": session_id,
                "role": role,
                "message": message,
                "intent": intent,
            }
        ).execute()
    except Exception as exc:
        print(f"chat_logs insert error: {exc}")


def persist_exchange(
    session_id: str, user_message: str, bot_reply: str, intent: str
) -> None:
    log_chat(session_id, "user", user_message, intent)
    log_chat(session_id, "bot", bot_reply, intent)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    intent = classify_intent(request.message)

    intent_reply = detect_intent(request.message)
    if intent_reply:
        persist_exchange(session_id, request.message, intent_reply, intent)
        return ChatResponse(reply=intent_reply, session_id=session_id, intent=intent)

    if is_loan_intent(request.message):
        groq_reply = call_groq(request.message, request.history)
        loan_form_note = (
            "\n\n💡 Loan eligibility check ke liye neeche form bhar sakte hain — "
            "instant result milega!"
        )
        full_reply = groq_reply + loan_form_note
        persist_exchange(session_id, request.message, full_reply, intent)
        return ChatResponse(reply=full_reply, session_id=session_id, intent=intent)

    groq_reply = call_groq(request.message, request.history)
    persist_exchange(session_id, request.message, groq_reply, intent)
    return ChatResponse(reply=groq_reply, session_id=session_id, intent=intent)
