"use client"

import { useAuth } from "@/components/auth-provider"
import { GoogleAuthButton } from "@/components/google-auth-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MessageCircle, BarChart3, Shield, Heart, Sparkles } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}! 👋</h1>
              <p className="text-gray-600 mt-1">Ready to practice your English today?</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>

          {/* Quick Start */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Mic className="w-6 h-6" />
                  Start Practicing Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">Jump into a conversation with Emma, your AI English coach.</p>
                <Link href="/practice">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Start Voice Practice</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <BarChart3 className="w-6 h-6" />
                  View Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">Check your conversation history and track improvement.</p>
                <Link href="/history">
                  <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                    View History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Safe Environment</h3>
                <p className="text-sm text-gray-600">Practice without judgment in a private, supportive space.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Patient AI Coach</h3>
                <p className="text-sm text-gray-600">Emma provides gentle corrections and encouraging feedback.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Multiple Topics</h3>
                <p className="text-sm text-gray-600">Practice job interviews, travel, daily conversations, and more.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered English Practice
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Practice English with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Emma</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Overcome shyness and improve your spoken English in a safe, judgment-free environment. Talk naturally with
            our AI coach anytime, anywhere.
          </p>

          <div className="max-w-md mx-auto">
            <GoogleAuthButton />
            <p className="text-sm text-gray-500 mt-4">
              Free to use • No credit card required • Start practicing immediately
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Voice Conversations</h3>
              <p className="text-sm text-gray-600">
                Real-time voice chat with natural speech recognition and responses.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Multiple Topics</h3>
              <p className="text-sm text-gray-600">
                Practice job interviews, travel scenarios, daily conversations, and more.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-gray-600">Monitor your improvement with conversation history and feedback.</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Safe & Private</h3>
              <p className="text-sm text-gray-600">
                Practice without fear of judgment in a completely private environment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How SpeakEasy Works</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Choose Your Topic</h3>
              <p className="text-gray-600">
                Select from job interviews, travel, daily conversations, or general practice.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Start Talking</h3>
              <p className="text-gray-600">Click to start and begin speaking naturally with Emma, your AI coach.</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Get Feedback</h3>
              <p className="text-gray-600">Receive gentle corrections and encouragement to improve your English.</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <blockquote className="text-lg text-gray-700 mb-4">
              "SpeakEasy helped me overcome my fear of speaking English. Emma is so patient and encouraging. I've
              improved so much in just a few weeks!"
            </blockquote>
            <cite className="text-sm text-gray-500">- Sarah, English Learner</cite>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Speaking?</h2>
          <p className="text-gray-600 mb-8">Join thousands of learners improving their English with SpeakEasy.</p>
          <div className="max-w-md mx-auto">
            <GoogleAuthButton />
          </div>
        </div>
      </div>
    </div>
  )
}
