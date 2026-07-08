"use server";

import { submitInquiryCore, type InquiryPayload } from "@/lib/inquiries";

export type { InquiryPayload };

// 保存ロジック本体は src/lib/inquiries.ts に共通化されており、
// Contactページの問い合わせ（src/app/contact/actions.ts）と同じ処理を利用する。
export async function submitInquiry(
  payload: InquiryPayload,
): Promise<{ success?: true; error?: string }> {
  return submitInquiryCore(payload);
}
