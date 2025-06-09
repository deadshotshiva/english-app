"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"

// Hardcode the client ID to ensure it's available
const GOOGLE_CLIENT_ID = "295520259956-sqhq1n6ghlunek2rf8rh17jfc20o2qiq.apps.googleusercontent.com"

declare global {
  interface Window {
    google: any
  }
}

export function GoogleAuthButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const { login } = useAuth()

  useEffect(() => {
    // Get current origin for debugging
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin)
      console.log("Current origin:", window.location.origin)
    }

    // Check if Google is already loaded
    if (window.google) {
      initializeGoogle()
      return
    }

    // Load Google Identity Services script
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google) {
        initializeGoogle()
      } else {
        setError("Google Sign-In failed to initialize")
      }
    }

    script.onerror = () => {
      setError("Failed to load Google Sign-In")
    }

    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  const initializeGoogle = () => {
    try {
      console.log("Initializing Google with client ID:", GOOGLE_CLIENT_ID)
      console.log("Current origin:", window.location.origin)

      // Initialize with minimal configuration to avoid redirect URI issues
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
        // Remove any redirect-related configurations
        ux_mode: "popup", // Use popup mode instead of redirect
        context: "signin",
      })
      setGoogleLoaded(true)
      console.log("Google initialized successfully")
    } catch (error) {
      console.error("Google initialization error:", error)
      setError(`Failed to initialize Google Sign-In: ${error}`)
    }
  }

  const handleGoogleAuth = async () => {
    if (!googleLoaded || !window.google) {
      setError("Google Sign-In not ready. Please refresh the page.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Starting Google auth flow...")

      // Clear any existing button first
      const buttonContainer = document.getElementById("google-signin-button")
      if (buttonContainer) {
        buttonContainer.innerHTML = ""
      }

      // Render the Google Sign-In button
      window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
        type: "standard",
      })

      // Show the button
      if (buttonContainer) {
        buttonContainer.classList.remove("hidden")
      }

      setLoading(false)
    } catch (error) {
      console.error("Google auth error:", error)
      setError(`Failed to initialize Google Sign-In: ${error}`)
      setLoading(false)
    }
  }

  const handleCredentialResponse = async (response: any) => {
    console.log("Credential response received:", response)
    setLoading(true)
    setError(null)

    try {
      if (!response.credential) {
        throw new Error("No credential received from Google")
      }

      console.log("Got credential from Google, sending to backend...")

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: response.credential }),
      })

      console.log("Response status:", res.status)

      // Check if response is JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned invalid response format")
      }

      const data = await res.json()
      console.log("Response data:", data)

      if (res.ok && data.success) {
        console.log("Authentication successful!")
        login(data.token)
      } else {
        throw new Error(data.error || "Authentication failed")
      }
    } catch (error) {
      console.error("Auth error:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Authentication failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <p>
            <strong>Current Origin:</strong> {currentOrigin}
          </p>
          <p>
            <strong>Client ID:</strong> {GOOGLE_CLIENT_ID}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-red-700 underline mt-2">
            Refresh page
          </button>
        </div>
      )}

      <Button
        onClick={handleGoogleAuth}
        disabled={loading || !googleLoaded}
        className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            Signing in...
          </>
        ) : !googleLoaded ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {/* Container for Google's rendered button */}
      <div id="google-signin-button" className="mt-4 hidden w-full"></div>
    </div>
  )
}
