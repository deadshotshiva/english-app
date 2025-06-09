# SpeakEasy - English Practice App

A full-stack web application for practicing spoken English with an AI assistant. Built with Next.js, PostgreSQL, and integrated with Vapi.ai for voice conversations and Gemini Pro for AI responses.

## 🚀 Features

- **Voice Conversations**: Real-time voice chat with Emma, your AI English coach
- **Multiple Topics**: Practice job interviews, travel, daily conversations, and business English
- **Safe Environment**: Practice without judgment in a private, supportive space
- **Progress Tracking**: Monitor your improvement with conversation history and statistics
- **Google OAuth**: Secure authentication with Google Sign-In
- **Responsive Design**: Beautiful, mobile-friendly interface

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT + Google OAuth
- **Voice Interface**: Vapi.ai
- **AI**: Google Gemini Pro
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database (Neon recommended)
- Google OAuth credentials
- Gemini API key
- Vapi.ai API key (optional for full voice functionality)

## 🔧 Setup Instructions

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd speakeasy-app
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

\`\`\`env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key
VAPI_API_KEY=your-vapi-api-key

# Public Environment Variables
PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
\`\`\`

### 3. Database Setup

1. Create a PostgreSQL database on [Neon](https://neon.tech) (free tier available)
2. Run the database migration:
   \`\`\`bash
   # The SQL script will be executed automatically when you first run the app
   # Or you can run it manually in your database console
   \`\`\`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add redirect URIs for your app

### 5. Get API Keys

#### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

#### Vapi.ai API Key (Optional)
1. Sign up at [Vapi.ai](https://vapi.ai)
2. Get your API key from the dashboard
3. Add it to your environment variables

### 6. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your app!

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is optimized for Vercel's free tier.

## 📱 Usage

1. **Sign Up**: Use Google OAuth to create an account
2. **Choose Topic**: Select from job interviews, travel, daily talk, or business
3. **Start Practicing**: Click "Start Conversation" to begin voice chat with Emma
4. **Review Progress**: Check your conversation history and track improvement

## 🎯 Practice Topics

- **Job Interview**: Practice interview questions and professional communication
- **Travel**: Learn travel phrases, directions, and booking conversations  
- **Daily Talk**: Casual conversations about hobbies, weather, and daily life
- **Business**: Professional meetings, presentations, and business English
- **General**: Open conversation on any topic

## 🔒 Security

- JWT-based authentication
- Secure cookie handling
- Environment variable protection
- Database query parameterization
- CORS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the environment variables are correctly set
2. Ensure your database is accessible
3. Verify API keys are valid
4. Check the browser console for errors

For additional help, please open an issue in the repository.

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Voice integration with [Vapi.ai](https://vapi.ai)
- AI powered by [Google Gemini](https://ai.google.dev)
- Database hosted on [Neon](https://neon.tech)
