import { useState, useEffect } from 'react'
import { Button } from "/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, StopCircle } from 'lucide-react'

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [isSupported, setIsSupported] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    // Check if the Web Speech API is supported
    if (!('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Set default voice to English if available
      const defaultVoice = availableVoices.find(voice => voice.lang.includes('en')) || availableVoices[0]
      setSelectedVoice(defaultVoice || null)
    }

    // Some browsers need this event to populate voices
    window.speechSynthesis.onvoiceschanged = loadVoices
    loadVoices()

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = () => {
    if (!text.trim() || !selectedVoice) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.lang = selectedVoice.lang
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleVoiceChange = (lang: string) => {
    const voice = voices.find(v => v.lang === lang)
    if (voice) {
      setSelectedVoice(voice)
      setLanguage(lang)
    }
  }

  if (!isSupported) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Text-to-Speech</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            Your browser doesn't support the Web Speech API. Please try Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Text-to-Speech</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to speak..."
          className="min-h-[120px]"
        />

        <div className="space-y-2">
          <Label>Select Voice</Label>
          <Select value={language} onValueChange={handleVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.lang}>
                  {`${voice.name} (${voice.lang})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          onClick={speak}
          disabled={!text.trim() || isSpeaking}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Speak
        </Button>
        <Button
          variant="destructive"
          onClick={stop}
          disabled={!isSpeaking}
          className="gap-2"
        >
          <StopCircle className="h-4 w-4" />
          Stop
        </Button>
      </CardFooter>
    </Card>
  )
}
