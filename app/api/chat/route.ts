import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { generateAIResponse } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { message, history = [], topic = "general" } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate AI response using Gemini
    const response = await generateAIResponse(message, history, topic)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
