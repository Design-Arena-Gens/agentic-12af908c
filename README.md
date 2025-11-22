# Teemdrop ↔ PagePilote Connector

Blueprint for syncing Teemdrop orders into PagePilote automatically using a Vercel-hosted Next.js app. Incoming Teemdrop webhooks are verified, normalised, and pushed to PagePilote with retries and optional alerting.

## Requirements

- Node.js 18+
- npm 8+
- Teemdrop account with webhook access
- PagePilote API key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the secrets (see below).
3. Run locally:
   ```bash
   npm run dev
   ```
4. Use Teemdrop’s webhook test tool to confirm orders appear inside PagePilote.

## Environment Variables

| Name | Description |
| --- | --- |
| `TEEMDROP_WEBHOOK_SECRET` | Shared secret used to validate Teemdrop webhook signatures. |
| `PAGEPILOTE_API_KEY` | Bearer token for the PagePilote API. |
| `PAGEPILOTE_BASE_URL` | Base URL for the PagePilote API (e.g. `https://api.pagepilote.com`). |
| `NOTIFY_SLACK_WEBHOOK` (optional) | Slack incoming webhook for error notifications. |

## Deployment

1. Push this repository to GitHub or GitLab.
2. Create a Vercel project and connect the repository.
3. Add the environment variables above to Vercel.
4. Deploy; the production webhook URL will be `https://<your-domain>/api/teemdrop/webhook`.

## How It Works

1. Teemdrop fires `order.created` or `order.updated` webhook events.
2. `/api/teemdrop/webhook` verifies the HMAC signature and parses the payload.
3. `transformTeemdropOrder` maps Teemdrop JSON into the PagePilote order schema.
4. The order is upserted into PagePilote, tracking data is updated if present.
5. Failures trigger optional Slack notifications for fast remediation.

Extend `lib/teemdrop.ts` to add custom mappings or enrich metadata before syncing.
