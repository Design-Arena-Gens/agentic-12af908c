import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { verifyHmacSignature } from "@/lib/signature";
import { transformTeemdropOrder } from "@/lib/teemdrop";
import { logError, logInfo } from "@/lib/logger";
import { notifyError } from "@/lib/notifications";
import { upsertOrder, updateTracking } from "@/lib/pagepilote";
import type { TeemdropWebhook } from "@/types/teemdrop";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-teemdrop-signature") ??
    request.headers.get("X-Teemdrop-Signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const secret = getEnv("TEEMDROP_WEBHOOK_SECRET");
  const isValid = verifyHmacSignature({
    payload: rawBody,
    secret,
    signature
  });

  if (!isValid) {
    await notifyError("Invalid Teemdrop signature", rawBody);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let webhook: TeemdropWebhook;
  try {
    webhook = JSON.parse(rawBody) as TeemdropWebhook;
  } catch (error) {
    await notifyError("Failed to parse Teemdrop webhook body", rawBody);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const orderPayload = transformTeemdropOrder(webhook.data);

    logInfo("Upserting order into PagePilote", {
      id: orderPayload.externalReference
    });

    await upsertOrder(orderPayload);

    if (orderPayload.tracking) {
      await updateTracking(orderPayload.externalReference, orderPayload.tracking);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError("Sync failed", error);
    await notifyError("Failed to sync Teemdrop order", {
      error: (error as Error).message,
      orderId: webhook.data.id
    });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Teemdrop webhook listener ready"
  });
}
