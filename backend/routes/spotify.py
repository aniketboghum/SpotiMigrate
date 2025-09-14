from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
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
    playlist_url = spotify_auth.callback(request)
    return RedirectResponse(playlist_url)

@spotify_router.get("/playlists")
def get_playlists():
    return spotify_service.get_spotify_playlists()

@spotify_router.get("/playlists/{playlist_id}/tracks")
def get_playlist_tracks(playlist_id: str):
    return spotify_service.get_playlist_tracks(playlist_id)