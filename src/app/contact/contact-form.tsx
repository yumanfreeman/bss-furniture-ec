"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { submitContactInquiry } from "./actions";

const inputCls =
  "w-full border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200 placeholder-neutral-600 outline-none transition-colors focus:border-amber-500/60";
const labelCls =
  "mb-2 block text-[11px] tracking-[0.2em] text-neutral-400 uppercase";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

    const result = await submitContactInquiry({
      full_name: g("name"),
      company_name: g("company") || null,
      email: g("email"),
      phone: g("phone") || null,
      message: g("message"),
    });

    setLoading(false);
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccess(true);
      form.reset();
    }
  }

  if (success) {
    return (
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
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className={labelCls}>
          お名前 <span className="text-amber-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className={inputCls}
          placeholder="山田 花子"
        />
      </div>

      <div>
        <label htmlFor="company" className={labelCls}>
          会社名 / サロン名
        </label>
        <input
          id="company"
          name="company"
          type="text"
          maxLength={100}
          className={inputCls}
          placeholder="株式会社〇〇 / サロン〇〇"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>
          メールアドレス <span className="text-amber-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={200}
          className={inputCls}
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelCls}>
          電話番号
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          maxLength={50}
          className={inputCls}
          placeholder="03-0000-0000"
        />
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          相談内容 <span className="text-amber-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={6}
          className={`${inputCls} resize-none`}
          placeholder="ご相談内容をご記入ください"
        />
      </div>

      {errorMsg && (
        <p className="border border-red-800/50 bg-red-950/30 px-4 py-3 text-xs text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 bg-amber-500 px-12 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            送信中...
          </>
        ) : (
          "送信する"
        )}
      </button>
    </form>
  );
}
