import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { duration, transcript, topic } = await request.json()

    // Find the active conversation
    const conversations = await sql`
      SELECT * FROM conversations 
      WHERE user_id = ${user.id} AND status = 'active'
      ORDER BY started_at DESC
      LIMIT 1
    `

    if (conversations.length === 0) {
      return NextResponse.json({ error: "No active conversation found" }, { status: 404 })
    }

    const conversation = conversations[0]

    // Update conversation
    await sql`
      UPDATE conversations 
      SET status = 'completed', ended_at = CURRENT_TIMESTAMP, 
          duration_seconds = ${duration}, total_messages = ${transcript.length}
      WHERE id = ${conversation.id}
    `

    // Save transcript messages
    for (const message of transcript) {
      await sql`
        INSERT INTO messages (conversation_id, role, content, timestamp)
        VALUES (${conversation.id}, ${message.role}, ${message.text}, ${message.timestamp})
      `
    }

    // Update call log
    await sql`
      UPDATE call_logs 
      SET status = 'completed', ended_at = CURRENT_TIMESTAMP, 
          duration_seconds = ${duration}, transcript = ${JSON.stringify(transcript)}
      WHERE conversation_id = ${conversation.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("End call error:", error)
    return NextResponse.json({ error: "Failed to end call" }, { status: 500 })
  }
}
