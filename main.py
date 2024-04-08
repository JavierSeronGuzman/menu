from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles



app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/static/js", StaticFiles(directory="static/js"), name="js")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return FileResponse("index.html")