import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { sortCategories } from "@/lib/category-order";
import { extractCategory } from "@/lib/types";
import type { Category, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

export default async function TopPage() {
  const supabase = createClient();

  const [{ data: categoriesData }, { data: featuredData }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase
      .from("products")
      .select(
        "id, product_name, slug, sku, selling_price, color, " +
        "categories(id, name, slug), " +
        "product_images(id, image_url, image_type, alt_text, sort_order)"
      )
      .not("category_id", "is", null)
      .eq("visibility", "public")
      .limit(8),
  ]);

  const rawCats = (categoriesData ?? []) as Category[];
  const categories = sortCategories(rawCats);
  const featured = (featuredData ?? []) as unknown as ProductListItem[];

  return (
    <div>
      {/* ── ヒーローバナー ── */}
      <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 py-24 text-center">
        <p className="mb-3 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
          Beauty Salon Suppliers
        </p>
        <h1 className="text-4xl font-light tracking-wider text-neutral-100">業務用美容家具</h1>
        <p className="mt-4 text-sm text-neutral-500">
          セット椅子・シャンプー台・ミラー・ワゴン等の卸販売
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block border border-amber-500 px-8 py-3 text-xs font-medium tracking-[0.3em] text-amber-400 uppercase transition-colors hover:bg-amber-500 hover:text-neutral-950"
        >
          商品を見る
        </Link>
      </section>

      {/* ── カテゴリナビ ── */}
      <section className="border-b border-neutral-800 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.slug}`}
                className="rounded-full border border-neutral-700 px-4 py-1.5 text-xs font-mono text-neutral-400 transition-colors hover:border-amber-500/60 hover:text-amber-400"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 注目商品 ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">Featured</p>
              <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-200">注目商品</h2>
            </div>
            <Link href="/products" className="text-xs text-neutral-500 transition-colors hover:text-amber-400">
              すべて見る →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => {
              const cat = extractCategory(p.categories);
              const imgs = p.product_images ?? [];
              const mainImg = imgs.find((i) => i.image_type === "main") ?? imgs[0];
              const href = cat?.slug ? `/products/${cat.slug}/${p.slug ?? p.id}` : "/products";

              return (
                <Link
                  key={p.id}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-all hover:border-amber-500/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
                    {mainImg ? (
                      <Image
                        src={mainImg.image_url}
                        alt={p.product_name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-800">
                        NO IMAGE
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    {cat && (
                      <span className="font-mono text-[9px] text-amber-600/70">{cat.slug}</span>
                    )}
                    <p className="line-clamp-2 text-xs font-medium text-neutral-200 transition-colors group-hover:text-amber-300">
                      {p.product_name}
                    </p>
                    {p.selling_price != null && (
                      <p className="mt-1 text-sm font-semibold text-amber-400">
                        {formatYen(p.selling_price)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
