from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import simulate, data_input

app = FastAPI()

# Set up CORS configuration between FE & BE 
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Default Vite port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register base routes for each feature page 
app.include_router(simulate.router, prefix='/simulate', tags=["Simulation"])
app.include_router(data_input.router, prefix='/data', tags=["Data Input"])


@app.get("/")
async def root():
    return {"message": "GrowLab app running"}