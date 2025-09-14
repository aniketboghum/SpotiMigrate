from googleapiclient.discovery import build
from auth.youtube_auth import get_credentials


def get_youtube_client():
    creds = get_credentials()
    if not creds:
        raise Exception("User not authenticated with YouTube yet. Please login first.")
    return build("youtube", "v3", credentials=creds)


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
    return None


def add_song_to_playlist(playlist_id: str, video_id: str):
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
