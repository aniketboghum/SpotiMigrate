from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
import auth.spotify_auth as spotify_auth
import service.spotify_service as spotify_service

spotify_router = APIRouter()

@spotify_router.get("/")
def home():
    return {"message": "Welcome to Spotimigrate"}

@spotify_router.get("/login")
def login():
    auth_url = spotify_auth.login()
    return RedirectResponse(auth_url)

@spotify_router.get("/callback")
def callback(request: Request):
    return spotify_auth.callback(request)

@spotify_router.get("/playlists")
def get_playlists():
    try:
        playlists = spotify_service.get_spotify_playlists()
        return playlists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch playlists: {str(e)}")

@spotify_router.get("/playlists/{playlist_id}/tracks")
def get_playlist_tracks(playlist_id: str):
    try:
        tracks = spotify_service.get_playlist_tracks(playlist_id)
        return tracks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch playlist tracks: {str(e)}")