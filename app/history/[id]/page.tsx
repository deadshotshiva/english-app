"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, MessageSquare, User, Bot } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function ConversationDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<any>(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && conversationId) {
      fetchConversationDetails()
    }
  }, [user, conversationId])

  const fetchConversationDetails = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setConversation(data.conversation)
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching conversation details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Please sign in to view conversation details.</p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Conversation not found.</p>
            <Link href="/history">
              <Button>Back to History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/history">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conversation Details</h1>
            <p className="text-gray-600">Review your practice session</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Conversation Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Topic</p>
                  <Badge variant="secondary" className="mt-1">
                    {conversation.topic.replace("-", " ")}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {Math.floor(conversation.duration_seconds / 60)}m {conversation.duration_seconds % 60}s
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{conversation.total_messages} total</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(conversation.started_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant={conversation.status === "completed" ? "default" : "secondary"} className="mt-1">
                    {conversation.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Transcript */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((message: any, index) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            <span className="text-xs font-medium">{message.role === "user" ? "You" : "Emma"}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages in this conversation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Practice Again */}
            <div className="mt-6 text-center">
              <Link href={`/practice?topic=${conversation.topic}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Practice This Topic Again</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
