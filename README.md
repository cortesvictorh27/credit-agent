# LendMatch AI - Business Loan Chatbot

A conversational AI chatbot that acts as a credit broker, qualifying leads and matching them with appropriate lending partners.

## Features

- **AI-Powered Conversations**: Uses OpenAI's GPT-4o to provide natural, helpful responses
- **Lead Qualification**: Collects essential business information through natural conversation
- **Partner Matching**: Matches business profiles with appropriate lending partners
- **Scoring Algorithm**: Ranks lending partners by match percentage based on qualification criteria
- **Fallback Systems**: Provides reliable responses even when external AI services are unavailable

## Technical Details

- **Frontend**: React with Tailwind CSS and shadcn/ui components
- **Backend**: Express.js API server
- **AI Integration**: OpenAI GPT-4o with fallback to rule-based system
- **Data Storage**: In-memory database with PostgreSQL schema support
- **External Integration**: Optional Google Sheets integration for lending partner data

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up the required environment variables (see below)
4. Run the development server with `npm run dev`

## Environment Variables

The application requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key for AI-powered chat
- Optional: `HUGGING_FACE_API_KEY`: Alternative AI provider API key

## Deployment

This application can be deployed on Replit or any Node.js hosting platform.