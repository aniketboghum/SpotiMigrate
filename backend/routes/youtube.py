from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse
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
    error = request.query_params.get("error")
    
    if error:
        # Handle OAuth error
        html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <title>Authentication Error</title>
  </head>
  <body>
    <script>
      window.opener.postMessage({{
        type: 'YOUTUBE_AUTH_ERROR',
        error: '{error}'
      }}, 'http://localhost:3000');
      window.close();
    </script>
    <p>Authentication failed: {error}</p>
  </body>
</html>"""
        return HTMLResponse(content=html_content)
    
    if not code:
        html_content = """<!DOCTYPE html>
<html>
  <head>
    <title>Authentication Error</title>
  </head>
  <body>
    <script>
      window.opener.postMessage({{
        type: 'YOUTUBE_AUTH_ERROR',
        error: 'Authorization code not found in callback.'
      }}, 'http://localhost:3000');
      window.close();
    </script>
    <p>Authentication failed: Authorization code not found in callback.</p>
  </body>
</html>"""
        return HTMLResponse(content=html_content)
    
    try:
        return youtube_auth.exchange_code_for_token(code)
    except Exception as e:
        html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <title>Authentication Error</title>
  </head>
  <body>
    <script>
      window.opener.postMessage({{
        type: 'YOUTUBE_AUTH_ERROR',
        error: '{str(e)}'
      }}, 'http://localhost:3000');
      window.close();
    </script>
    <p>Authentication failed: {str(e)}</p>
  </body>
</html>"""
        return HTMLResponse(content=html_content)

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
    