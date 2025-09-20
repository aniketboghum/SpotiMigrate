from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
import auth.youtube_auth as youtube_auth
from service import spotify_service
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
def create_whole_playlists(sp_playlistId : str, yt_playlist_name: str):
    try:
        # Create a new YouTube playlist
        yt_playlist_id = youtube_service.create_playlist(yt_playlist_name)
        
        # Get tracks from the specified Spotify playlist
        sp_tracks = spotify_service.get_playlist_tracks(sp_playlistId)

        if sp_tracks:
            for track in sp_tracks['tracks']:
                track_name = track["name"]
                artist_names = ", ".join(track["artists"])

                query = f"{track_name} {artist_names}"

                print(f"Searching YouTube for: {query}")

                video_id = youtube_service.search_song(query)
                if video_id:
                    youtube_service.add_song_to_playlist(yt_playlist_id, video_id)
        
        return {"message": f"Playlist '{yt_playlist_name}' created on YouTube with {len(    )} tracks."}
    except Exception as e:
        return {"error": str(e)}
    