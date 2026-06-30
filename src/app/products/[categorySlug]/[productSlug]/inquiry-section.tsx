"use client";

import { useState, useEffect } from "react";
import { Mail, FileText, X, Loader2 } from "lucide-react";
import { submitInquiry } from "./actions";

type InquiryType = "inquiry" | "quote";

type Props = {
  productId: string;
  productName: string;
  sku: string | null;
  categorySlug: string;
};

export function InquirySection({
  productId,
  productName,
  sku,
  categorySlug,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>("inquiry");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openModal(type: InquiryType) {
    setInquiryType(type);
    setIsOpen(true);
    setSuccess(false);
    setErrorMsg(null);
  }

  function closeModal() {
    if (!loading) setIsOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const form = e.currentTarget;
    const g = (name: string) =>
      (
        form.elements.namedItem(name) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null
      )?.value ?? "";

    const result = await submitInquiry({
      product_id: productId || null,
      product_name: productName,
      sku,
      category_slug: categorySlug,
      full_name: g("full_name"),
      company_name: g("company_name") || null,
      phone: g("phone") || null,
      email: g("email"),
      inquiry_type: inquiryType,
      is_quote: inquiryType === "quote",
      message: g("message"),
      source: "ec",
    });

    setLoading(false);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
    }
  }

  const isQuote = inquiryType === "quote";

  const inputCls =
    "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-sm text-neutral-200 placeholder-neutral-700 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20";
  const labelCls =
    "mb-1.5 block text-[10px] font-medium tracking-[0.3em] text-neutral-600 uppercase";

  return (
    <>
      {/* ── メイン CTA ボタン ── */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => openModal("inquiry")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
        >
          <Mail size={16} />
          この商品についてお問い合わせ
        </button>
        <button
          onClick={() => openModal("quote")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 px-6 py-4 text-sm font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
        >
          <FileText size={16} />
          お見積もりを依頼する
        </button>
        <p className="text-center font-mono text-[10px] text-neutral-700">
          bss-Japan1001@gmail.com
        </p>
      </div>

      {/* ── スティッキー CTA（スクロール後） ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md transition-transform duration-300 ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
          <p className="hidden min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-600 sm:block">
            {sku ?? productName}
          </p>
          <button
            onClick={() => openModal("inquiry")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400 sm:flex-none"
          >
            <Mail size={14} />
            お問い合わせ
          </button>
          <button
            onClick={() => openModal("quote")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-amber-400 sm:flex-none"
          >
            <FileText size={14} />
            お見積もり
          </button>
        </div>
      </div>

      {/* ── モーダル ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* モーダル本体 */}
          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="p-6">
              {/* ヘッダー */}
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-medium tracking-[0.4em] text-amber-500 uppercase">
                    {isQuote ? "Request Quote" : "Inquiry"}
                  </p>
                  <h2 className="mt-1 text-base font-light tracking-wide text-neutral-100">
                    {isQuote ? "お見積もりのご依頼" : "お問い合わせ"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="ml-4 shrink-0 rounded-full p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300 disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 商品情報バッジ */}
              <div className="mb-5 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3">
                <p className="text-xs font-medium text-neutral-300">
                  {productName}
                </p>
                {sku && (
                  <p className="mt-0.5 font-mono text-[10px] text-neutral-600">
                    {sku}
                  </p>
                )}
              </div>

              {/* 成功状態 */}
              {success ? (
                <div className="py-10 text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-neutral-100">
                    お問い合わせありがとうございます。
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                    担当者より2営業日以内にご連絡いたします。
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 rounded-lg bg-amber-500 px-8 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                /* フォーム */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelCls}>
                        お名前 <span className="text-amber-500">*</span>
                      </label>
                      <input
                        name="full_name"
                        required
                        maxLength={100}
                        placeholder="山田 太郎"
                        className={inputCls}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelCls}>会社名</label>
                      <input
                        name="company_name"
                        maxLength={100}
                        placeholder="○○美容室"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>
                      メールアドレス <span className="text-amber-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      maxLength={200}
                      placeholder="info@example.com"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>電話番号</label>
                    <input
                      name="phone"
                      type="tel"
                      maxLength={50}
                      placeholder="03-0000-0000"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      {isQuote ? "見積内容" : "お問い合わせ内容"}{" "}
                      <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      maxLength={2000}
                      rows={4}
                      placeholder={
                        isQuote
                          ? "数量・納期のご希望などをご記入ください。"
                          : "ご質問や詳細をお聞かせください。"
                      }
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {errorMsg && (
                    <p className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-2.5 text-xs text-red-400">
                      {errorMsg}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={loading}
                      className="flex-1 rounded-xl border border-neutral-700 py-3 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-300 disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          送信中...
                        </>
                      ) : (
                        "送信する"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
