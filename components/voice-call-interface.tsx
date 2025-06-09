"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle } from "lucide-react"

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
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const callStartTime = useRef<Date | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const recognition = useRef<SpeechRecognition | null>(null)
  const synthesis = useRef<SpeechSynthesis | null>(null)
  const conversationHistory = useRef<Array<{ role: string; content: string }>>([])
  const shouldRestart = useRef(false)
  const restartTimeout = useRef<NodeJS.Timeout | null>(null)

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo((prev) => [...prev.slice(-4), `${timestamp}: ${message}`])
    console.log(`[Voice Debug] ${message}`)
  }

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if (typeof window !== "undefined") {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition()
        recognition.current.continuous = false // Changed to false for better control
        recognition.current.interimResults = true
        recognition.current.lang = "en-US"

        recognition.current.onstart = () => {
          addDebugInfo("Speech recognition started")
          setIsListening(true)
          setError(null)
        }

        recognition.current.onresult = (event) => {
          addDebugInfo(`Speech result received (${event.results.length} results)`)
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
            addDebugInfo(`Final transcript: "${finalTranscript}"`)
            setCurrentUserText("")
            handleUserMessage(finalTranscript.trim())
          } else {
            setCurrentUserText(interimTranscript)
          }
        }

        recognition.current.onerror = (event) => {
          addDebugInfo(`Speech recognition error: ${event.error}`)
          let errorMessage = `Speech recognition error: ${event.error}`

          switch (event.error) {
            case "no-speech":
              errorMessage = "No speech detected. Try speaking louder."
              // Don't show error for no-speech, just restart
              if (isCallActive && !isMuted && !isSpeaking) {
                shouldRestart.current = true
              }
              break
            case "audio-capture":
              errorMessage = "Microphone not accessible. Please check your microphone."
              break
            case "not-allowed":
              errorMessage = "Microphone access denied. Please allow microphone access."
              break
            case "network":
              errorMessage = "Network error. Please check your internet connection."
              break
            default:
              errorMessage = `Speech recognition error: ${event.error}`
          }

          if (event.error !== "no-speech") {
            setError(errorMessage)
          }
          setIsListening(false)
        }

        recognition.current.onend = () => {
          addDebugInfo("Speech recognition ended")
          setIsListening(false)

          // Restart listening if call is still active and not muted and not speaking
          if (isCallActive && !isMuted && !isSpeaking && shouldRestart.current) {
            addDebugInfo("Scheduling restart of speech recognition...")
            restartTimeout.current = setTimeout(() => {
              if (isCallActive && !isMuted && !isSpeaking) {
                startListening()
              }
            }, 1000)
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
      if (restartTimeout.current) {
        clearTimeout(restartTimeout.current)
      }
      if (recognition.current) {
        recognition.current.stop()
      }
      if (synthesis.current) {
        synthesis.current.cancel()
      }
    }
  }, [isCallActive, isMuted, isSpeaking])

  const startListening = () => {
    if (recognition.current && !isListening && !isMuted && !isSpeaking) {
      try {
        addDebugInfo("Attempting to start speech recognition...")
        shouldRestart.current = true
        recognition.current.start()
        setError(null)
      } catch (error) {
        addDebugInfo(`Error starting speech recognition: ${error}`)
        setError("Failed to start speech recognition. Please try again.")
      }
    } else {
      addDebugInfo(
        `Cannot start listening - hasRecognition: ${!!recognition.current}, isListening: ${isListening}, isMuted: ${isMuted}, isSpeaking: ${isSpeaking}`,
      )
    }
  }

  const stopListening = () => {
    if (recognition.current && isListening) {
      addDebugInfo("Stopping speech recognition...")
      shouldRestart.current = false
      if (restartTimeout.current) {
        clearTimeout(restartTimeout.current)
      }
      recognition.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthesis.current) {
      addDebugInfo(`AI starting to speak: "${text.substring(0, 50)}..."`)

      // Stop listening before speaking
      stopListening()

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
          voice.name.toLowerCase().includes("karen") ||
          voice.name.toLowerCase().includes("zira"),
      )

      if (femaleVoice) {
        utterance.voice = femaleVoice
        addDebugInfo(`Using voice: ${femaleVoice.name}`)
      }

      utterance.onstart = () => {
        addDebugInfo("AI speech started")
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        addDebugInfo("AI speech ended, will resume listening...")
        setIsSpeaking(false)

        // Resume listening after AI finishes speaking
        if (isCallActive && !isMuted) {
          setTimeout(() => {
            addDebugInfo("Resuming listening after AI speech...")
            startListening()
          }, 1000)
        }
      }

      utterance.onerror = (event) => {
        addDebugInfo(`Speech synthesis error: ${event.error}`)
        setIsSpeaking(false)
        setError(`Speech synthesis error: ${event.error}`)
      }

      synthesis.current.speak(utterance)
    }
  }

  const handleUserMessage = async (userText: string) => {
    if (!userText.trim()) return

    addDebugInfo(`Processing user message: "${userText}"`)

    // Stop listening while processing
    stopListening()

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

      addDebugInfo(`Got AI response: "${aiResponse.substring(0, 50)}..."`)

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
      addDebugInfo(`Error getting AI response: ${error}`)
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
    setDebugInfo([])

    try {
      addDebugInfo("Starting call...")

      // Check if speech recognition is available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
      }

      // Request microphone permission explicitly
      addDebugInfo("Requesting microphone permission...")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach((track) => track.stop())
      addDebugInfo("Microphone permission granted")

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

      addDebugInfo("Call started successfully")

      // Speak greeting and then start listening
      speak(greeting)
    } catch (error) {
      addDebugInfo(`Error starting call: ${error}`)
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
    addDebugInfo("Ending call...")
    setIsCallActive(false)
    shouldRestart.current = false
    stopListening()

    if (synthesis.current) {
      synthesis.current.cancel()
    }

    if (durationInterval.current) {
      clearInterval(durationInterval.current)
    }

    if (restartTimeout.current) {
      clearTimeout(restartTimeout.current)
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
    addDebugInfo(`Mute toggled: ${newMutedState}`)

    if (newMutedState) {
      stopListening()
    } else if (isCallActive && !isSpeaking) {
      setTimeout(() => startListening(), 500)
    }
  }

  const forceStartListening = () => {
    addDebugInfo("Force starting listening...")
    if (isCallActive && !isSpeaking) {
      stopListening()
      setTimeout(() => startListening(), 500)
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

          {/* Debug Info */}
          {debugInfo.length > 0 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Debug Info:</span>
              </div>
              <div className="space-y-1">
                {debugInfo.map((info, index) => (
                  <p key={index} className="text-xs text-gray-600 font-mono">
                    {info}
                  </p>
                ))}
              </div>
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

                <Button onClick={forceStartListening} variant="outline" size="lg" disabled={isSpeaking || isListening}>
                  🎤 Start Listening
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
