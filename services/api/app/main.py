from fastapi import FastAPI

app = FastAPI(title="Worker App API")

@app.get("/healthz")
def healthz():
    return {"ok": True}
