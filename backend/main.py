from fastapi import FastAPI
from routes.spotify import spotify_router
from routes.youtube import youtube_router

app = FastAPI()

app.include_router(router=spotify_router, prefix='/spotify', tags=['SPOTIFY'])
app.include_router(router=youtube_router, prefix='/youtube', tags=['YOUTUBE'])  