import os
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from fastapi.responses import HTMLResponse

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

CLIENT_SECRET_FILE = "auth/youtube_client_secret.json"  # download from Google Cloud Console

REDIRECT_URI = f"{os.getenv("BACKEND_URL")}/youtube/callback"
TOKEN_PATH = "auth/youtube_token.json"


def get_auth_url():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent"  # always return refresh_token
    )
    return auth_url


def exchange_code_for_token(code: str):
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    flow.fetch_token(code=code)
    creds = flow.credentials

    with open(TOKEN_PATH, "w") as token_file:
        token_file.write(creds.to_json())

    # Create HTML response with token information
    access_token = creds.token if creds.token else ""
    refresh_token = creds.refresh_token if creds.refresh_token else ""
    expires_in = 3600  # Default expiry time

    html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <title>Authentication Success</title>
  </head>
  <body>
    <script>
      window.opener.postMessage({{
        type: 'YOUTUBE_AUTH_SUCCESS',
      }}, 'http://localhost:3000'); // Your frontend URL
      window.close();
    </script>
    <p>Authentication successful! This window will close automatically.</p>
  </body>
</html>"""
    
    return HTMLResponse(content=html_content)


def get_credentials():
    if not os.path.exists(TOKEN_PATH):
        return None

    creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    return creds
