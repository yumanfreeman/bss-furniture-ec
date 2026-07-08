"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { addToCart } from "@/lib/cart";

type Props = {
  productId: string;
  productName: string;
  sku: string | null;
  unitPrice: number | null;
  imageUrl: string | null;
  categorySlug: string;
  productSlug: string;
};

export function AddToCartButton({
  productId,
  productName,
  sku,
  unitPrice,
  imageUrl,
  categorySlug,
  productSlug,
}: Props) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      productId,
      productName,
      sku,
      unitPrice,
      imageUrl,
      categorySlug,
      productSlug,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-medium tracking-wide transition-all ${
        added
          ? "border border-emerald-800/50 bg-emerald-950/60 text-emerald-400"
          : "border border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
      }`}
    >
      {added ? (
        <>
          <Check size={16} />
          カートに追加しました
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          カートに入れる
        </>
      )}
    </button>
  );
}
