"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react"

interface VoiceCallInterfaceProps {
  topic: string
  onCallEnd: (callData: any) => void
}

export function VoiceCallInterface({ topic, onCallEnd }: VoiceCallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string; timestamp: Date }>>([])

  const callStartTime = useRef<Date | null>(null)
  const durationInterval = useRef<NodeJS.Timeout | null>(null)
  const vapiCall = useRef<any>(null)

  useEffect(() => {
    // Load Vapi SDK
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
    script.onload = () => {
      console.log("Vapi SDK loaded")
    }
    document.head.appendChild(script)

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current)
      }
      if (vapiCall.current) {
        vapiCall.current.stop()
      }
    }
  }, [])

  const startCall = async () => {
    setIsConnecting(true)

    try {
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

      const { callId } = await response.json()

      // Initialize Vapi call (this would be the actual Vapi integration)
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

      // Simulate conversation for demo
      simulateConversation()
    } catch (error) {
      console.error("Error starting call:", error)
      setIsConnecting(false)
    }
  }

  const endCall = async () => {
    setIsCallActive(false)

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
    setIsMuted(!isMuted)
    // In real implementation, this would mute/unmute the microphone
  }

  const simulateConversation = () => {
    // Simulate AI greeting
    setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Hi! I'm Emma, your English conversation coach. I'm excited to help you practice ${topic === "general" ? "English conversation" : topic.replace("-", " ")} today. How are you feeling?`,
          timestamp: new Date(),
        },
      ])
    }, 2000)
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
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            Voice Conversation
          </CardTitle>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{topic.replace("-", " ")}</Badge>
            {isCallActive && <span className="font-mono">{formatDuration(callDuration)}</span>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
                    Start Conversation
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
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isCallActive && (
            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>Click "Start Conversation" to begin practicing with Emma</p>
              <p>Make sure your microphone is enabled for the best experience</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
