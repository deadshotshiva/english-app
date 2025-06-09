"use client"

import { useAuth } from "@/components/auth-provider"
import { VoiceCallInterface } from "@/components/voice-call-interface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Briefcase, Plane, Coffee, Building } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

const topics = [
  {
    id: "job-interview",
    name: "Job Interview",
    description: "Practice interview questions and professional communication",
    icon: Briefcase,
    color: "bg-blue-500",
    examples: ["Tell me about yourself", "What are your strengths?", "Why do you want this job?"],
  },
  {
    id: "travel",
    name: "Travel",
    description: "Learn travel phrases, directions, and booking conversations",
    icon: Plane,
    color: "bg-green-500",
    examples: ["How do I get to the airport?", "I need to book a hotel room", "Where is the nearest restaurant?"],
  },
  {
    id: "daily-talk",
    name: "Daily Talk",
    description: "Casual conversations about hobbies, weather, and daily life",
    icon: Coffee,
    color: "bg-orange-500",
    examples: ["What do you like to do for fun?", "How was your weekend?", "What's the weather like today?"],
  },
  {
    id: "business",
    name: "Business",
    description: "Professional meetings, presentations, and business English",
    icon: Building,
    color: "bg-purple-500",
    examples: ["Let's schedule a meeting", "I'd like to present our proposal", "What are the quarterly results?"],
  },
  {
    id: "general",
    name: "General Conversation",
    description: "Open conversation on any topic you'd like to discuss",
    icon: Coffee,
    color: "bg-gray-500",
    examples: ["How are you today?", "Tell me about your interests", "What's on your mind?"],
  },
]

export default function PracticePage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialTopic = searchParams.get("topic") || "general"

  const [selectedTopic, setSelectedTopic] = useState(initialTopic)
  const [showCallInterface, setShowCallInterface] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Please sign in to start practicing.</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedTopicData = topics.find((t) => t.id === selectedTopic) || topics[0]

  const handleCallEnd = (callData: any) => {
    setShowCallInterface(false)
    // Could show a summary or redirect to history
  }

  if (showCallInterface) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowCallInterface(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topic Selection
            </Button>
          </div>

          <VoiceCallInterface topic={selectedTopic} onCallEnd={handleCallEnd} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practice English</h1>
            <p className="text-gray-600">Choose a topic and start your conversation with Emma</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Topic Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Practice Topic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTopic === topic.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <topic.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                          {selectedTopic === topic.id && <Badge className="bg-blue-500">Selected</Badge>}
                        </div>
                        <p className="text-gray-600 mb-3">{topic.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Example phrases:</p>
                          <div className="flex flex-wrap gap-2">
                            {topic.examples.map((example, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                "{example}"
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Selected Topic Details & Start */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedTopicData.icon className="w-5 h-5" />
                  {selectedTopicData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{selectedTopicData.description}</p>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">What to expect:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Natural conversation with Emma</li>
                    <li>• Gentle corrections and feedback</li>
                    <li>• Encouraging responses</li>
                    <li>• Real-time voice interaction</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setShowCallInterface(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Start Conversation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Practice Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Before you start:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Find a quiet environment</li>
                    <li>• Check your microphone</li>
                    <li>• Relax and speak naturally</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-1">During conversation:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Don't worry about mistakes</li>
                    <li>• Take your time to think</li>
                    <li>• Ask Emma to repeat if needed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
