"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  History,
  TrendingUp,
  Clock,
  MessageSquare,
  LogOut,
  Briefcase,
  Plane,
  Coffee,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface ConversationStats {
  totalConversations: number
  totalMinutes: number
  thisWeek: number
  averageDuration: number
}

const topics = [
  {
    id: "job-interview",
    name: "Job Interview",
    description: "Practice interview questions and professional communication",
    icon: Briefcase,
    color: "bg-blue-500",
  },
  {
    id: "travel",
    name: "Travel",
    description: "Learn travel phrases, directions, and booking conversations",
    icon: Plane,
    color: "bg-green-500",
  },
  {
    id: "daily-talk",
    name: "Daily Talk",
    description: "Casual conversations about hobbies, weather, and daily life",
    icon: Coffee,
    color: "bg-orange-500",
  },
  {
    id: "business",
    name: "Business",
    description: "Professional meetings, presentations, and business English",
    icon: Building,
    color: "bg-purple-500",
  },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<ConversationStats>({
    totalConversations: 0,
    totalMinutes: 0,
    thisWeek: 0,
    averageDuration: 0,
  })
  const [recentConversations, setRecentConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const [conversationsRes] = await Promise.all([fetch("/api/conversations")])

      if (conversationsRes.ok) {
        const conversations = await conversationsRes.json()
        setRecentConversations(conversations.slice(0, 5))

        // Calculate stats
        const totalConversations = conversations.length
        const totalMinutes = conversations.reduce(
          (sum: number, conv: any) => sum + Math.floor(conv.duration_seconds / 60),
          0,
        )
        const thisWeek = conversations.filter((conv: any) => {
          const convDate = new Date(conv.started_at)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return convDate > weekAgo
        }).length
        const averageDuration = totalConversations > 0 ? Math.floor(totalMinutes / totalConversations) : 0

        setStats({
          totalConversations,
          totalMinutes,
          thisWeek,
          averageDuration,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
            <Link href="/">
              <Button>Go to Home</Button>
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
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {user.avatar_url && (
              <img src={user.avatar_url || "/placeholder.svg"} alt={user.name} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}! 👋</h1>
              <p className="text-gray-600">Ready to practice your English today?</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Minutes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMinutes}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}m</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Practice Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Start Practice Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/practice?topic=${topic.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className={`w-10 h-10 ${topic.color} rounded-lg flex items-center justify-center`}>
                      <topic.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{topic.name}</h3>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                  </div>
                </Link>
              ))}

              <Link href="/practice">
                <Button className="w-full mt-4">
                  <Mic className="w-4 h-4 mr-2" />
                  Quick Start (General)
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentConversations.length > 0 ? (
                <div className="space-y-4">
                  {recentConversations.map((conversation: any) => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{conversation.topic}</Badge>
                          <span className="text-sm text-gray-600">
                            {Math.floor(conversation.duration_seconds / 60)}m
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(conversation.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/history/${conversation.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}

                  <Link href="/history">
                    <Button variant="outline" className="w-full">
                      View All History
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No conversations yet</p>
                  <Link href="/practice">
                    <Button>Start Your First Session</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Practice Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-2">Speak Naturally</h3>
                <p className="text-sm text-gray-600">
                  Don't worry about mistakes. Focus on expressing your thoughts clearly.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Practice Regularly</h3>
                <p className="text-sm text-gray-600">
                  Even 10-15 minutes daily can significantly improve your fluency.
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Review your conversation history to see how you're improving.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
