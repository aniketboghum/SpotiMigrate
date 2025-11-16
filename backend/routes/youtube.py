import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse, HTMLResponse, StreamingResponse
from pydantic import BaseModel
import auth.youtube_auth as youtube_auth
from service import ai_service
from service import spotify_service
import service.youtube_service as youtube_service
import asyncio
import json

load_dotenv()

youtube_router = APIRouter()

# Pydantic model for request body
class PlaylistMigrationRequest(BaseModel):
    sp_playlistId: str
    yt_playlist_name: str
    is_ai_playlist: bool

@youtube_router.get("/login")
def login():
    auth_url = youtube_auth.get_auth_url()
    return RedirectResponse(auth_url)

@youtube_router.post("/logout")
def logout():
    """Clear YouTube credentials from memory"""
    youtube_auth.clear_credentials()
    return {"message": "Successfully logged out from YouTube"}

@youtube_router.get("/status")
def get_auth_status():
    """Check if user is authenticated with YouTube"""
    is_auth = youtube_auth.is_authenticated()
    return {"authenticated": is_auth}

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
                                  }}, '{os.getenv("FRONTEND_URL")}');
                                  window.close();
                                </script>
                                <p>Authentication failed: {error}</p>
                              </body>
                            </html>"""
        return HTMLResponse(content=html_content)
    
    if not code:
        html_content = f"""<!DOCTYPE html>
                            <html>
                              <head>
                                <title>Authentication Error</title>
                              </head>
                              <body>
                                <script>
                                  window.opener.postMessage({{
                                    type: 'YOUTUBE_AUTH_ERROR',
                                    error: 'Authorization code not found in callback.'
                                  }}, '{os.getenv("FRONTEND_URL")}');
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
      }}, '{os.getenv("FRONTEND_URL")}');
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

@youtube_router.post("/playlists/stream")
async def create_playlists_with_progress(request: PlaylistMigrationRequest):
    async def generate_progress():
        try:
            # Send initial progress
            yield f"data: {json.dumps({'progress': 0, 'status': 'Starting migration...', 'current_track': '', 'total_tracks': 0})}\n\n"
            
            # Create a new YouTube playlist
            yield f"data: {json.dumps({'progress': 5, 'status': 'Creating YouTube playlist...', 'current_track': '', 'total_tracks': 0})}\n\n"
            yt_playlist_id = youtube_service.create_playlist(request.yt_playlist_name)
            
            # Get tracks from the specified Spotify playlist
            yield f"data: {json.dumps({'progress': 10, 'status': 'Fetching Spotify tracks...', 'current_track': '', 'total_tracks': 0})}\n\n"
            
            if request.is_ai_playlist:
              sp_tracks = ai_service.get_playlist()
              print(sp_tracks)
            else:
              sp_tracks = spotify_service.get_playlist_tracks(request.sp_playlistId)

            tracks_added = 0
            total_tracks = len(sp_tracks['tracks']) if sp_tracks and sp_tracks['tracks'] else 0
            
            if sp_tracks and sp_tracks['tracks']:
                yield f"data: {json.dumps({'progress': 15, 'status': f'Found {total_tracks} tracks to migrate', 'current_track': '', 'total_tracks': total_tracks})}\n\n"
                
                for i, track in enumerate(sp_tracks['tracks']):
                    track_name = track["name"]
                    artist_names = ", ".join(track["artists"])
                    current_track = f"{track_name} - {artist_names}"
                    
                    # Calculate progress (15% to 90% for track processing)
                    progress = 15 + int((i / total_tracks) * 75)
                    
                    yield f"data: {json.dumps({'progress': progress, 'status': 'Processing track...', 'current_track': current_track, 'total_tracks': total_tracks, 'processed': i + 1})}\n\n"

                    query = f"{track_name} {artist_names}"
                    print(f"Searching YouTube for: {query}")

                    video_id = youtube_service.search_song(query)
                    if video_id:
                        youtube_service.add_song_to_playlist(yt_playlist_id, video_id)
                        tracks_added += 1
                        yield f"data: {json.dumps({'progress': progress, 'status': 'Track added successfully', 'current_track': current_track, 'total_tracks': total_tracks, 'processed': i + 1, 'tracks_added': tracks_added})}\n\n"
                    else:
                        yield f"data: {json.dumps({'progress': progress, 'status': 'Track not found on YouTube', 'current_track': current_track, 'total_tracks': total_tracks, 'processed': i + 1, 'tracks_added': tracks_added})}\n\n"
                    
                    # Small delay to make progress visible
                    await asyncio.sleep(0.1)
            
            # Send completion
            yield f"data: {json.dumps({'progress': 100, 'status': 'Migration completed!', 'current_track': '', 'total_tracks': total_tracks, 'tracks_added': tracks_added, 'playlist_id': yt_playlist_id, 'completed': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'progress': 0, 'status': 'Error occurred', 'error': str(e), 'completed': True})}\n\n"
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    )