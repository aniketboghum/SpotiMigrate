import os
import json
from datetime import datetime
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from fastapi.responses import HTMLResponse

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

REDIRECT_URI = f"{os.getenv("BACKEND_URL")}/youtube/callback"

client_config = { "web": {
                          "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                          "project_id": os.getenv("GOOGLE_PROJECT_ID"),
                          "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
                          "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
                          "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER"),
                          "client_secret": os.getenv("GOOGLE_CLIENT_SECRET")}}

# Global variable to store YouTube credentials in memory
youtube_credentials = None

def get_auth_url():
    flow = Flow.from_client_config(
        client_config=client_config,
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
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Store credentials in memory as JSON instead of file
    global youtube_credentials
    youtube_credentials = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "token_uri": creds.token_uri,
        "scopes": creds.scopes,
        "expiry": creds.expiry.isoformat() if creds.expiry else None
    }

    html_content = f"""<!DOCTYPE html>
<html>
  <head>
    <title>Authentication Success</title>
  </head>
  <body>
    <script>
      window.opener.postMessage({{
        type: 'YOUTUBE_AUTH_SUCCESS',
      }}, '{os.getenv("FRONTEND_URL")}'); // Your frontend URL
      window.close();
    </script>
    <p>Authentication successful! This window will close automatically.</p>
  </body>
</html>"""
    
    return HTMLResponse(content=html_content)


def get_credentials():
    global youtube_credentials
    
    # Check if we have credentials stored in memory
    if not youtube_credentials:
        return None

    # Create credentials from the stored JSON info
    creds = Credentials.from_authorized_user_info(
        info=youtube_credentials, 
        scopes=SCOPES
    )

    # Refresh token if expired
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        
        # Update the stored credentials with new token info
        youtube_credentials.update({
            "token": creds.token,
            "expiry": creds.expiry.isoformat() if creds.expiry else None
        })

    return creds


def clear_credentials():
    """Clear stored YouTube credentials from memory"""
    global youtube_credentials
    youtube_credentials = None


def is_authenticated():
    """Check if user is authenticated with YouTube"""
    global youtube_credentials
    return youtube_credentials is not None
