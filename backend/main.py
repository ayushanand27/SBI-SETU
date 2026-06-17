from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import saarthi, swiftdesk, branchos

app = FastAPI(title="SBI Setu API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
