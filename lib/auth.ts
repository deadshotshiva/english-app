import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { sql } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: number
  email: string
  name: string
}

export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
  } catch (error) {
    console.error("JWT generation error:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    const users = await sql`
      SELECT * FROM users WHERE id = ${payload.userId}
    `
    return users[0] || null
  } catch (error) {
    console.error("Get auth user error:", error)
    return null
  }
}

export async function createOrUpdateUser(googleUser: {
  id: string
  email: string
  name: string
  picture?: string
}) {
  try {
    console.log("Database operation: createOrUpdateUser", {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
    })

    // Check if user exists by Google ID first
    const existingByGoogleId = await sql`
      SELECT * FROM users WHERE google_id = ${googleUser.id}
    `

    if (existingByGoogleId.length > 0) {
      console.log("User found by Google ID, updating...")
      // Update existing user
      const updatedUsers = await sql`
        UPDATE users 
        SET name = ${googleUser.name}, 
            avatar_url = ${googleUser.picture || null}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE google_id = ${googleUser.id}
        RETURNING *
      `
      return updatedUsers[0]
    }

    // Check if user exists by email
    const existingByEmail = await sql`
      SELECT * FROM users WHERE email = ${googleUser.email}
    `

    if (existingByEmail.length > 0) {
      console.log("User found by email, updating with Google ID...")
      // Update existing user with Google ID
      const updatedUsers = await sql`
        UPDATE users 
        SET google_id = ${googleUser.id},
            name = ${googleUser.name}, 
            avatar_url = ${googleUser.picture || null}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ${googleUser.email}
        RETURNING *
      `
      return updatedUsers[0]
    }

    console.log("Creating new user...")
    // Create new user
    const newUsers = await sql`
      INSERT INTO users (email, name, google_id, avatar_url)
      VALUES (${googleUser.email}, ${googleUser.name}, ${googleUser.id}, ${googleUser.picture || null})
      RETURNING *
    `

    console.log("New user created:", newUsers[0])
    return newUsers[0]
  } catch (error) {
    console.error("Database error in createOrUpdateUser:", error)
    throw new Error(`Database operation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
