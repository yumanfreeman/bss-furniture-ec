"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import { submitOrder, type CheckoutPayload } from "./actions";

export const dynamic = "force-dynamic";

function formatYen(n: number | null) {
  if (n === null) return "価格お問い合わせ";
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-400">
        {label}
        {required && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    notes: "",
  });

  useEffect(() => {
    const cart = getCart();
    setItems(cart);
    setMounted(true);
    if (cart.length === 0) router.replace("/cart");
  }, [router]);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: CheckoutPayload = {
      customerName: form.customerName,
      customerCompany: form.customerCompany || null,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone || null,
      customerAddress: form.customerAddress || null,
      notes: form.notes || null,
      items: items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        unitPrice: it.unitPrice,
        quantity: it.quantity,
      })),
    };

    startTransition(async () => {
      const res = await submitOrder(payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      clearCart();
      router.push(`/order-complete?order=${res.orderNumber}`);
    });
  }

  const subtotal = items.reduce((sum, it) => sum + (it.unitPrice ?? 0) * it.quantity, 0);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* ヘッダー */}
      <Link
        href="/cart"
        className="mb-8 flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <ArrowLeft size={14} />
        カートに戻る
      </Link>

      <div className="mb-8">
        <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">Checkout</p>
        <h1 className="mt-1 text-2xl font-light tracking-wider text-neutral-200">注文情報入力</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* 左カラム：入力フォーム */}
          <div className="space-y-5">
            <h2 className="text-sm font-medium text-neutral-300 border-b border-neutral-800 pb-3">
              ご注文者情報
            </h2>

            <Field label="お名前" required>
              <input
                type="text"
                className={inputCls}
                placeholder="山田 花子"
                value={form.customerName}
                onChange={set("customerName")}
                required
              />
            </Field>

            <Field label="会社名">
              <input
                type="text"
                className={inputCls}
                placeholder="株式会社〇〇（任意）"
                value={form.customerCompany}
                onChange={set("customerCompany")}
              />
            </Field>

            <Field label="メールアドレス" required>
              <input
                type="email"
                className={inputCls}
                placeholder="example@email.com"
                value={form.customerEmail}
                onChange={set("customerEmail")}
                required
              />
            </Field>

            <Field label="電話番号">
              <input
                type="tel"
                className={inputCls}
                placeholder="090-1234-5678（任意）"
                value={form.customerPhone}
                onChange={set("customerPhone")}
              />
            </Field>

            <Field label="配送先住所">
              <input
                type="text"
                className={inputCls}
                placeholder="都道府県・市区町村・番地（任意）"
                value={form.customerAddress}
                onChange={set("customerAddress")}
              />
            </Field>

            <Field label="備考・ご要望">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="配送日時のご希望・組み立てオプション等（任意）"
                value={form.notes}
                onChange={set("notes")}
              />
            </Field>

            {error && (
              <p className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* 右カラム：注文サマリー */}
          <div>
            <div className="sticky top-6 space-y-4">
              <h2 className="text-sm font-medium text-neutral-300 border-b border-neutral-800 pb-3">
                ご注文内容
              </h2>

              <div className="divide-y divide-neutral-800/60">
                {items.map((it) => (
                  <div key={it.productId} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-300 line-clamp-2">{it.productName}</p>
                      {it.sku && (
                        <p className="mt-0.5 font-mono text-[10px] text-neutral-600">{it.sku}</p>
                      )}
                      <p className="mt-0.5 text-[10px] text-neutral-500">× {it.quantity}</p>
                    </div>
                    <p className="shrink-0 text-xs text-neutral-300">
                      {it.unitPrice !== null
                        ? formatYen(it.unitPrice * it.quantity)
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">小計（税込）</span>
                  <span className="text-base font-light text-amber-400">{formatYen(subtotal)}</span>
                </div>
                <p className="mt-1.5 text-[10px] text-neutral-600">
                  送料・施工費は別途ご案内いたします。
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-sm font-medium tracking-wide text-neutral-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    送信中...
                  </>
                ) : (
                  "注文を送信する"
                )}
              </button>

              <p className="text-[10px] text-center text-neutral-600">
                送信後、担当者よりご連絡いたします。
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
