import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { extractCategory } from "@/lib/types";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

const WORKS_TITLE = "Works | BSS Beauty Salon Suppliers";
const WORKS_DESCRIPTION =
  "BSSの施工事例。美容家具の納品だけでなく、内装設計・リフォーム・開業支援まで一貫してサポートするサロン空間ブランドです。";

export const metadata: Metadata = {
  title: WORKS_TITLE,
  description: WORKS_DESCRIPTION,
  alternates: { canonical: "/works" },
  openGraph: {
    title: WORKS_TITLE,
    description: WORKS_DESCRIPTION,
    url: "/works",
    type: "website",
  },
};

type WorkProductRow = {
  id: string;
  product_name: string;
  sku: string | null;
  categories: Category | Category[] | null;
};

type WorkImageRow = {
  id: string;
  image_url: string | null;
  alt_text: string | null;
  products: WorkProductRow | WorkProductRow[] | null;
};

type WorkItem = {
  id: string;
  imageUrl: string;
  altText: string | null;
  productName: string;
  categoryName: string | null;
  href: string;
};

export default async function WorksPage() {
  const supabase = createClient();

  // サロン設置イメージ（image_type === 'usage'、公開中のBSS商品のみ）を取得
  const { data: rawRows } = await supabase
    .from("product_images")
    .select(
      "id, image_url, alt_text, " +
        "products!inner(id, product_name, sku, category_id, visibility, categories(id, name, slug))",
    )
    .eq("image_type", "usage")
    .eq("products.visibility", "public")
    .not("products.category_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(12);

  const works: WorkItem[] = ((rawRows ?? []) as unknown as WorkImageRow[]).flatMap((row) => {
    if (!row.image_url) return [];
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    if (!product) return [];
    const cat = extractCategory(product.categories);
    const key = product.sku ? slugifyForUrl(product.sku) : product.id;
    const href = cat?.slug ? `/products/${cat.slug}/${key}` : "/products";

    return [
      {
        id: row.id,
        imageUrl: row.image_url,
        altText: row.alt_text,
        productName: product.product_name,
        categoryName: cat?.name ?? null,
        href,
      },
    ];
  });

  return (
    <div className="bg-neutral-950">

      {/* ── ヒーロー ── */}
      <section className="border-b border-neutral-800 px-6 py-28 text-center">
        <p className="mb-5 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
          Works
        </p>
        <h1 className="text-4xl font-light leading-snug tracking-wider text-neutral-100 sm:text-5xl">
          Salon Design
          <br />
          <span className="text-amber-400">&amp; Installation Works</span>
        </h1>
        <div className="mx-auto my-8 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-500">
          美容家具の納品だけでなく、内装設計・リフォーム・開業支援まで一貫してサポート。
          <br className="hidden sm:block" />
          実際にサロンへ設置されたイメージから、空間づくりのご提案をご覧いただけます。
        </p>
      </section>

      {/* ── 施工事例 / サロン設置イメージ ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        {/* セクションラベル */}
        <div className="mb-14 flex items-center gap-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <p className="text-[10px] tracking-[0.5em] text-neutral-600 uppercase">
            Salon Installation Images
          </p>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {works.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {works.map((w) => (
              <Link
                key={w.id}
                href={w.href}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
              >
                <Image
                  src={w.imageUrl}
                  alt={w.altText ?? `${w.productName} サロン設置イメージ`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {w.categoryName && (
                  <span className="absolute right-6 top-6 border border-amber-500/30 px-3 py-1 text-[10px] tracking-[0.25em] text-amber-500/80 uppercase">
                    {w.categoryName}
                  </span>
                )}

                <div className="relative flex flex-col gap-2 p-7">
                  <div className="h-px w-8 bg-amber-600/50 transition-all duration-300 group-hover:w-14 group-hover:bg-amber-400" />
                  <p className="line-clamp-2 text-lg font-light tracking-widest text-neutral-100 transition-colors duration-300 group-hover:text-amber-300">
                    {w.productName}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] tracking-[0.2em] text-neutral-400 uppercase transition-colors duration-300 group-hover:text-amber-400">
                    商品を見る
                    <span className="font-mono tracking-normal">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── フォールバック：施工イメージ準備中 ── */
          <div className="flex flex-col items-center gap-6 border border-dashed border-neutral-800 px-6 py-24 text-center">
            <p className="text-sm text-neutral-500">
              施工イメージを準備中です。近日公開予定です。
            </p>
            <Link
              href="/contact"
              className="inline-block bg-amber-500 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
            >
              無料レイアウト相談
            </Link>
          </div>
        )}
      </section>

      {/* ── お問い合わせ CTA ── */}
      <section className="border-t border-neutral-800 px-6 py-24 text-center">
        <p className="mb-4 text-[10px] tracking-[0.6em] text-amber-500 uppercase">Contact</p>
        <h2 className="mb-6 text-2xl font-light tracking-wider text-neutral-200 sm:text-3xl">
          サロンの空間づくりをご相談ください
        </h2>
        <p className="mx-auto mb-12 max-w-md text-sm leading-relaxed text-neutral-500">
          内装設計・リフォーム・開業支援など、まずはお気軽にお問い合わせください。
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-block bg-amber-500 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
          >
            無料レイアウト相談
          </Link>
          <Link
            href="/products"
            className="inline-block border border-neutral-700 px-10 py-4 text-xs font-light tracking-[0.3em] text-neutral-400 uppercase transition-colors hover:border-amber-500/60 hover:text-amber-400"
          >
            商品を見る
          </Link>
        </div>
      </section>

    </div>
  );
}
