"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react"

interface VoiceCallInterfaceProps {
  topic: string
  onCallEnd: (callData: any) => void
}

// Declare SpeechRecognitionStatic interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    start: () => void
    stop: () => void
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
  }
  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult
    length: number
  }
  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
    length: number
  }
  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: SpeechRecognitionError
  }
  type SpeechRecognitionError =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported"
}

export function VoiceCallInterface({ topic, onCallEnd }: VoiceCallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string; timestamp: Date }>>([])
  const [currentUserText, setCurrentUserText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const callStartTime = useRef<Date | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const recognition = useRef<SpeechRecognition | null>(null)
  const synthesis = useRef<SpeechSynthesis | null>(null)
  const conversationHistory = useRef<Array<{ role: string; content: string }>>([])

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if (typeof window !== "undefined") {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = true
        recognition.current.interimResults = true
        recognition.current.lang = "en-US"

        recognition.current.onstart = () => {
          console.log("Speech recognition started")
          setIsListening(true)
          setError(null)
        }

        recognition.current.onresult = (event) => {
          console.log("Speech recognition result:", event)
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            console.log("Final transcript:", finalTranscript)
            setCurrentUserText("")
            handleUserMessage(finalTranscript.trim())
          } else {
            setCurrentUserText(interimTranscript)
          }
        }

        recognition.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          let errorMessage = `Speech recognition error: ${event.error}`

          switch (event.error) {
            case "no-speech":
              errorMessage = "No speech detected. Please speak louder or check your microphone."
              break
            case "audio-capture":
              errorMessage = "Microphone not accessible. Please check your microphone connection."
              break
            case "not-allowed":
              errorMessage = "Microphone access denied. Please allow microphone access in your browser."
              break
            case "network":
              errorMessage = "Network error. Please check your internet connection."
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }

          setError(errorMessage)
          setIsListening(false)
        }

        recognition.current.onend = () => {
          console.log("Speech recognition ended")
          setIsListening(false)
          // Restart listening if call is still active and not muted
          if (isCallActive && !isMuted && !isSpeaking) {
            console.log("Restarting speech recognition...")
            setTimeout(() => {
              startListening()
            }, 500)
          }
        }
      } else {
        setError("Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.")
      }

      // Speech Synthesis
      synthesis.current = window.speechSynthesis
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
      if (recognition.current) {
        recognition.current.stop()
      }
      if (synthesis.current) {
        synthesis.current.cancel()
      }
    }
  }, [])

  const startListening = () => {
    if (recognition.current && !isListening && !isMuted && !isSpeaking) {
      try {
        console.log("Starting speech recognition...")
        recognition.current.start()
        setError(null)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setError("Failed to start speech recognition. Please try again.")
      }
    } else {
      console.log("Cannot start listening:", {
        hasRecognition: !!recognition.current,
        isListening,
        isMuted,
        isSpeaking,
      })
    }
  }

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthesis.current) {
      // Cancel any ongoing speech
      synthesis.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      // Try to use a female voice
      const voices = synthesis.current.getVoices()
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("emma") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("karen"),
      )

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onstart = () => {
        setIsSpeaking(true)
        stopListening() // Stop listening while AI is speaking
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        // Resume listening after AI finishes speaking
        if (isCallActive && !isMuted) {
          setTimeout(() => {
            startListening()
          }, 500)
        }
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error)
        setIsSpeaking(false)
        setError(`Speech synthesis error: ${event.error}`)
      }

      synthesis.current.speak(utterance)
    }
  }

  const handleUserMessage = async (userText: string) => {
    if (!userText.trim()) return

    const userMessage = {
      role: "user",
      text: userText,
      timestamp: new Date(),
    }

    setTranscript((prev) => [...prev, userMessage])
    conversationHistory.current.push({ role: "user", content: userText })

    try {
      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory.current.slice(-10), // Last 10 messages for context
          topic,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      const aiResponse = data.response

      const aiMessage = {
        role: "assistant",
        text: aiResponse,
        timestamp: new Date(),
      }

      setTranscript((prev) => [...prev, aiMessage])
      conversationHistory.current.push({ role: "assistant", content: aiResponse })

      // Speak the AI response
      speak(aiResponse)
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage = "I'm sorry, I'm having trouble understanding right now. Could you please try again?"

      const aiMessage = {
        role: "assistant",
        text: errorMessage,
        timestamp: new Date(),
      }

      setTranscript((prev) => [...prev, aiMessage])
      speak(errorMessage)
    }
  }

  const startCall = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if speech recognition is available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
      }

      // Request microphone permission explicitly
      console.log("Requesting microphone permission...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach((track) => track.stop())
      console.log("Microphone permission granted")

      // Test speech recognition setup
      if (!recognition.current) {
        throw new Error("Speech recognition failed to initialize")
      }

      // Start call via API
      const response = await fetch("/api/voice/start-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        throw new Error("Failed to start call")
      }

      setIsCallActive(true)
      setIsConnecting(false)
      callStartTime.current = new Date()

      // Start duration timer
      durationInterval.current = setInterval(() => {
        if (callStartTime.current) {
          const duration = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000)
          setCallDuration(duration)
        }
      }, 1000)

      // AI greeting
      const greeting = getGreeting(topic)
      const aiMessage = {
        role: "assistant",
        text: greeting,
        timestamp: new Date(),
      }

      setTranscript([aiMessage])
      conversationHistory.current = [{ role: "assistant", content: greeting }]

      // Speak greeting and then start listening
      speak(greeting)
    } catch (error) {
      console.error("Error starting call:", error)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setError("Microphone access denied. Please allow microphone access and try again.")
        } else if (error.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
        } else {
          setError(error.message)
        }
      } else {
        setError("Failed to start call. Please check your microphone permissions.")
      }
      setIsConnecting(false)
    }
  }

  const endCall = async () => {
    setIsCallActive(false)
    stopListening()

    if (synthesis.current) {
      synthesis.current.cancel()
    }

    if (durationInterval.current) {
      clearInterval(durationInterval.current)
    }

    const callData = {
      duration: callDuration,
      transcript,
      topic,
      endedAt: new Date(),
    }

    // Save call data
    try {
      await fetch("/api/voice/end-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(callData),
      })
    } catch (error) {
      console.error("Error saving call data:", error)
    }

    onCallEnd(callData)
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    if (newMutedState) {
      stopListening()
    } else if (isCallActive && !isSpeaking) {
      startListening()
    }
  }

  const getGreeting = (topic: string) => {
    const greetings = {
      "job-interview":
        "Hi! I'm Emma, your English conversation coach. I'm excited to help you practice job interview skills today. Let's start with a simple question: Can you tell me a bit about yourself?",
      travel:
        "Hello! I'm Emma, and I'm here to help you practice English for travel situations. Imagine you're at an airport or hotel - what would you like to practice first?",
      "daily-talk":
        "Hi there! I'm Emma, your friendly English coach. Let's have a casual conversation today. How has your day been so far?",
      business:
        "Good day! I'm Emma, and I'll be helping you practice business English today. Let's imagine we're in a professional meeting. How would you introduce yourself?",
      general:
        "Hello! I'm Emma, your English conversation partner. I'm here to help you practice speaking naturally. What would you like to talk about today?",
    }

    return greetings[topic as keyof typeof greetings] || greetings.general
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></div>
            Voice Conversation with Emma
          </CardTitle>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{topic.replace("-", " ")}</Badge>
            {isCallActive && <span className="font-mono">{formatDuration(callDuration)}</span>}
            {isListening && <Badge className="bg-red-500">🎤 Listening</Badge>}
            {isSpeaking && <Badge className="bg-blue-500">🔊 Emma Speaking</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            {!isCallActive ? (
              <Button
                onClick={startCall}
                disabled={isConnecting}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 mr-2" />
                    Start Voice Call
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button onClick={toggleMute} variant={isMuted ? "destructive" : "secondary"} size="lg">
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button onClick={endCall} variant="destructive" size="lg" className="px-8">
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </div>
            )}
          </div>

          {/* Current Speech Display */}
          {currentUserText && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>You're saying:</strong> {currentUserText}
              </p>
            </div>
          )}

          {/* Live Transcript */}
          {isCallActive && (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">Live Conversation</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                {transcript.length === 0 ? (
                  <p className="text-center text-muted-foreground">Conversation will appear here...</p>
                ) : (
                  transcript.map((message, index) => (
                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.role === "user" ? "bg-blue-500 text-white" : "bg-white border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{message.role === "user" ? "You" : "Emma"}</span>
                          {message.role === "assistant" && <Volume2 className="w-3 h-3" />}
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isCallActive && (
            <div className="text-center space-y-4 text-sm text-muted-foreground">
              <p>Click "Start Voice Call" to begin speaking with Emma</p>
              <p>Make sure your microphone is enabled and you're in a quiet environment</p>
              <p>Emma will speak to you and listen to your responses in real-time</p>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    stream.getTracks().forEach((track) => track.stop())
                    setError(null)
                    alert("Microphone test successful! You can start the call.")
                  } catch (error) {
                    console.error("Microphone test failed:", error)
                    if (error instanceof Error) {
                      setError(`Microphone test failed: ${error.message}`)
                    }
                  }
                }}
              >
                Test Microphone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
