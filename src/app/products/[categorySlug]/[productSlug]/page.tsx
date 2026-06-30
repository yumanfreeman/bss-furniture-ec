import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { ImageGallery } from "./image-gallery";
import { InquirySection } from "./inquiry-section";
import { extractCategory } from "@/lib/types";
import type { Category, ProductDetail, ProductImage, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

// ── SEO メタデータ ──────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const supabase = createClient();

  const { data: catData } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("slug", categorySlug)
    .single();

  if (!catData) return { title: "BSS Beauty Salon Suppliers" };

  const { data: productsData } = await supabase
    .from("products")
    .select(
      "id, product_name, sku, description, " +
      "product_images(image_url, image_type, sort_order)"
    )
    .not("category_id", "is", null)
    .eq("visibility", "public")
    .eq("category_id", catData.id);

  type MetaProduct = {
    id: string;
    product_name: string;
    sku: string | null;
    description: string | null;
    product_images: { image_url: string; image_type: string; sort_order: number }[];
  };

  const products = (productsData ?? []) as unknown as MetaProduct[];
  const product = products.find(
    (p) => (p.sku ? slugifyForUrl(p.sku) : null) === productSlug || p.id === productSlug,
  );

  if (!product) return { title: "BSS Beauty Salon Suppliers" };

  // NEXT_PUBLIC_SITE_URL を .env.local に設定してください（例: https://bss-japan.com）
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bss-japan.com";
  const canonicalUrl = `${siteUrl}/products/${categorySlug}/${productSlug}`;

  const description = product.description
    ? product.description.replace(/\s+/g, " ").trim().slice(0, 155)
    : `${product.product_name}の詳細・価格・仕様はBSS Beauty Salon Suppliersでご確認ください。`;

  const mainImage =
    (product.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .find((i) => i.image_type === "main") ??
    (product.product_images ?? [])[0];

  return {
    title: `${product.product_name} | BSS Beauty Salon Suppliers`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${product.product_name} | BSS Beauty Salon Suppliers`,
      description,
      url: canonicalUrl,
      type: "website",
      ...(mainImage
        ? {
            images: [
              {
                url: mainImage.image_url,
                width: 1200,
                height: 1200,
                alt: product.product_name,
              },
            ],
          }
        : {}),
    },
  };
}

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    on_sale:      { label: "販売中",   cls: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50" },
    draft:        { label: "準備中",   cls: "bg-neutral-800 text-neutral-500 border-neutral-700" },
    discontinued: { label: "販売終了", cls: "bg-red-950/60 text-red-400 border-red-800/50" },
  };
  const { label, cls } = map[status] ?? {
    label: status,
    cls: "bg-neutral-800 text-neutral-500 border-neutral-700",
  };
  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

function StockBadge({ qty, isMto }: { qty: number; isMto: boolean }) {
  if (qty > 0) {
    return (
      <span className="rounded-full border border-emerald-800/50 bg-emerald-950/60 px-3 py-1 text-[10px] font-medium text-emerald-400">
        在庫あり（{qty}点）
      </span>
    );
  }
  if (isMto) {
    return (
      <span className="rounded-full border border-amber-800/50 bg-amber-950/30 px-3 py-1 text-[10px] font-medium text-amber-400">
        受注生産
      </span>
    );
  }
  return (
    <span className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[10px] font-medium text-neutral-500">
      在庫なし
    </span>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ categorySlug: string; productSlug: string }>;
}) {
  const { categorySlug, productSlug } = await params;
  const supabase = createClient();

  // Step 1: カテゴリを slug で取得
  const { data: catData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .single();

  if (!catData) notFound();
  const cat = catData as Category;

  // Step 2: そのカテゴリの公開商品を全件取得
  const { data: productsData } = await supabase
    .from("products")
    .select(
      "id, product_name, slug, sku, description, features, selling_price, " +
      "color, material, dimensions, width_mm, depth_mm, height_mm, " +
      "status, stock_quantity, is_made_to_order, lead_time, pdf_url, " +
      "categories(id, name, slug), " +
      "product_images(id, image_url, image_type, alt_text, sort_order)"
    )
    .not("category_id", "is", null)
    .eq("visibility", "public")
    .eq("category_id", cat.id);

  // Step 3: slugifyForUrl(sku) === productSlug で一致判定
  const products = (productsData ?? []) as unknown as ProductDetail[];
  const product = products.find(
    (p) =>
      (p.sku ? slugifyForUrl(p.sku) : null) === productSlug ||
      p.id === productSlug
  );

  if (!product) notFound();

  // 関連商品（同カテゴリ・自身除外・最大4件）
  const { data: relatedRaw } = await supabase
    .from("products")
    .select(
      "id, product_name, slug, sku, selling_price, color, " +
      "categories(id, name, slug), " +
      "product_images(id, image_url, image_type, alt_text, sort_order)"
    )
    .eq("visibility", "public")
    .eq("category_id", cat.id)
    .neq("id", product.id)
    .limit(4);

  const relatedProducts = (relatedRaw ?? []) as unknown as ProductListItem[];

  const images = ((product.product_images ?? []) as ProductImage[])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  // dimensions がある場合は個別の幅/奥行/高さ行を非表示（重複防止）
  const hasDimensions = !!product.dimensions;
  const specs: { label: string; value: string }[] = [
    product.color                          ? { label: "カラー", value: product.color                      } : null,
    product.material                       ? { label: "素材",   value: product.material                   } : null,
    product.dimensions                     ? { label: "サイズ", value: product.dimensions                 } : null,
    (!hasDimensions && product.width_mm)   ? { label: "幅",     value: `${product.width_mm} mm`           } : null,
    (!hasDimensions && product.depth_mm)   ? { label: "奥行",   value: `${product.depth_mm} mm`           } : null,
    (!hasDimensions && product.height_mm)  ? { label: "高さ",   value: `${product.height_mm} mm`          } : null,
    product.lead_time                      ? { label: "納期",   value: product.lead_time                  } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  // パンくずの末尾は SKU slug（仕様通り）
  const breadcrumbEnd = product.sku ? slugifyForUrl(product.sku) : product.id;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* ── パンくず ── */}
      <nav className="mb-10 flex items-center gap-2 text-[11px] text-neutral-600">
        <Link href="/" className="font-mono transition-colors hover:text-amber-400">
          home
        </Link>
        <span className="text-neutral-800">/</span>
        <Link href="/products" className="font-mono transition-colors hover:text-amber-400">
          products
        </Link>
        <span className="text-neutral-800">/</span>
        <Link
          href={`/products/${cat.slug}`}
          className="font-mono transition-colors hover:text-amber-400"
        >
          {cat.slug}
        </Link>
        <span className="text-neutral-800">/</span>
        <span className="max-w-[180px] truncate font-mono text-neutral-500">
          {breadcrumbEnd}
        </span>
      </nav>

      {/* ── メインレイアウト（PC: 左画像・右情報） ── */}
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1fr]">

        {/* ── 画像ギャラリー ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ImageGallery images={images} productName={product.product_name} />
        </div>

        {/* ── 商品情報カラム ── */}
        <div className="space-y-8">

          {/* バッジ群 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-800/40 bg-amber-950/20 px-3 py-1 font-mono text-[10px] text-amber-500/80">
              {cat.slug}
            </span>
            <StatusBadge status={product.status} />
            <StockBadge qty={product.stock_quantity} isMto={product.is_made_to_order} />
          </div>

          {/* 商品名 */}
          <div>
            <h1 className="text-[26px] font-light leading-snug tracking-wide text-neutral-100">
              {product.product_name}
            </h1>
            {product.sku && (
              <p className="mt-2 font-mono text-xs text-neutral-600">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* 価格 */}
          <div className="border-y border-neutral-800 py-5">
            <p className="text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
              Price
            </p>
            {product.selling_price != null ? (
              <>
                <p className="mt-2 text-4xl font-light tracking-tight text-amber-400">
                  {formatYen(product.selling_price)}
                </p>
                <p className="mt-1.5 text-[11px] text-neutral-600">税込・卸価格</p>
              </>
            ) : (
              <p className="mt-2 text-lg font-light tracking-wide text-neutral-400">
                価格はお問い合わせください
              </p>
            )}
          </div>

          {/* 受注生産の注意書き */}
          {product.stock_quantity === 0 && product.is_made_to_order && (
            <p className="rounded-xl border border-amber-800/30 bg-amber-950/20 px-5 py-4 text-xs leading-relaxed text-amber-300/80">
              この商品は受注生産品です。ご注文後に製造を開始いたします。
              {product.lead_time && `　納期の目安：${product.lead_time}`}
            </p>
          )}

          {/* 説明 */}
          {product.description && (
            <div>
              <p className="mb-3 text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
                Description
              </p>
              <p className="whitespace-pre-wrap text-sm leading-[1.9] text-neutral-400">
                {product.description}
              </p>
            </div>
          )}

          {/* スペック */}
          {specs.length > 0 && (
            <div>
              <p className="mb-4 text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
                Specifications
              </p>
              <div className="divide-y divide-neutral-800/60 overflow-hidden rounded-xl border border-neutral-800">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center gap-6 px-5 py-3">
                    <span className="w-16 shrink-0 text-[10px] tracking-wide text-neutral-600">
                      {s.label}
                    </span>
                    <span className="text-xs text-neutral-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 特徴 */}
          {product.features && (
            <div>
              <p className="mb-3 text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
                Features
              </p>
              <p className="whitespace-pre-wrap text-sm leading-[1.9] text-neutral-400">
                {product.features}
              </p>
            </div>
          )}

          {/* 仕様書PDF */}
          {product.pdf_url && (
            <a
              href={product.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 px-6 py-3.5 text-sm font-medium text-neutral-400 transition-colors hover:border-amber-500/50 hover:text-amber-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              仕様書をダウンロード（PDF）
            </a>
          )}

          {/* ── 問い合わせ（モーダル+スティッキー統合） ── */}
          <InquirySection
            productId={product.id}
            productName={product.product_name}
            sku={product.sku}
            categorySlug={cat.slug}
          />
        </div>
      </div>

      {/* ── 関連商品 ── */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-neutral-800/60 pt-16">
          <div className="mb-8">
            <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
              Related Products
            </p>
            <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-300">
              同カテゴリの商品
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => {
              const relCat = extractCategory(p.categories);
              const relKey = p.sku ? slugifyForUrl(p.sku) : p.id;
              const relHref = relCat
                ? `/products/${relCat.slug}/${relKey}`
                : "#";
              const imgs = (p.product_images ?? []) as ProductImage[];
              const mainImg =
                imgs.find((i) => i.image_type === "main") ?? imgs[0];

              return (
                <div
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 transition-all hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(201,168,76,0.08)]"
                >
                  {/* 画像 */}
                  <Link href={relHref} className="block">
                    <div className="relative aspect-square overflow-hidden bg-neutral-950">
                      {mainImg ? (
                        <Image
                          src={mainImg.image_url}
                          alt={mainImg.alt_text ?? p.product_name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-mono text-[9px] text-neutral-800">
                          NO IMAGE
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* テキスト情報 */}
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <Link href={relHref}>
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-neutral-300 transition-colors group-hover:text-amber-300">
                        {p.product_name}
                      </p>
                    </Link>
                    {p.sku && (
                      <p className="font-mono text-[9px] text-neutral-700">
                        {p.sku}
                      </p>
                    )}

                    {/* 価格 */}
                    <p className="mt-auto pt-1 text-xs font-medium text-amber-400">
                      {p.selling_price != null
                        ? formatYen(p.selling_price)
                        : <span className="text-[10px] font-normal text-neutral-600">価格はお問い合わせください</span>
                      }
                    </p>

                    {/* 詳細を見るボタン */}
                    <Link
                      href={relHref}
                      className="mt-1 block rounded-lg border border-neutral-700 py-1.5 text-center text-[10px] font-medium tracking-wide text-neutral-400 transition-colors hover:border-amber-500/60 hover:text-amber-400"
                    >
                      詳細を見る
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* スティッキーバー分の余白 */}
      <div className="h-24" />
    </div>
  );
}
