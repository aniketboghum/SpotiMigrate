from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.spotify import spotify_router
from routes.youtube import youtube_router

app = FastAPI(
    title="SpotiMigrate API",
    description="API for migrating playlists between Spotify and YouTube",
    version="1.0.0"
)

# Configure CORS to allow requests from your Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default development port
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.com"  # Replace with your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router=spotify_router, prefix='/spotify', tags=['SPOTIFY'])
app.include_router(router=youtube_router, prefix='/youtube', tags=['YOUTUBE'])

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "SpotiMigrate API is running"}

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to SpotiMigrate API", "docs": "/docs"}