import random
from typing import Set

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import supabase

router = APIRouter(prefix="/api/swiftdesk", tags=["SwiftDesk"])

_used_tokens: Set[str] = set()

SERVICE_CONFIG = {
    "account": {"wait_minutes": 12, "counter_prefix": "Account", "queue_base": 6},
    "loan": {"wait_minutes": 8, "counter_prefix": "Loan", "queue_base": 3},
    "kyc": {"wait_minutes": 7, "counter_prefix": "KYC", "queue_base": 4},
    "passbook": {"wait_minutes": 10, "counter_prefix": "Passbook", "queue_base": 5},
    "cash": {"wait_minutes": 18, "counter_prefix": "Cash", "queue_base": 9},
}

VALID_STATUSES = {"waiting", "serving", "done"}


class TokenRequest(BaseModel):
    service: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    aadhaar_last4: str | None = None


class TokenResponse(BaseModel):
    token: str
    counter: str
    wait_minutes: int
    queue_position: int


class StatusUpdate(BaseModel):
    status: str = Field(..., min_length=1)


def generate_unique_token() -> str:
    global _used_tokens
    for _ in range(100):
        token_num = random.randint(100, 999)
        token = f"A-{token_num}"
        if token not in _used_tokens:
            _used_tokens.add(token)
            return token
    raise HTTPException(status_code=503, detail="Unable to generate unique token. Please try again.")


def normalize_service(service: str) -> str:
    s = service.lower().strip()
    mapping = {
        "account opening": "account",
        "account": "account",
        "loan application": "loan",
        "loan": "loan",
        "kyc update": "kyc",
        "kyc": "kyc",
        "passbook update": "passbook",
        "passbook": "passbook",
        "cash": "cash",
    }
    return mapping.get(s, s)


def persist_token(
    token: str,
    service: str,
    customer_name: str,
    aadhaar_last4: str | None,
    counter: str,
    wait_minutes: int,
    queue_position: int,
) -> None:
    if not supabase:
        return
    try:
        supabase.table("tokens").insert(
            {
                "token_number": token,
                "service": service,
                "customer_name": customer_name,
                "aadhaar_last4": aadhaar_last4,
                "counter": counter,
                "wait_minutes": wait_minutes,
                "queue_position": queue_position,
                "status": "waiting",
            }
        ).execute()
    except Exception as exc:
        print(f"tokens insert error: {exc}")


@router.post("/token", response_model=TokenResponse)
async def generate_token(request: TokenRequest):
    service_key = normalize_service(request.service)
    config = SERVICE_CONFIG.get(service_key)

    if not config:
        raise HTTPException(status_code=400, detail=f"Unknown service: {request.service}")

    token = generate_unique_token()
    counter_num = random.randint(1, 3)
    counter = f"{config['counter_prefix']}-{counter_num}"
    queue_position = config["queue_base"] + random.randint(0, 4)

    persist_token(
        token=token,
        service=service_key,
        customer_name=request.name.strip(),
        aadhaar_last4=request.aadhaar_last4,
        counter=counter,
        wait_minutes=config["wait_minutes"],
        queue_position=queue_position,
    )

    return TokenResponse(
        token=token,
        counter=counter,
        wait_minutes=config["wait_minutes"],
        queue_position=queue_position,
    )


@router.get("/tokens")
async def get_tokens():
    if supabase:
        try:
            result = (
                supabase.table("tokens")
                .select("*")
                .order("created_at", desc=True)
                .limit(20)
                .execute()
            )
            return {"tokens": result.data or []}
        except Exception as exc:
            print(f"tokens fetch error: {exc}")
    return {"tokens": []}


@router.put("/token/{token_number}/status")
async def update_token_status(token_number: str, body: StatusUpdate):
    if body.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(sorted(VALID_STATUSES))}",
        )

    if not supabase:
        return {
            "token_number": token_number,
            "status": body.status,
            "updated": False,
            "message": "Supabase not configured",
        }

    try:
        result = (
            supabase.table("tokens")
            .update({"status": body.status})
            .eq("token_number", token_number)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Token {token_number} not found")
        return {"token": result.data[0], "updated": True}
    except HTTPException:
        raise
    except Exception as exc:
        print(f"token status update error: {exc}")
        raise HTTPException(status_code=500, detail="Failed to update token status") from exc
