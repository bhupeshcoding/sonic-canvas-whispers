import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Download, Wand2, Volume2, Loader2 } from "lucide-react";
import { textToSpeechService } from "@/services/textToSpeechService";

const TextToSpeechApp = () => {
  const [text, setText] = useState(`Welcome.

This is your gentle body scan — a 5-minute journey to relax your body and release tension, one breath and one body part at a time.

Let's begin by finding a comfortable position.
You may sit or lie down.
Allow your arms to rest gently at your sides, and if you feel safe, softly close your eyes.

Take a deep breath in…
And slowly breathe out…
Let's do that again — inhale…
And exhale.

Now, bring your attention to the very top of your head.
Feel the gentle space around your scalp and forehead.
Notice if there's any tightness, and if there is — just soften it.
Let it melt away with your breath.`);
  
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);
    try {
      const blob = await textToSpeechService.generateSpeech({ text });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      toast({
        title: "Speech generated successfully!",
        description: "Your audio is ready.",
      });
      return url;
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Unable to generate speech. Please try again.",
        variant: "destructive",
      });
      console.error('Error generating speech:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndPlay = async () => {
    const url = await generateSpeech();
    if (url && audioRef.current) {
      audioRef.current.play();
    }
  };

  const generateAndDownload = async () => {
    const url = await generateSpeech();
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated-speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'generated-speech.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-2xl shadow-glow animate-float">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Text to Speech
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your scripts, meditations, and stories into natural-sounding speech with AI-powered voice generation.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="bg-gradient-card backdrop-blur-xl border-ai-primary/20 shadow-ai p-6 md:p-8">
          <div className="space-y-6">
            {/* Text Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Your Script or Text
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text, script, or meditation guide here..."
                className="min-h-[300px] bg-background/50 border-ai-primary/20 focus:border-ai-primary/40 text-foreground placeholder:text-muted-foreground resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {text.length} characters
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generateAndPlay}
                disabled={isLoading || !text.trim()}
                variant="ai"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Read
                  </>
                )}
              </Button>

              <Button
                onClick={generateAndDownload}
                disabled={isLoading || !text.trim()}
                variant="aiSecondary"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Audio
                  </>
                )}
              </Button>
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-background/30 rounded-lg border border-ai-primary/20">
                  <Button
                    onClick={togglePlayback}
                    variant="aiSecondary"
                    size="icon"
                    className="rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Generated Speech</div>
                    <div className="text-xs text-muted-foreground">Ready to play</div>
                  </div>

                  <Button
                    onClick={downloadAudio}
                    variant="aiSecondary"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={handleAudioEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Powered by Google Text-to-Speech (gTTS) via FastAPI backend
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
            <span>High-quality voice synthesis</span>
            <span>•</span>
            <span>Multiple language support</span>
            <span>•</span>
            <span>Natural pronunciation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechApp;