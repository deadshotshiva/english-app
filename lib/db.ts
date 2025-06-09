import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Database types
export interface User {
  id: number
  email: string
  name: string
  google_id?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  user_id: number
  session_id: string
  topic: string
  status: string
  started_at: string
  ended_at?: string
  duration_seconds: number
  total_messages: number
}

export interface Message {
  id: number
  conversation_id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
  audio_duration_ms?: number
}

export interface CallLog {
  id: number
  user_id: number
  conversation_id: number
  vapi_call_id?: string
  status: string
  started_at: string
  ended_at?: string
  duration_seconds: number
  transcript?: string
  feedback?: string
}
