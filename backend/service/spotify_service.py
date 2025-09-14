import auth.spotify_auth as spotify_auth  

def get_spotify_playlists():
    if not spotify_auth.current_spotify_user:
        return {"error": "User not authenticated"}

    response = spotify_auth.current_spotify_user.current_user_playlists()

    playlists = []
    for item in response["items"]:
        playlists.append({
            "id": item["id"],
            "name": item["name"],
        }) 

    return { 'playlists' : playlists }

def get_playlist_tracks(playlist_id: str):
    sp = spotify_auth.current_spotify_user
    if not sp:
        return {"error": "User not authenticated"}

    tracks = []
    results = sp.playlist_items(playlist_id, limit=100)  # first page

    while results:
        for item in results["items"]:
            track = item["track"]
            if track:  # skip if null (sometimes happens)
                tracks.append({
                    "id": track["id"],
                    "name": track["name"],
                    "artists": [artist["name"] for artist in track["artists"]],
                    "album": track["album"]["name"],
                    "duration_ms": track["duration_ms"],
                    "uri": track["uri"],
                })

        if results["next"]:  # pagination
            results = sp.next(results)
        else:
            results = None

    return {"tracks": tracks}