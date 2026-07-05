"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutItem = {
  productId: string | null;
  productName: string;
  sku: string | null;
  unitPrice: number | null;
  quantity: number;
};

export type CheckoutPayload = {
  customerName: string;
  customerCompany: string | null;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  notes: string | null;
  items: CheckoutItem[];
};

export type CheckoutResult = {
  orderNumber: string | null;
  orderId: string | null;
  error: string | null;
};

async function generateOrderNumber(supabase: ReturnType<typeof createClient>): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("ec_orders")
    .select("id", { count: "exact", head: true });
  const seq = String((count ?? 0) + 1).padStart(6, "0");
  return `E-${year}-${seq}`;
}

export async function submitOrder(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  // バリデーション
  if (!payload.customerName.trim()) return { orderNumber: null, orderId: null, error: "お名前を入力してください。" };
  if (!payload.customerEmail.trim()) return { orderNumber: null, orderId: null, error: "メールアドレスを入力してください。" };
  if (!payload.items.length) return { orderNumber: null, orderId: null, error: "カートが空です。" };

  const supabase = createClient(); // anon key

  const orderNumber = await generateOrderNumber(supabase);

  // ec_orders に INSERT
  const { data: order, error: orderErr } = await supabase
    .from("ec_orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      customer_name: payload.customerName.trim(),
      customer_company: payload.customerCompany?.trim() || null,
      customer_email: payload.customerEmail.trim(),
      customer_phone: payload.customerPhone?.trim() || null,
      customer_address: payload.customerAddress?.trim() || null,
      notes: payload.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return { orderNumber: null, orderId: null, error: orderErr?.message ?? "注文の送信に失敗しました。" };
  }

  const orderId = order.id as string;

  // ec_order_items に INSERT
  const itemRows = payload.items.map((it, i) => ({
    order_id: orderId,
    product_id: it.productId || null,
    product_name: it.productName.trim(),
    sku: it.sku?.trim() || null,
    quantity: it.quantity,
    unit_price: it.unitPrice ?? 0,
    sort_order: i,
  }));

  const { error: itemErr } = await supabase
    .from("ec_order_items")
    .insert(itemRows);

  if (itemErr) {
    // ヘッダだけ残るがクリティカルではない
    console.error("[submitOrder] items insert error:", itemErr.message);
  }

  return { orderNumber, orderId, error: null };
}
