import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import saarthi, swiftdesk, branchos

app = FastAPI(title="SBI Setu API", version="1.0.0")

_default_origins = "http://localhost:5173,http://localhost:3000"
_allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(saarthi.router)
app.include_router(swiftdesk.router)
app.include_router(branchos.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SBI Setu API"}
