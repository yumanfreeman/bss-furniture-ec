"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function OrderCompleteContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24 text-center">
      <CheckCircle2 size={52} className="mb-6 text-emerald-500" />

      <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
        Order Complete
      </p>
      <h1 className="mt-2 text-2xl font-light tracking-wider text-neutral-200">
        ご注文ありがとうございます
      </h1>

      {orderNumber && (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900/60 px-8 py-4">
          <p className="text-xs text-neutral-500">注文番号</p>
          <p className="mt-1 font-mono text-xl font-light tracking-widest text-amber-400">
            {orderNumber}
          </p>
        </div>
      )}

      <p className="mt-8 max-w-sm text-sm leading-relaxed text-neutral-400">
        担当者よりご入力いただいたメールアドレスへご連絡いたします。
        <br />
        今しばらくお待ちください。
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/products"
          className="border border-amber-500/50 px-8 py-3 text-xs font-medium tracking-widest text-amber-400 uppercase transition-colors hover:bg-amber-500/10"
        >
          他の商品を見る
        </Link>
        <Link
          href="/"
          className="border border-neutral-700 px-8 py-3 text-xs font-medium tracking-widest text-neutral-400 uppercase transition-colors hover:border-neutral-500 hover:text-neutral-200"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense>
      <OrderCompleteContent />
    </Suspense>
  );
}
