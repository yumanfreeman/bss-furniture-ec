"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { getCart, updateQuantity, removeFromCart, type CartItem } from "@/lib/cart";

export const dynamic = "force-dynamic";

function formatYen(n: number | null) {
  if (n === null) return "価格お問い合わせ";
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getCart());
    setMounted(true);
  }, []);

  function handleQuantity(productId: string, qty: number) {
    updateQuantity(productId, qty);
    setItems(getCart());
  }

  function handleRemove(productId: string) {
    removeFromCart(productId);
    setItems(getCart());
  }

  const subtotal = items.reduce(
    (sum, it) => sum + (it.unitPrice ?? 0) * it.quantity,
    0,
  );
  const hasUnpriced = items.some((it) => it.unitPrice === null);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* ヘッダー */}
      <div className="mb-10">
        <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">Cart</p>
        <h1 className="mt-1 text-2xl font-light tracking-wider text-neutral-200">カート</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center">
          <ShoppingCart size={40} className="text-neutral-700" />
          <p className="text-sm text-neutral-500">カートに商品がありません</p>
          <Link
            href="/products"
            className="border border-amber-500/50 px-6 py-2.5 text-xs font-medium tracking-widest text-amber-400 uppercase transition-colors hover:bg-amber-500/10"
          >
            商品を見る
          </Link>
        </div>
      ) : (
        <>
          {/* 商品リスト */}
          <div className="divide-y divide-neutral-800">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-wrap items-center gap-4 py-6 sm:flex-nowrap sm:gap-5"
              >
                {/* 画像 */}
                <Link
                  href={`/products/${item.categorySlug}/${item.productSlug}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 sm:h-20 sm:w-20"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-neutral-700">
                      NO IMG
                    </div>
                  )}
                </Link>

                {/* 商品情報 */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.categorySlug}/${item.productSlug}`}
                    className="text-sm font-medium text-neutral-200 hover:text-amber-400 line-clamp-2"
                  >
                    {item.productName}
                  </Link>
                  {item.sku && (
                    <p className="mt-0.5 font-mono text-[10px] text-neutral-600">{item.sku}</p>
                  )}
                  <p className="mt-1 text-sm font-medium text-amber-400">
                    {formatYen(item.unitPrice)}
                  </p>
                </div>

                {/* 数量・小計・削除（モバイルは折り返して1行、PCは既存レイアウトを維持） */}
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:contents">
                  {/* 数量 */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm text-neutral-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* 小計 */}
                  <div className="shrink-0 text-right sm:w-24">
                    <p className="text-sm text-neutral-300">
                      {item.unitPrice !== null
                        ? formatYen(item.unitPrice * item.quantity)
                        : "—"}
                    </p>
                  </div>

                  {/* 削除 */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="shrink-0 text-neutral-700 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 合計 */}
          <div className="mt-8 space-y-3 border-t border-neutral-800 pt-8">
            {hasUnpriced && (
              <p className="text-xs text-amber-500/80">
                ※ 価格未設定の商品が含まれています。合計額は参考値です。
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">小計（税込）</span>
              <span className="text-lg font-light text-amber-400">{formatYen(subtotal)}</span>
            </div>
            <p className="text-[10px] text-neutral-600">
              送料・組立費・施工費は別途見積もりとなります。
            </p>
          </div>

          {/* アクションボタン */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/checkout"
              className="flex items-center justify-center rounded-xl bg-amber-500 px-6 py-4 text-sm font-medium tracking-wide text-neutral-950 transition-colors hover:bg-amber-400"
            >
              注文内容を確認する
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center rounded-xl border border-neutral-700 px-6 py-4 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200"
            >
              買い物を続ける
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
