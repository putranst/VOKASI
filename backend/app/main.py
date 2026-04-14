from fastapi import FastAPI

app = FastAPI(title="VOKASI API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "vokasi-backend"}
