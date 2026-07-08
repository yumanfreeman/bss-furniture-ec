import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { CartButton } from "@/components/cart-button";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "BSS | Beauty Salon Suppliers",
  description: "業務用美容家具・美容器具の卸販売",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* ── ヘッダー ── */}
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm relative">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="BSS Beauty Salon Suppliers"
                width={120}
                height={96}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* デスクトップナビ */}
            <nav className="hidden items-center gap-4 text-sm md:flex">
              <CartButton />
              <Link href="/products" className="text-neutral-400 transition-colors hover:text-amber-400">
                商品一覧
              </Link>
            </nav>

            {/* モバイルナビ（カート + ハンバーガーメニュー） */}
            <div className="flex items-center gap-1 md:hidden">
              <CartButton />
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)]">{children}</main>

        {/* ── フッター ── */}
        <footer className="border-t border-neutral-800 bg-neutral-950">
          <div className="mx-auto max-w-7xl px-6 py-20">

            {/* ブランド + ナビ */}
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[2fr_1fr]">

              {/* 左: ブランド */}
              <div>
                <p className="mb-6 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
                  BSS
                </p>
                <p className="max-w-md text-sm leading-[1.9] text-neutral-500">
                  Beauty Salon Suppliers は、美容家具の提案から内装設計、
                  リフォーム、開業支援まで一貫してサポートする
                  サロン空間ブランドです。
                </p>
              </div>

              {/* 右: ナビ */}
              <nav aria-label="フッターナビ">
                <p className="mb-6 text-[9px] tracking-[0.5em] text-neutral-700 uppercase">
                  Navigation
                </p>
                <ul className="space-y-4">
                  {[
                    { label: "Products",        href: "/products"        },
                    { label: "Works",           href: "/works"           },
                    { label: "Interior",        href: "/interior"        },
                    { label: "Opening Support", href: "/opening-support" },
                    { label: "Contact",         href: "/contact"         },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-xs tracking-[0.2em] text-neutral-500 transition-colors duration-200 hover:text-amber-400"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

            </div>

            {/* 区切り線 */}
            <div className="mt-20 h-px bg-neutral-800" />

            {/* コピーライト */}
            <p className="mt-8 text-center text-[10px] tracking-[0.4em] text-neutral-700 uppercase">
              © 2026 BSS. Beauty Salon Suppliers.
            </p>

          </div>
        </footer>
      </body>
    </html>
  );
}
