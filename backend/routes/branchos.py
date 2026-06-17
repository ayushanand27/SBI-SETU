from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import supabase

router = APIRouter(prefix="/api/branchos", tags=["BranchOS"])

BASE_STATS: Dict[str, Any] = {
    "branch": "Mumbai Main Branch",
    "footfall": {
        "current": 127,
        "change_from_last_hour": 12,
        "threshold": 100,
    },
    "avg_wait_time": {
        "minutes": 23,
        "change": -3,
        "threshold": 20,
    },
    "digitally_deflected_today": 89,
    "loan_desk_utilization": {
        "percentage": 34,
        "status": "UNDERUTILIZED",
    },
    "chart": {
        "hours": ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"],
        "walk_ins": [45, 78, 120, 98, 115, 87, 65, 43, 32],
        "deflected": [12, 25, 45, 38, 52, 41, 35, 28, 18],
    },
    "counters": [
        {
            "name": "Cash Deposit",
            "queue": 12,
            "avg_time": "8 min",
            "agent": "Priya S",
            "status": "Busy",
            "status_emoji": "🔴",
        },
        {
            "name": "Cash Withdraw",
            "queue": 9,
            "avg_time": "6 min",
            "agent": "Amit K",
            "status": "Busy",
            "status_emoji": "🔴",
        },
        {
            "name": "Loan Enquiry",
            "queue": 2,
            "avg_time": "5 min",
            "agent": "Sneha R",
            "status": "Free",
            "status_emoji": "🟢",
        },
        {
            "name": "Loan Apply",
            "queue": 1,
            "avg_time": "8 min",
            "agent": "Rajesh M",
            "status": "Free",
            "status_emoji": "🟢",
        },
        {
            "name": "Account Open",
            "queue": 8,
            "avg_time": "12 min",
            "agent": "Kavya T",
            "status": "Moderate",
            "status_emoji": "🟡",
        },
        {
            "name": "KYC Update",
            "queue": 5,
            "avg_time": "7 min",
            "agent": "Suresh P",
            "status": "Moderate",
            "status_emoji": "🟡",
        },
    ],
    "server_health": {
        "cpu": 67,
        "ram": 71,
        "db_connections": {"current": 43, "max": 50},
        "api_response_ms": 340,
        "status": "WARNING",
        "message": "Server load elevated. Peak hours: 11AM-2PM",
    },
    "insights": [
        "Loan counters have 87% free capacity — redirect walk-ins",
        "Next peak predicted at 2:00 PM (143 customers)",
        "89 customers served digitally today — saved 12.3 staff hours",
        "Recommend: Open counter 3 for cash at 1:45 PM",
    ],
}


class FootfallRequest(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    walk_ins: int = Field(..., ge=0)
    deflected: int = Field(..., ge=0)
    branch_id: str = "MUM-MAIN-001"


def get_today_token_count() -> int:
    if not supabase:
        return 0
    try:
        today_start = (
            datetime.now(timezone.utc)
            .replace(hour=0, minute=0, second=0, microsecond=0)
            .isoformat()
        )
        result = (
            supabase.table("tokens")
            .select("id", count="exact")
            .gte("created_at", today_start)
            .execute()
        )
        return result.count or 0
    except Exception as exc:
        print(f"today token count error: {exc}")
        return 0


def get_today_chat_sessions_count() -> int:
    if not supabase:
        return 0
    try:
        today_start = (
            datetime.now(timezone.utc)
            .replace(hour=0, minute=0, second=0, microsecond=0)
            .isoformat()
        )
        result = (
            supabase.table("chat_logs")
            .select("session_id")
            .gte("created_at", today_start)
            .execute()
        )
        sessions = {row["session_id"] for row in (result.data or []) if row.get("session_id")}
        return len(sessions)
    except Exception as exc:
        print(f"today chat sessions count error: {exc}")
        return 0


@router.get("/stats")
async def get_stats():
    stats = dict(BASE_STATS)
    stats["tokens_today"] = get_today_token_count()
    stats["chat_sessions_today"] = get_today_chat_sessions_count()
    return stats


@router.post("/footfall")
async def log_footfall(request: FootfallRequest):
    record = {
        "hour": request.hour,
        "walk_ins": request.walk_ins,
        "deflected": request.deflected,
        "branch_id": request.branch_id,
    }

    if supabase:
        try:
            result = supabase.table("footfall_logs").insert(record).execute()
            return {"logged": True, "record": result.data[0] if result.data else record}
        except Exception as exc:
            print(f"footfall_logs insert error: {exc}")

    return {"logged": False, "record": record, "message": "Supabase not configured or insert failed"}


@router.get("/history")
async def get_footfall_history():
    if not supabase:
        return {"history": [], "message": "Supabase not configured"}

    try:
        seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        result = (
            supabase.table("footfall_logs")
            .select("*")
            .gte("logged_at", seven_days_ago)
            .order("logged_at", desc=False)
            .execute()
        )
        return {"history": result.data or []}
    except Exception as exc:
        print(f"footfall history fetch error: {exc}")
        return {"history": []}
