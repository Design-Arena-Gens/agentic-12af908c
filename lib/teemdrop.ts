import type { TeemdropOrder } from "@/types/teemdrop";
import type { PagePiloteOrderPayload } from "./pagepilote";

export function transformTeemdropOrder(
  order: TeemdropOrder
): PagePiloteOrderPayload {
  const fullName = `${order.customer.first_name} ${order.customer.last_name}`.trim();

  const subtotal = order.line_items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = order.shipping_lines?.reduce(
    (sum, line) => sum + line.price,
    0
  );

  const tax = order.taxes?.reduce((sum, taxLine) => sum + taxLine.price, 0);

  const latestFulfillment = order.fulfillments?.[order.fulfillments.length - 1];

  return {
    externalReference: order.id,
    status: mapStatus(order.status),
    customer: {
      name: fullName,
      email: order.customer.email,
      phone: order.customer.phone,
      address: {
        line1: order.shipping_address.address1,
        line2: order.shipping_address.address2 ?? undefined,
        city: order.shipping_address.city,
        state: order.shipping_address.province ?? undefined,
        postalCode: order.shipping_address.zip,
        country: order.shipping_address.country
      }
    },
    lineItems: order.line_items.map((item) => ({
      sku: item.sku,
      name: item.title,
      quantity: item.quantity,
      price: item.price,
      currency: order.currency
    })),
    placedAt: order.created_at,
    totals: {
      subtotal,
      shipping: shipping ?? 0,
      tax: tax ?? 0,
      currency: order.currency
    },
    notes: order.notes ?? undefined,
    metadata: {
      source: "teemdrop",
      lastUpdated: order.updated_at
    },
    tracking: latestFulfillment?.tracking_number
      ? {
          carrier: latestFulfillment.tracking_company ?? "Unknown",
          number: latestFulfillment.tracking_number,
          url: latestFulfillment.tracking_url
        }
      : undefined
  };
}

function mapStatus(
  status: TeemdropOrder["status"]
): PagePiloteOrderPayload["status"] {
  switch (status) {
    case "new":
      return "pending";
    case "processing":
      return "processing";
    case "fulfilled":
      return "fulfilled";
    case "cancelled":
      return "cancelled";
    default:
      return "pending";
  }
}
