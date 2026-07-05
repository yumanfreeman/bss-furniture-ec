"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartCount, CART_UPDATE_EVENT } from "@/lib/cart";

export function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getCartCount());
    update();
    window.addEventListener(CART_UPDATE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-neutral-400 transition-colors hover:text-amber-400"
    >
      <ShoppingCart size={16} />
      <span className="hidden sm:inline">カート</span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 font-mono text-[9px] font-bold leading-none text-neutral-950">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
