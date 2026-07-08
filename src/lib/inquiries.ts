import { createClient } from "@/lib/supabase/server";

// 問い合わせの流入元。DBカラム構造は増やさず、既存の inquiries.source に
// 'ec'（商品詳細ページ） / 'contact'（Contactページ）を書き分けて区別する。
export type InquirySource = "ec" | "contact";

export type InquiryPayload = {
  product_id: string | null;
  product_name: string;
  sku: string | null;
  category_slug: string | null;
  full_name: string;
  company_name: string | null;
  phone: string | null;
  email: string;
  inquiry_type: "inquiry" | "quote";
  is_quote: boolean;
  message: string;
  source: InquirySource;
};

// 商品詳細ページの問い合わせ（inquiry-section.tsx）と Contactページの
// お問い合わせフォーム（contact-form.tsx）で共通利用する保存ロジック。
// 呼び出し元の Server Action（各 actions.ts）から delegate される。
export async function submitInquiryCore(
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
    category_slug: payload.category_slug?.trim().slice(0, 100) ?? null,
    full_name: payload.full_name.trim().slice(0, 100),
    company_name: payload.company_name?.trim().slice(0, 100) ?? null,
    phone: payload.phone?.trim().slice(0, 50) ?? null,
    email: payload.email.trim().slice(0, 200),
    inquiry_type: payload.inquiry_type,
    is_quote: payload.is_quote,
    message: payload.message.trim().slice(0, 2000),
    source: payload.source,
  });

  if (error) {
    console.error("[submitInquiryCore] Supabase error:", error.message);
    return { error: "送信に失敗しました。しばらくしてから再度お試しください。" };
  }

  return { success: true };
}
