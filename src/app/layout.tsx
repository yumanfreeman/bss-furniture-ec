import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BSS | Beauty Salon Suppliers",
  description: "業務用美容家具・美容器具の卸販売",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* ── ヘッダー ── */}
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex flex-col leading-none">
              <span className="text-[10px] font-medium tracking-[0.5em] text-amber-500 uppercase">
                Beauty Salon Suppliers
              </span>
              <span className="text-xl font-semibold tracking-wider text-neutral-100">BSS</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/products" className="text-neutral-400 transition-colors hover:text-amber-400">
                商品一覧
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)]">{children}</main>

        {/* ── フッター ── */}
        <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-center">
          <p className="text-[10px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
            Beauty Salon Suppliers
          </p>
          <p className="mt-1 text-[9px] tracking-[0.35em] text-neutral-800 uppercase">
            © 2025 BSS Japan. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
