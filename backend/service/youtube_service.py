from googleapiclient.discovery import build
from auth.youtube_auth import get_credentials

youtube_client : any = None

def get_youtube_client():
    creds = get_credentials()
    if not creds:
        raise Exception("User not authenticated with YouTube yet. Please login first.")
    
    global youtube_client
    if youtube_client:
        return youtube_client
    youtube_client = build("youtube", "v3", credentials=creds)
    return youtube_client


def create_playlist(name: str, description: str = "Imported from Spotify"):
    youtube = get_youtube_client()
    request = youtube.playlists().insert(
        part="snippet,status",
        body={
            "snippet": {"title": name, "description": description},
            "status": {"privacyStatus": "private"}
        }
    )
    response = request.execute()
    return response["id"]


def search_song(query: str):
    try:
        youtube = get_youtube_client()
        request = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            maxResults=1
        )
        response = request.execute()
        if response["items"]:
            return response["items"][0]["id"]["videoId"]
    except Exception as e:
        return { "error" : f"Error searching for '{query}' in youtube: {e}" }


def add_song_to_playlist(playlist_id: str, video_id: str):
    try:
        youtube = get_youtube_client()
        request = youtube.playlistItems().insert(
            part="snippet",
            body={
                "snippet": {
                    "playlistId": playlist_id,
                    "resourceId": {"kind": "youtube#video", "videoId": video_id}
                }
            }
        )
        return request.execute()
    except Exception as e:
        return { "error" : "Error adding video {video_id} to playlist {playlist_id}: {e}" }

