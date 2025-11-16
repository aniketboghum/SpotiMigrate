from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.messages import HumanMessage
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import os 

load_dotenv()

class SongResponse(BaseModel):
    name: str = Field(..., description="The name of the song.")
    artists: list[str] = Field(..., description="The artists of the song.")
    album: str = Field(..., description="The album of the song.")

class PlaylistResponse(BaseModel):
    tracks: list[SongResponse] = Field(..., description="A dictionary containing song names and their respective artists.")

current_playlist = None

def generate_playlist(mood: str, genre: str):
    api_key = os.getenv("GEMINI_API")

    model = ChatGoogleGenerativeAI(api_key=api_key, 
                                model="gemini-2.5-flash",
                                temperature=0.7,
                                max_output_tokens=1024)

    structured_llm = model.with_structured_output(schema=PlaylistResponse.model_json_schema(), method="json_schema")

    response = structured_llm.invoke([HumanMessage(content=f"give playlist of 20 {mood} {genre} songs.")])
    globals()['current_playlist'] = response

    return { "playlist" : response }

def get_playlist():
    return globals()['current_playlist']