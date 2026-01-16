from fastapi import FastAPI

app = FastAPI(title="TEST APP - IF THIS WORKS, YOUR PC IS FINE")

@app.get("/")
def home():
    return {"message": "BROTHER IT'S WORKING!!! 🎉🎉🎉", "status": "ALIVE"}

@app.get("/hello")
def hello():
    return {"reply": "YES MAN IT'S ALIVE 💚"}