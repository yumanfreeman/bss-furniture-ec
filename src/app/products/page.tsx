import Link from "next/link";
import type { Metadata } from "next";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sortCategories, getCategoryPriorityByNameSlug } from "@/lib/category-order";
import { extractCategory } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import type { Category, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const PRODUCTS_TITLE = "商品一覧 | BSS Beauty Salon Suppliers";
const PRODUCTS_DESCRIPTION =
  "セット椅子・シャンプー台・ミラー・ワゴンなど、美容室向け業務用家具の商品一覧です。";

export const metadata: Metadata = {
  title: PRODUCTS_TITLE,
  description: PRODUCTS_DESCRIPTION,
  alternates: { canonical: "/products" },
  openGraph: {
    title: PRODUCTS_TITLE,
    description: PRODUCTS_DESCRIPTION,
    url: "/products",
    type: "website",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";

  const supabase = createClient();

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  let productQuery = supabase
    .from("products")
    .select(
      "id, product_name, slug, sku, selling_price, color, description, " +
      "categories(id, name, slug), " +
      "product_images(id, image_url, image_type, alt_text, sort_order)"
    )
    .not("category_id", "is", null)
    .eq("visibility", "public")
    .order("sku", { ascending: true, nullsFirst: false });

  if (keyword) {
    productQuery = productQuery.or(
      `product_name.ilike.%${keyword}%,sku.ilike.%${keyword}%,description.ilike.%${keyword}%`
    );
  }

  const { data: productsData } = await productQuery;

  const categories = sortCategories((categoriesData ?? []) as Category[]);
  const rawProducts = (productsData ?? []) as unknown as ProductListItem[];

  // カテゴリ優先度順 → SKU昇順 でクライアントソート
  const products = [...rawProducts].sort((a, b) => {
    const catA = extractCategory(a.categories);
    const catB = extractCategory(b.categories);
    const priA = getCategoryPriorityByNameSlug(catA?.name, catA?.slug);
    const priB = getCategoryPriorityByNameSlug(catB?.name, catB?.slug);
    if (priA !== priB) return priA - priB;
    return (a.sku ?? "").localeCompare(b.sku ?? "");
  });

  // 非検索時：カテゴリ別グループを構築（ソート済みなので順番通りに追記）
  type Group = { cat: Category; items: ProductListItem[] };
  const groups: Group[] = [];
  if (!keyword) {
    for (const p of products) {
      const cat = extractCategory(p.categories);
      if (!cat) continue;
      const last = groups[groups.length - 1];
      if (last && last.cat.slug === cat.slug) {
        last.items.push(p);
      } else {
        groups.push({ cat: cat as Category, items: [p] });
      }
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      {/* ── ページヘッダー ── */}
      <div className="mb-6">
        <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
          Products
        </p>
        <h1 className="mt-1 text-2xl font-light tracking-wider text-neutral-200">
          商品一覧
        </h1>
      </div>

      {/* ── 検索バー ── */}
      <form action="/products" method="GET" className="mb-6">
        <div className="relative max-w-lg">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            name="q"
            defaultValue={keyword}
            placeholder="商品名・SKU・説明で検索"
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-10 pr-10 text-sm text-neutral-200 placeholder-neutral-700 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
          />
          {keyword && (
            <Link
              href="/products"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
              aria-label="検索クリア"
            >
              <X size={15} />
            </Link>
          )}
        </div>
      </form>

      {/* ── カテゴリ（モバイル：横スクロールチップ） ── */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <Link
          href="/products"
          className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] transition-colors ${
            !keyword
              ? "border-amber-500/60 bg-amber-950/30 text-amber-400"
              : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300"
          }`}
        >
          all
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products/${cat.slug}`}
            className="shrink-0 rounded-full border border-neutral-800 px-3 py-1 font-mono text-[10px] text-neutral-500 transition-colors hover:border-neutral-600 hover:text-neutral-300"
          >
            {cat.slug}
          </Link>
        ))}
      </div>

      <div className="flex gap-8">
        {/* ── カテゴリサイドバー（PC） ── */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <p className="mb-3 text-[9px] font-medium tracking-[0.4em] text-neutral-600 uppercase">
            Category
          </p>
          <div className="flex flex-col gap-0.5">
            <Link
              href="/products"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs transition-colors ${
                !keyword
                  ? "bg-amber-950/30 text-amber-400"
                  : "text-neutral-500 hover:bg-neutral-800/50 hover:text-neutral-300"
              }`}
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-60" />
              all
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.slug}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs text-neutral-500 transition-colors hover:bg-neutral-800/50 hover:text-neutral-300"
              >
                <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                {cat.slug}
              </Link>
            ))}
          </div>
        </aside>

        {/* ── 商品グリッド ── */}
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-xs text-neutral-600">
            {keyword ? (
              <>
                <span className="text-neutral-400">&ldquo;{keyword}&rdquo;</span>
                {" の検索結果 — "}
                <span className="text-neutral-300">{products.length} 件</span>
              </>
            ) : (
              <span className="text-neutral-700">{products.length} 件</span>
            )}
          </p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-sm text-neutral-600">
                {keyword ? `「${keyword}」に一致する商品が見つかりません` : "公開中の商品がありません"}
              </p>
              {keyword && (
                <Link href="/products" className="mt-4 text-xs text-amber-500 hover:text-amber-400">
                  ← すべての商品を表示
                </Link>
              )}
            </div>
          ) : keyword ? (
            /* 検索結果：フラットグリッド */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            /* 通常表示：カテゴリ別グループ */
            <div className="space-y-10">
              {groups.map(({ cat, items }) => (
                <section key={cat.id}>
                  <div className="mb-3 flex items-center gap-3 border-b border-neutral-800/50 pb-2">
                    <p className="font-mono text-[10px] font-medium tracking-[0.3em] text-amber-500/80 uppercase">
                      {cat.slug}
                    </p>
                    <span className="font-mono text-[9px] text-neutral-700">
                      {items.length}件
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {items.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
