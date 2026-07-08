import Link from "next/link";
import Image from "next/image";
import { extractCategory } from "@/lib/types";
import { slugifyForUrl } from "@/lib/slugify";
import type { ProductListItem } from "@/lib/types";

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function productHref(catSlug: string | undefined, p: ProductListItem): string {
  if (!catSlug) return "#";
  const key = p.sku ? slugifyForUrl(p.sku) : p.id;
  return `/products/${catSlug}/${key}`;
}

// 商品一覧ページ・商品詳細ページ（おすすめ商品）で共通利用する商品カードUI
export function ProductCard({ p }: { p: ProductListItem }) {
  const cat = extractCategory(p.categories);
  const imgs = p.product_images ?? [];
  const mainImg =
    imgs.find((i) => i.image_type === "main") ??
    imgs.slice().sort((a, b) => a.sort_order - b.sort_order)[0];
  const href = productHref(cat?.slug, p);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]"
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-950">
        {mainImg?.image_url ? (
          <Image
            src={mainImg.image_url}
            alt={mainImg.alt_text ?? p.product_name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[9px] text-neutral-800">
            NO IMAGE
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {cat?.slug && (
          <span className="font-mono text-[9px] text-amber-600/70">{cat.slug}</span>
        )}
        <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-200 transition-colors group-hover:text-amber-300">
          {p.product_name}
        </p>
        {p.sku && (
          <p className="font-mono text-[9px] text-neutral-700">{p.sku}</p>
        )}
        <p className="mt-auto pt-1.5 text-sm font-semibold text-amber-400">
          {p.selling_price != null ? (
            formatYen(p.selling_price)
          ) : (
            <span className="text-[10px] font-normal text-neutral-600">
              価格はお問い合わせください
            </span>
          )}
        </p>
        <span className="mt-1 block rounded-lg border border-neutral-800 py-1.5 text-center text-[10px] font-medium tracking-wide text-neutral-500 transition-colors group-hover:border-amber-500/50 group-hover:text-amber-400">
          詳細を見る →
        </span>
      </div>
    </Link>
  );
}
