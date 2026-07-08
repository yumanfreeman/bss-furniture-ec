"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { label: "商品一覧", href: "/products" },
  { label: "Works", href: "/works" },
  { label: "Interior", href: "/interior" },
  { label: "Opening Support", href: "/opening-support" },
  { label: "Contact", href: "/contact" },
  { label: "カート", href: "/cart" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:text-amber-400"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-neutral-800 bg-neutral-950 px-6 py-4">
          <nav aria-label="モバイルナビゲーション">
            <ul className="space-y-1">
              {MOBILE_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm tracking-wide text-neutral-300 transition-colors hover:bg-neutral-900 hover:text-amber-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
