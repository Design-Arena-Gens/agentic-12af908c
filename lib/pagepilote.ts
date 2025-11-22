import axios from "axios";
import { getEnv } from "./env";
import { retry } from "./retry";

const baseUrl = () => getEnv("PAGEPILOTE_BASE_URL").replace(/\/$/, "");
const apiKey = () => getEnv("PAGEPILOTE_API_KEY");

export interface PagePiloteOrderPayload {
  externalReference: string;
  status: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
  };
  lineItems: Array<{
    sku: string;
    name: string;
    quantity: number;
    price: number;
    currency: string;
  }>;
  notes?: string;
  metadata?: Record<string, string | number | boolean>;
  tracking?: {
    carrier: string;
    number: string;
    url?: string;
  };
  placedAt: string;
  totals?: {
    subtotal: number;
    shipping: number;
    tax: number;
    currency: string;
  };
}

async function request<T = unknown>(config: {
  method: "POST" | "PATCH";
  url: string;
  data: unknown;
  idempotencyKey?: string;
}): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey()}`,
    "Content-Type": "application/json"
  };

  if (config.idempotencyKey) {
    headers["X-Idempotency-Key"] = config.idempotencyKey;
  }

  return retry(async () => {
    const response = await axios.request<T>({
      baseURL: baseUrl(),
      method: config.method,
      url: config.url,
      data: config.data,
      headers,
      timeout: 10_000,
      validateStatus: (status) => status >= 200 && status < 500
    });

    if (response.status >= 400) {
      const error = new Error(
        `PagePilote error ${response.status}: ${JSON.stringify(response.data)}`
      );
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    return response.data;
  });
}

export async function upsertOrder(payload: PagePiloteOrderPayload) {
  return request({
    method: "POST",
    url: "/api/v1/orders",
    data: payload,
    idempotencyKey: payload.externalReference
  });
}

export async function updateTracking(
  externalReference: string,
  tracking: NonNullable<PagePiloteOrderPayload["tracking"]>
) {
  return request({
    method: "PATCH",
    url: `/api/v1/orders/${encodeURIComponent(externalReference)}/tracking`,
    data: tracking,
    idempotencyKey: `${externalReference}-tracking-${tracking.number}`
  });
}
