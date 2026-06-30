"use server";

import { createClient } from "@/lib/supabase/server";

export type InquiryPayload = {
  product_id: string | null;
  product_name: string;
  sku: string | null;
  category_slug: string;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  email: string;
  inquiry_type: "inquiry" | "quote";
  is_quote: boolean;
  message: string;
  source: "ec";
};

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<{ success?: true; error?: string }> {
  // サーバー側バリデーション
  if (!payload.full_name.trim()) return { error: "お名前を入力してください" };
  if (!payload.email.trim()) return { error: "メールアドレスを入力してください" };
  if (!payload.message.trim()) return { error: "お問い合わせ内容を入力してください" };

  const supabase = createClient(); // anon key（secret key 不使用）

  const { error } = await supabase.from("inquiries").insert({
    product_id: payload.product_id || null,
    product_name: payload.product_name.trim().slice(0, 200),
    sku: payload.sku?.trim().slice(0, 100) ?? null,
    category_slug: payload.category_slug.trim().slice(0, 100),
    full_name: payload.full_name.trim().slice(0, 100),
    company_name: payload.company_name?.trim().slice(0, 100) ?? null,
    phone: payload.phone?.trim().slice(0, 50) ?? null,
    email: payload.email.trim().slice(0, 200),
    inquiry_type: payload.inquiry_type,
    is_quote: payload.is_quote,
    message: payload.message.trim().slice(0, 2000),
    source: "ec",
  });

  if (error) {
    console.error("[submitInquiry] Supabase error:", error.message);
    return { error: "送信に失敗しました。しばらくしてから再度お試しください。" };
  }

  return { success: true };
}
