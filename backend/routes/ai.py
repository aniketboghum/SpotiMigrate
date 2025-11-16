from fastapi import APIRouter, HTTPException
from service import ai_service
from pydantic import BaseModel

ai_router = APIRouter()

class PlaylistGenerationRequest(BaseModel):
    mood: str
    genre: str

@ai_router.post("/generate_playlist")
def generate_playlist(request: PlaylistGenerationRequest):
    try:
        playlist = ai_service.generate_playlist(request.mood, request.genre)
        return playlist
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))