import { type NextRequest, NextResponse } from "next/server"
import { createOrUpdateUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Google auth route called")

    const body = await request.json()
    console.log("Request body received:", body)

    const { credential } = body

    if (!credential) {
      console.log("No credential provided")
      return NextResponse.json({ error: "No credential provided" }, { status: 400 })
    }

    console.log("Decoding Google credential...")

    // Decode JWT token from Google
    const parts = credential.split(".")
    if (parts.length !== 3) {
      console.log("Invalid credential format")
      return NextResponse.json({ error: "Invalid credential format" }, { status: 400 })
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")

    let jsonPayload
    try {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
    } catch (decodeError) {
      console.error("Failed to decode credential:", decodeError)
      return NextResponse.json({ error: "Failed to decode credential" }, { status: 400 })
    }

    let googleUser
    try {
      googleUser = JSON.parse(jsonPayload)
      console.log("Parsed Google user:", {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
      })
    } catch (parseError) {
      console.error("Failed to parse Google user data:", parseError)
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
    }

    // Validate required fields
    if (!googleUser.sub || !googleUser.email || !googleUser.name) {
      console.log("Missing required user fields")
      return NextResponse.json({ error: "Missing required user information" }, { status: 400 })
    }

    console.log("Creating/updating user in database...")

    // Create or update user in database
    let user
    try {
      user = await createOrUpdateUser({
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      })
      console.log("User created/updated successfully:", user.id)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Database error occurred" }, { status: 500 })
    }

    console.log("Generating JWT token...")

    // Generate JWT token
    let token
    try {
      token = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      })
      console.log("JWT token generated successfully")
    } catch (tokenError) {
      console.error("Token generation error:", tokenError)
      return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    console.error("Unexpected error in Google auth:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
