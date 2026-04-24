# Helpdesk Dashboard

Full-stack Helpdesk Dashboard integrated with ElevenLabs AI voice agent and Microsoft Teams (via Power Automate).

## Prerequisites

- Node.js 18+
- Firestore Database
- Firebase Service Account (for Admin SDK)
- Power Automate Webhook URL

## Installation

1. Clone or download the project.
2. Run `npm install`.

## Firebase Setup

### 1. Firestore Collections
- Create a collection named `tickets`.
- Create a collection named `counters` with a document `helpdesk_ticket_counter` having `{ currentNumber: 1000 }`.

### 2. Service Account
- Go to Firebase Console > Project Settings > Service Accounts.
- Generate a new private key and save the JSON.
- Use the values in your `.env.local`.

### 3. ElevenLabs Post-call Webhook
1. Go to your ElevenLabs Conversation Agent settings.
2. Under "Post-call", find the Webhook URL field.
3. Set it to: `https://maprit.vercel.app/api/elevenlabs/call-logs`
4. The agent will now automatically send call analytics and transcripts to the dashboard after every conversation.

## Environment Variables

Create a `.env.local` file with the following:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Firebase Admin
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n"

# Power Automate
POWER_AUTOMATE_WEBHOOK_URL="..."
```

## Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## API Documentation

### POST /api/helpdesk/tickets
Endpoint for ElevenLabs AI Agent.

**Payload:**
```json
{
  "caller_name": "Name",
  "company_name": "Company",
  "callback_number": "Phone",
  "computer_name": "PC-NAME",
  "incident_title": "Issue",
  "incident_summary": "Details",
  "vip_caller": false,
  "next_action": "troubleshoot",
  "is_issue_resolved": false
}
```

### POST /api/elevenlabs/call-logs
Endpoint for ElevenLabs Post-call Webhooks. Stores call transcripts and analytics in Firestore.

**URL:** `https://maprit.vercel.app/api/elevenlabs/call-logs`

## Seeding Sample Data
Visit `/api/debug/seed` in your browser to populate the dashboard with test tickets.

## Vercel Deployment

To deploy this application on Vercel:

1.  **Push to GitHub**: Push your codebase to a GitHub repository.
2.  **Import to Vercel**: Connect your GitHub repo to Vercel.
3.  **Configure Environment Variables**: In your Vercel project settings, add the environment variables listed in the **Environment Variables** section above. 
    - For the client-side variables, make sure they start with `NEXT_PUBLIC_`.
    - For `FIREBASE_PRIVATE_KEY`, ensure you include the full string including `\n`.
4.  **Deploy**: Vercel will build and deploy your application. The `firebase-applet-config.json` file is included in the build so the app should find its initial configuration, but environment variables will override it in production for security.
