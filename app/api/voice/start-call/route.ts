import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { startVapiCall } from "@/lib/vapi"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { topic } = await request.json()

    // Create conversation record
    const conversations = await sql`
      INSERT INTO conversations (user_id, session_id, topic, status)
      VALUES (${user.id}, ${`session_${Date.now()}`}, ${topic || "general"}, 'active')
      RETURNING *
    `

    const conversation = conversations[0]

    // Start Vapi call (in a real implementation)
    let vapiCallId = null
    try {
      vapiCallId = await startVapiCall(topic, user.id)
    } catch (error) {
      console.error("Vapi call start error:", error)
      // Continue without Vapi for demo purposes
    }

    // Create call log
    await sql`
      INSERT INTO call_logs (user_id, conversation_id, vapi_call_id, status)
      VALUES (${user.id}, ${conversation.id}, ${vapiCallId}, 'started')
    `

    return NextResponse.json({
      callId: conversation.id,
      sessionId: conversation.session_id,
    })
  } catch (error) {
    console.error("Start call error:", error)
    return NextResponse.json({ error: "Failed to start call" }, { status: 500 })
  }
}
