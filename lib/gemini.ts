import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  topic = "general",
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Create context based on topic
    const topicContext = getTopicContext(topic)

    // Build conversation context
    const context = [
      `You are Emma, a friendly and patient English conversation coach. ${topicContext}`,
      "Your goal is to help users practice spoken English in a natural, encouraging way.",
      "Keep responses conversational, not too long (2-3 sentences max).",
      "Gently correct mistakes when appropriate and encourage the user to keep talking.",
      "Ask follow-up questions to keep the conversation flowing.",
      "",
      "Previous conversation:",
    ]

    // Add conversation history
    conversationHistory.slice(-10).forEach((msg) => {
      context.push(`${msg.role === "user" ? "User" : "Emma"}: ${msg.content}`)
    })

    context.push(`User: ${userMessage}`)
    context.push("Emma:")

    const prompt = context.join("\n")
    const result = await model.generateContent(prompt)
    const response = await result.response

    return response.text()
  } catch (error) {
    console.error("Error generating AI response:", error)
    return "I'm sorry, I'm having trouble understanding right now. Could you please try again?"
  }
}

function getTopicContext(topic: string): string {
  const contexts = {
    "job-interview": "Focus on job interview scenarios, professional language, and career-related conversations.",
    travel: "Focus on travel situations, asking for directions, booking hotels, and travel experiences.",
    "daily-talk": "Focus on everyday conversations, hobbies, weather, and casual topics.",
    business: "Focus on business English, meetings, presentations, and professional communication.",
    general: "Engage in natural, friendly conversation on various topics.",
  }

  return contexts[topic as keyof typeof contexts] || contexts.general
}
