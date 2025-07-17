# AI Text-to-Speech Application Setup

This is a full-stack text-to-speech application built with React TypeScript frontend and FastAPI backend using Google Text-to-Speech (gTTS).

## Features

🎙️ **AI-Powered Speech Generation** - Convert any text into natural-sounding speech  
🎵 **Audio Playback** - Built-in player to preview generated speech  
⬇️ **Download Support** - Save generated audio as MP3 files  
🎨 **Modern UI** - Beautiful gradient design with smooth animations  
📱 **Responsive Design** - Works perfectly on desktop and mobile  
🌐 **Multi-language Support** - Generate speech in multiple languages  

## Frontend Setup (Current Application)

The frontend is already set up and running. Key features:
- React TypeScript with Vite
- Tailwind CSS with custom AI theme
- shadcn/ui components
- Modern gradient design with animations
- Audio player integration

## Backend Setup (FastAPI + gTTS)

### 1. Install Python Dependencies

```bash
pip install fastapi uvicorn gtts python-multipart
```

### 2. Run the Backend Server

Use the provided `backend_example.py` file:

```bash
# Start the FastAPI server
uvicorn backend_example:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 3. API Endpoints

- `POST /api/text-to-speech` - Generate speech from text
- `GET /health` - Health check endpoint
- `GET /` - API status

### 4. Request Format

```json
{
  "text": "Your text to convert to speech",
  "language": "en",
  "slow": false
}
```

## Full Stack Integration

### Frontend Configuration

The frontend is configured to connect to the FastAPI backend at `http://localhost:8000`. You can modify the base URL in `src/services/textToSpeechService.ts`.

### CORS Setup

The backend includes CORS middleware to allow requests from the frontend. Update the allowed origins in `backend_example.py` if your frontend runs on a different port.

## Usage

1. **Start the backend server** (FastAPI with gTTS)
2. **Start the frontend** (automatically available in Lovable)
3. **Enter your text** in the large text area
4. **Click "Generate Speech"** to create audio
5. **Play and download** the generated speech

## Customization

### Adding More Languages

Modify the backend to accept different language codes:

```python
# Supported languages: en, es, fr, de, it, pt, ru, ja, ko, zh, etc.
tts = gTTS(text=request.text, lang=request.language, slow=request.slow)
```

### Voice Speed Control

The backend already supports slow speech. You can extend this with more speed options.

### Audio Quality

For higher quality audio, consider integrating with:
- Azure Cognitive Services
- Amazon Polly
- Google Cloud Text-to-Speech API

## Example Scripts

The application comes pre-loaded with a meditation script, but you can use it for:
- Meditation and mindfulness guides
- Audiobook narration
- Language learning materials
- Accessibility applications
- Content creation

## Production Deployment

### Frontend
Deploy the React app to Vercel, Netlify, or similar platforms.

### Backend
Deploy the FastAPI server to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

Make sure to update the API base URL in the frontend service configuration.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration includes your frontend URL
2. **Audio Not Playing**: Check browser permissions for audio playback
3. **Large Text Timeouts**: Consider implementing chunking for very long texts
4. **Rate Limiting**: gTTS has usage limits; implement proper error handling

### Development Tips

- Use the browser's developer tools to monitor network requests
- Check the FastAPI automatic documentation at `http://localhost:8000/docs`
- Monitor server logs for debugging backend issues

## License

This project is open source and available under the MIT License.