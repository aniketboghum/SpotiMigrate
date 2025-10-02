from fastapi import Request
from fastapi.responses import HTMLResponse, RedirectResponse
import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

spotify_client_id = os.getenv("SPOTIPY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIPY_CLIENT_SECRET")
spotify_redirect_uri = os.getenv("SPOTIPY_REDIRECT_URI")


current_spotify_user = None  # global Spotify client
auth_manager = None

def login():
    print(spotify_redirect_uri)

    global auth_manager
    # configure Spotify OAuth once
    auth_manager = SpotifyOAuth(
        client_id=spotify_client_id,
        client_secret=spotify_client_secret,
        redirect_uri=spotify_redirect_uri,
        scope="playlist-read-private user-library-read",
        cache_path=".cache"  # stores tokens for refresh
    )

    auth_url = auth_manager.get_authorize_url()
    return auth_url

def callback(request: Request):
  try:
    code = request.query_params.get("code")
    if not code:
        return {"error": "Missing code in callback"}

    # Get tokens
    token_info = auth_manager.get_access_token(code, as_dict=True)

    global current_spotify_user
    current_spotify_user = spotipy.Spotify(auth=token_info["access_token"])


    html_content = f"""<!DOCTYPE html>
                        <html>
                          <head>
                            <title>Authentication Success</title>
                          </head>
                          <body>
                            <script>
                              window.opener.postMessage({{
                                type: 'SPOTIFY_AUTH_SUCCESS',
                              }}, 'http://localhost:3000'); // Allow any origin for the parent window
                              window.close();
                            </script>
                            <p>Authentication successful! This window will close automatically.</p>
                          </body>
                        </html>"""
    return HTMLResponse(content=html_content)
  except Exception as e:
    html_content = html_content = f"""<!DOCTYPE html>
                        <html>
                          <head>
                            <title>Authentication Success</title>
                          </head>
                          <body>
                            <script>
                              window.opener.postMessage({{
                                type: 'SPOTIFY_AUTH_ERROR',
                              }}, 'http://localhost:3000'); // Allow any origin for the parent window
                              window.close();
                            </script>
                            <p>Authentication successful! This window will close automatically.</p>
                          </body>
                        </html>"""
    return HTMLResponse(content=html_content)