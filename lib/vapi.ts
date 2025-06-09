export interface VapiConfig {
  apiKey: string
  assistant: {
    name: string
    voice: {
      provider: string
      voiceId: string
    }
    model: {
      provider: string
      model: string
      systemMessage: string
    }
  }
}

export function createVapiAssistant(topic = "general"): VapiConfig["assistant"] {
  const systemMessages = {
    "job-interview":
      "You are Emma, an English coach helping with job interview practice. Ask interview questions and provide feedback on responses.",
    travel:
      "You are Emma, an English coach helping with travel conversations. Practice scenarios like booking hotels, asking directions, and travel experiences.",
    "daily-talk":
      "You are Emma, a friendly English coach for casual conversations. Talk about hobbies, weather, daily activities, and personal interests.",
    business:
      "You are Emma, an English coach for business communication. Practice meetings, presentations, and professional conversations.",
    general:
      "You are Emma, a friendly and patient English conversation coach. Help users practice natural English conversation.",
  }

  return {
    name: "Emma - English Coach",
    voice: {
      provider: "elevenlabs",
      voiceId: "rachel", // Use a friendly female voice
    },
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      systemMessage: systemMessages[topic as keyof typeof systemMessages] || systemMessages.general,
    },
  }
}

export async function startVapiCall(topic: string, userId: number): Promise<string> {
  if (!process.env.VAPI_API_KEY) {
    throw new Error("VAPI_API_KEY is required")
  }

  try {
    const assistant = createVapiAssistant(topic)

    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant,
        metadata: {
          userId: userId.toString(),
          topic,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id
  } catch (error) {
    console.error("Error starting Vapi call:", error)
    throw error
  }
}
