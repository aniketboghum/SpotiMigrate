from fastapi import FastAPI
from routes.spotify import spotify_router

app = FastAPI()

app.include_router(router=spotify_router, prefix='/spotify', tags=['SPOTIFY'])
