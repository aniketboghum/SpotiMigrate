from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import auth.youtube_auth as youtube_auth
from service import spotify_service
import service.youtube_service as youtube_service

youtube_router = APIRouter()

# Pydantic model for request body
class PlaylistMigrationRequest(BaseModel):
    sp_playlistId: str
    yt_playlist_name: str

@youtube_router.get("/login")
def login():
    auth_url = youtube_auth.get_auth_url()
    return RedirectResponse(auth_url)   

@youtube_router.get("/callback")
def callback(request: Request):         
    code = request.query_params.get("code")
    if not code:
        return {"error": "Authorization code not found in callback."}
    
    return youtube_auth.exchange_code_for_token(code)

@youtube_router.post("/playlists")
def create_whole_playlists(request: PlaylistMigrationRequest):
    try:
        # Create a new YouTube playlist
        yt_playlist_id = youtube_service.create_playlist(request.yt_playlist_name)
        
        # Get tracks from the specified Spotify playlist
        sp_tracks = spotify_service.get_playlist_tracks(request.sp_playlistId)

        tracks_added = 0
        if sp_tracks:
            for track in sp_tracks['tracks']:
                track_name = track["name"]
                artist_names = ", ".join(track["artists"])

                query = f"{track_name} {artist_names}"

                print(f"Searching YouTube for: {query}")

                video_id = youtube_service.search_song(query)
                if video_id:
                    youtube_service.add_song_to_playlist(yt_playlist_id, video_id)
                    tracks_added += 1
        
        return {
            "message": f"Playlist '{request.yt_playlist_name}' created on YouTube with {tracks_added} tracks.",
            "playlist_id": yt_playlist_id,
            "tracks_added": tracks_added
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    