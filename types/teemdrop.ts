export interface TeemdropOrder {
  id: string;
  status: "new" | "processing" | "fulfilled" | "cancelled";
  total_price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  shipping_address: {
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    zip: string;
    country: string;
  };
  line_items: Array<{
    id: string;
    title: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  shipping_lines?: Array<{
    title: string;
    price: number;
  }>;
  taxes?: Array<{
    title: string;
    price: number;
  }>;
  fulfillments?: Array<{
    tracking_number?: string;
    tracking_company?: string;
    tracking_url?: string;
  }>;
  notes?: string;
}

export interface TeemdropWebhook {
  type: "order.created" | "order.updated";
  data: TeemdropOrder;
  signature?: string;
}
