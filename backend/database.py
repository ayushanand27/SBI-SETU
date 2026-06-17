import os
from typing import Optional

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Optional[Client] = None

if (
    SUPABASE_URL
    and SUPABASE_KEY
    and SUPABASE_URL != "your_url_here"
    and SUPABASE_KEY != "your_key_here"
):
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:
        print(f"Supabase init error: {exc}")
        supabase = None
else:
    print("Supabase not configured — persistence disabled. Set SUPABASE_URL and SUPABASE_KEY in .env")
