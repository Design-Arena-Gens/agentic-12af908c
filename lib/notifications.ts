import axios from "axios";
import { getOptionalEnv } from "./env";

const slackWebhook = () => getOptionalEnv("NOTIFY_SLACK_WEBHOOK");

export async function notifyError(message: string, context?: unknown) {
  const webhook = slackWebhook();
  if (!webhook) {
    console.error("[notifyError]", message, context);
    return;
  }

  await axios.post(
    webhook,
    {
      text: `🚨 Teemdrop → PagePilote sync error\n${message}\n\`\`\`${JSON.stringify(
        context,
        null,
        2
      )}\`\`\``
    },
    { timeout: 5_000 }
  );
}
