// Text-to-Speech API Service
export interface TextToSpeechRequest {
  text: string;
  language?: string;
  slow?: boolean;
}

export class TextToSpeechService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async generateSpeech(request: TextToSpeechRequest): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          language: request.language || 'en',
          slow: request.slow || false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to generate speech');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Default instance
export const textToSpeechService = new TextToSpeechService();