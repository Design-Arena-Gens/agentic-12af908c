"use client";

import Link from "next/link";

const steps = [
  {
    title: "1. Configure Teemdrop Webhook",
    bullets: [
      "In Teemdrop, open Settings → Integrations → Webhooks and create a new webhook.",
      "Set the endpoint URL to your deployment’s `/api/teemdrop/webhook` route.",
      "Add the shared secret from `.env.local` so we can verify payload signatures.",
      "Enable the `order.created` and `order.updated` topics to stay in sync."
    ]
  },
  {
    title: "2. Map Teemdrop Payload to PagePilote",
    bullets: [
      "We normalise the incoming order JSON in `transformTeemdropOrder`.",
      "Pull customer + line item data and reshape it for PagePilote.",
      "Attach Teemdrop’s order ID to `externalReference` for deduplication."
    ]
  },
  {
    title: "3. Push Into PagePilote",
    bullets: [
      "The API client in `lib/pagepilote.ts` posts normalised orders to PagePilote.",
      "Supports idempotent upserts via `externalReference` header so duplicates are ignored.",
      "Handles fulfilment note + tracking updates when Teemdrop sends new events."
    ]
  },
  {
    title: "4. Monitor + Retry",
    bullets: [
      "Automatic retry with exponential backoff on transient errors (429/5xx).",
      "Error notifications can be forwarded to Slack, email, or Zapier using the hooks in `lib/notifications.ts`.",
      "The dashboard below shows live webhook + sync history."
    ]
  }
];

export default function Page() {
  return (
    <main>
      <header>
        <h1>Teemdrop → PagePilote Automation</h1>
        <p>
          Drop in this blueprint to sync Teemdrop orders directly into PagePilote
          as soon as they’re placed. Deploy to Vercel, paste your API keys, and
          flip the webhook switch—no more manual copy/paste.
        </p>
      </header>

      <section>
        <h2>Environment</h2>
        <ul>
          <li>
            Create <code>.env.local</code> with <code>TEEMDROP_WEBHOOK_SECRET</code>,{" "}
            <code>PAGEPILOTE_API_KEY</code>, and <code>PAGEPILOTE_BASE_URL</code>.
          </li>
          <li>
            Optional: set <code>NOTIFY_SLACK_WEBHOOK</code> to receive failure alerts.
          </li>
        </ul>
      </section>

      <section>
        <h2>Webhook Handler</h2>
        <pre>
{`POST /api/teemdrop/webhook
  → Verify HMAC signature
  → Transform payload
  → Upsert order in PagePilote
  → Respond 200 or 202 (queued)`}
        </pre>
        <p>
          The handler is built to be idempotent and safe for retries. If Teemdrop
          sends the same event twice, PagePilote only keeps the freshest state.
        </p>
      </section>

      <section>
        <h2>Local Checklist</h2>
        <ul>
          <li>Install dependencies with <code>npm install</code>.</li>
          <li>Run <code>npm run dev</code> and trigger the Teemdrop test webhook.</li>
          <li>Check the console for sync logs and ensure orders appear in PagePilote.</li>
        </ul>
      </section>

      <section>
        <h2>Useful Links</h2>
        <ul>
          <li>
            <Link href="https://developers.pagepilote.com" target="_blank">
              PagePilote API reference
            </Link>
          </li>
          <li>
            <Link href="https://docs.teemdrop.com/webhooks" target="_blank">
              Teemdrop webhook docs
            </Link>
          </li>
        </ul>
      </section>

      <section>
        <h2>Flow Overview</h2>
        <ol>
          {steps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <ul>
                {step.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <footer>
        <p>
          Need custom mappings? Extend <code>transformTeemdropOrder</code> or add
          more API calls in <code>lib/pagepilote.ts</code> and redeploy.
        </p>
      </footer>
    </main>
  );
}
