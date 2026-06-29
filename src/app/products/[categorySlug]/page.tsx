import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sortCategories } from "@/lib/category-order";
import { extractCategory } from "@/lib/types";
import { slugifyForUrl } from "@/lib/slugify";
import type { Category, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function productHref(catSlug: string, p: ProductListItem): string {
  const key = p.sku ? slugifyForUrl(p.sku) : p.id;
  return `/products/${catSlug}/${key}`;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const supabase = createClient();

  const [{ data: catData }, { data: allCatsData }, { data: productsData }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("slug", categorySlug).single(),
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
      .order("product_name"),
  ]);

  if (!catData) notFound();

  const currentCat = catData as Category;
  const allCats = sortCategories((allCatsData ?? []) as Category[]);
  const allProducts = (productsData ?? []) as unknown as ProductListItem[];
  const products = allProducts.filter(
    (p) => extractCategory(p.categories)?.slug === categorySlug,
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* パンくず（slug 英語） */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-600">
        <Link href="/" className="transition-colors hover:text-amber-400">home</Link>
        <span>/</span>
        <Link href="/products" className="font-mono transition-colors hover:text-amber-400">products</Link>
        <span>/</span>
        <span className="font-mono text-amber-500">{currentCat.slug}</span>
      </nav>

      <div className="mb-8">
        <p className="font-mono text-[9px] font-medium tracking-[0.3em] text-amber-500">
          {currentCat.slug}
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-wider text-neutral-200">
          {currentCat.name}
        </h1>
        <p className="mt-1 text-xs text-neutral-600">{products.length} 件</p>
      </div>

      <div className="flex gap-8">
        {/* ── カテゴリサイドバー（slug 英語） ── */}
        <aside className="w-44 shrink-0">
          <p className="mb-3 text-[9px] font-medium tracking-[0.4em] text-neutral-600 uppercase">
            Category
          </p>
          <div className="flex flex-col gap-1">
            <Link
              href="/products"
              className="rounded px-2 py-1.5 font-mono text-xs text-neutral-500 transition-colors hover:text-amber-400"
            >
              all
            </Link>
            {allCats.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.slug}`}
                className={`rounded px-2 py-1.5 font-mono text-xs transition-colors hover:text-amber-400 ${
                  cat.slug === categorySlug
                    ? "bg-amber-950/30 text-amber-400"
                    : "text-neutral-500"
                }`}
              >
                {cat.slug}
              </Link>
            ))}
          </div>
        </aside>

        {/* ── 商品グリッド ── */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-600">このカテゴリの公開商品はありません</p>
              <Link href="/products" className="mt-4 inline-block text-xs text-amber-500 hover:text-amber-400">
                ← すべての商品へ
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const imgs = p.product_images ?? [];
                const mainImg = imgs.find((i) => i.image_type === "main") ?? imgs[0];

                return (
                  <Link
                    key={p.id}
                    href={productHref(categorySlug, p)}
                    className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-all hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(201,168,76,0.08)]"
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
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-200 transition-colors group-hover:text-amber-300">
                        {p.product_name}
                      </p>
                      {p.sku && (
                        <p className="font-mono text-[9px] text-neutral-700">{p.sku}</p>
                      )}
                      {p.selling_price != null && (
                        <p className="mt-auto pt-2 text-sm font-semibold text-amber-400">
                          {formatYen(p.selling_price)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
