// Browser-based Text-to-Speech Service using Web Speech API with FFmpeg
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface TextToSpeechRequest {
  text: string;
  language?: string;
  slow?: boolean;
  voice?: string;
}

export class TextToSpeechService {
  private ffmpeg: FFmpeg | null = null;
  private isFFmpegLoaded = false;

  private async loadFFmpeg() {
    if (this.isFFmpegLoaded) return;
    
    try {
      this.ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      this.isFFmpegLoaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
    }
  }

  private findMacGirlVoice(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    
    // Priority order for Mac girl voices (US English female voices)
    const preferredVoices = [
      'Samantha',     // Classic Mac female voice
      'Victoria',     // Another good Mac female voice  
      'Allison',      // Female voice
      'Ava',          // Female voice
      'Susan',        // Female voice
      'Fiona',        // Female voice
      'Karen',        // Female voice
    ];

    // First try to find exact matches for Mac voices
    for (const preferredName of preferredVoices) {
      const voice = voices.find(v => 
        v.name === preferredName && 
        (v.lang === 'en-US' || v.lang.startsWith('en'))
      );
      if (voice) {
        console.log(`Found preferred voice: ${voice.name}`);
        return voice;
      }
    }

    // Fallback to any English female voice
    const femaleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('female') || 
       v.name.toLowerCase().includes('woman') ||
       v.name.toLowerCase().includes('samantha') ||
       v.name.toLowerCase().includes('victoria') ||
       v.name.toLowerCase().includes('allison'))
    );
    
    if (femaleVoice) {
      console.log(`Found female voice: ${femaleVoice.name}`);
      return femaleVoice;
    }

    // Last resort - any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      console.log(`Found English voice: ${englishVoice.name}`);
      return englishVoice;
    }

    return voices[0] || null;
  }

  async generateSpeech(request: TextToSpeechRequest): Promise<Blob> {
    // Initialize FFmpeg
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg();
    }
    await this.loadFFmpeg();

    return new Promise((resolve, reject) => {
      try {
        // Check if speech synthesis is supported
        if (!('speechSynthesis' in window)) {
          throw new Error('Speech synthesis not supported in this browser');
        }

        // Wait for voices to be loaded
        const initializeVoices = () => {
          const utterance = new SpeechSynthesisUtterance(request.text);
          
          // Set Mac girl voice
          const macVoice = this.findMacGirlVoice();
          if (macVoice) {
            utterance.voice = macVoice;
          }

          // Configure speech settings for natural female voice
          utterance.lang = request.language || 'en-US';
          utterance.rate = request.slow ? 0.7 : 0.9; // Slightly slower for clarity
          utterance.pitch = 1.1; // Higher pitch for female voice
          utterance.volume = 1.0;

          // Create audio context for high-quality recording
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioContext.createMediaStreamDestination();
          
          // Use better codec for recording
          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: 'audio/webm;codecs=opus'
          });

          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            try {
              const webmBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              if (this.isFFmpegLoaded && this.ffmpeg) {
                // Convert to MP3 using FFmpeg for better compatibility and download
                try {
                  await this.ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
                  await this.ffmpeg.exec([
                    '-i', 'input.webm',
                    '-acodec', 'libmp3lame',
                    '-ab', '192k',
                    '-ar', '44100',
                    '-ac', '2',
                    'output.mp3'
                  ]);
                  
                  const mp3Data = await this.ffmpeg.readFile('output.mp3') as Uint8Array;
                  const mp3Blob = new Blob([mp3Data], { type: 'audio/mp3' });
                  console.log('Successfully converted to MP3');
                  resolve(mp3Blob);
                } catch (ffmpegError) {
                  console.error('FFmpeg conversion failed, using WebM:', ffmpegError);
                  resolve(webmBlob);
                }
              } else {
                console.log('Using WebM format (FFmpeg not loaded)');
                resolve(webmBlob);
              }
            } catch (error) {
              console.error('Audio processing error:', error);
              reject(error);
            }
          };

          utterance.onstart = () => {
            console.log('Speech started with voice:', utterance.voice?.name || 'default');
            mediaRecorder.start();
          };

          utterance.onend = () => {
            console.log('Speech synthesis completed');
            setTimeout(() => {
              if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
              }
            }, 500); // Small delay to capture complete audio
          };

          utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            reject(new Error(`Speech synthesis error: ${event.error}`));
          };

          // Start speech synthesis
          speechSynthesis.speak(utterance);
        };

        // Check if voices are already loaded
        if (speechSynthesis.getVoices().length > 0) {
          initializeVoices();
        } else {
          // Wait for voices to load
          speechSynthesis.addEventListener('voiceschanged', initializeVoices, { once: true });
          // Fallback timeout
          setTimeout(initializeVoices, 1000);
        }

      } catch (error) {
        console.error('Generate speech error:', error);
        reject(error);
      }
    });
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