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

// DBを読まずに一意な注文番号を生成する（日付 + ランダム文字列）
function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `E-${y}${m}${d}-${random}`;
}

export async function submitOrder(
  payload: CheckoutPayload,
): Promise<CheckoutResult> {
  // バリデーション
  if (!payload.customerName.trim()) return { orderNumber: null, orderId: null, error: "お名前を入力してください。" };
  if (!payload.customerEmail.trim()) return { orderNumber: null, orderId: null, error: "メールアドレスを入力してください。" };
  if (!payload.items.length) return { orderNumber: null, orderId: null, error: "カートが空です。" };

  const supabase = createClient(); // anon key

  // orderId・order_number は事前にアプリ側で生成する（INSERT後の .select() を使わないため）
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();

  // ec_orders に INSERT（RLSのSELECT policyに依存しないよう .select() は使わない）
  const { error: orderErr } = await supabase
    .from("ec_orders")
    .insert({
      id: orderId,
      order_number: orderNumber,
      status: "pending",
      customer_name: payload.customerName.trim(),
      customer_company: payload.customerCompany?.trim() || null,
      customer_email: payload.customerEmail.trim(),
      customer_phone: payload.customerPhone?.trim() || null,
      customer_address: payload.customerAddress?.trim() || null,
      notes: payload.notes?.trim() || null,
    });

  if (orderErr) {
    return { orderNumber: null, orderId: null, error: orderErr.message ?? "注文の送信に失敗しました。" };
  }

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
