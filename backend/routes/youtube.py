from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
import auth.youtube_auth as youtube_auth
import service.youtube_service as youtube_service

youtube_router = APIRouter()

@youtube_router.get("/login")
def login():
    auth_url = youtube_auth.get_auth_url()
    return RedirectResponse(auth_url)   

@youtube_router.get("/callback")
def callback(request: Request):         
    code = request.query_params.get("code")
    if not code:
        return {"error": "Authorization code not found in callback."}
    
    youtube_auth.exchange_code_for_token(code)
    return RedirectResponse("/youtube/playlists")  # Redirect to playlists page after successful login

@youtube_router.get("/playlists")
def get_playlists():    
    # This endpoint could be expanded to list YouTube playlists if needed
    return {"message": "You are logged in with YouTube. You can now create playlists."}