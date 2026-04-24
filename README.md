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

## Seeding Sample Data
Visit `/api/debug/seed` in your browser to populate the dashboard with test tickets.
