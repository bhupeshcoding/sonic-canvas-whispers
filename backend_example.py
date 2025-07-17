# FastAPI Backend Example for Text-to-Speech
# pip install fastapi uvicorn gtts python-multipart

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from gtts import gTTS
import tempfile
import os
from typing import Optional

app = FastAPI(title="AI Text-to-Speech API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "en"
    slow: bool = False

@app.post("/api/text-to-speech")
async def generate_speech(request: TextToSpeechRequest):
    """
    Convert text to speech using Google Text-to-Speech (gTTS)
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Create a temporary file for the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            temp_filename = temp_file.name
        
        # Generate speech using gTTS
        tts = gTTS(
            text=request.text,
            lang=request.language,
            slow=request.slow
        )
        
        # Save the audio to the temporary file
        tts.save(temp_filename)
        
        # Return the audio file
        return FileResponse(
            temp_filename,
            media_type="audio/mpeg",
            filename="generated_speech.mp3",
            background=lambda: os.unlink(temp_filename)  # Clean up temp file after response
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AI Text-to-Speech API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# To run the server:
# uvicorn backend_example:app --reload --host 0.0.0.0 --port 8000