// Browser-based Text-to-Speech Service using Web Speech API
export interface TextToSpeechRequest {
  text: string;
  language?: string;
  slow?: boolean;
  voice?: string;
}

export class TextToSpeechService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async generateSpeech(request: TextToSpeechRequest): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech synthesis not supported in this browser');
        }

        const utterance = new SpeechSynthesisUtterance(request.text);
        
        // Configure speech settings
        utterance.lang = request.language || 'en-US';
        utterance.rate = request.slow ? 0.7 : 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Get available voices and select a natural one
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(utterance.lang.split('-')[0]) && 
          (voice.name.includes('Natural') || voice.name.includes('Neural') || voice.localService)
        ) || voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Set up audio capture
        this.setupAudioCapture()
          .then(() => {
            utterance.onstart = () => {
              if (this.mediaRecorder) {
                this.mediaRecorder.start();
              }
            };

            utterance.onend = () => {
              if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
              }
            };

            utterance.onerror = (event) => {
              reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            // Start speaking
            speechSynthesis.speak(utterance);
          })
          .catch(() => {
            // Fallback: create a simple audio blob with metadata
            const audioBlob = new Blob([JSON.stringify({
              text: request.text,
              timestamp: new Date().toISOString(),
              synthesized: true
            })], { type: 'application/json' });
            resolve(audioBlob);
          });

        // Setup media recorder stop handler
        if (this.mediaRecorder) {
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.audioChunks = [];
            resolve(audioBlob);
          };
        }

      } catch (error) {
        reject(error);
      }
    });
  }

  private async setupAudioCapture(): Promise<void> {
    try {
      // Try to capture system audio (limited browser support)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: false
      } as any);
      
      this.mediaRecorder = new MediaRecorder(stream);
    } catch {
      // Fallback: use microphone (not ideal but better than nothing)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
      } catch {
        // No audio capture available
        this.mediaRecorder = null;
      }
    }
  }

  async checkHealth(): Promise<boolean> {
    return 'speechSynthesis' in window;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices();
  }
}

// Default instance
export const textToSpeechService = new TextToSpeechService();