"use client";

import { useEffect, useState } from "react";
import { Mail, FileText } from "lucide-react";

type Props = {
  productName: string;
  sku: string | null;
};

export function StickyCTA({ productName, sku }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const subject = encodeURIComponent(
    `商品についてのお問い合わせ：${productName}${sku ? ` (${sku})` : ""}`,
  );
  const quoteSubject = encodeURIComponent(
    `お見積依頼：${productName}${sku ? ` (${sku})` : ""}`,
  );

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3">
        <p className="hidden min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-600 sm:block">
          {sku ?? productName}
        </p>
        <a
          href={`mailto:bss-Japan1001@gmail.com?subject=${subject}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400 sm:flex-none"
        >
          <Mail size={14} />
          お問い合わせ
        </a>
        <a
          href={`mailto:bss-Japan1001@gmail.com?subject=${quoteSubject}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-amber-400 sm:flex-none"
        >
          <FileText size={14} />
          お見積もり
        </a>
      </div>
    </div>
  );
}
