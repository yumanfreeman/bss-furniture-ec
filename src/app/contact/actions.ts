"use server";

import { submitInquiryCore } from "@/lib/inquiries";

export type ContactPayload = {
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  message: string;
};

// 保存ロジック本体は src/lib/inquiries.ts に共通化されており、
// 商品詳細ページの問い合わせ（[productSlug]/actions.ts）と同じ処理を利用する。
// Contactページは商品に紐づかないため product_id は null、
// product_name は NOT NULL 制約のためプレースホルダーを設定する。
// 流入元は source: "contact" として区別する（DBカラム追加なし、
// 既存の inquiries.source を利用。管理画面の「流入元」欄でそのまま確認可能）。
export async function submitContactInquiry(
  payload: ContactPayload,
): Promise<{ success?: true; error?: string }> {
  return submitInquiryCore({
    product_id: null,
    product_name: "お問い合わせフォーム（商品指定なし）",
    sku: null,
    category_slug: null,
    full_name: payload.full_name,
    company_name: payload.company_name,
    phone: payload.phone,
    email: payload.email,
    inquiry_type: "inquiry",
    is_quote: false,
    message: payload.message,
    source: "contact",
  });
}
