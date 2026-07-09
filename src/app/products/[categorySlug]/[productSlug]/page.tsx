import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { extractCategory } from "@/lib/types";
import { ImageGallery } from "./image-gallery";
import { InstallationGallery } from "./installation-gallery";
import { InquirySection } from "./inquiry-section";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import type { Category, ProductDetail, ProductImage, ProductListItem } from "@/lib/types";

// Complete Your Salon（カテゴリ違いの相性商品）の対象カテゴリ候補
const COMPLEMENTARY_CATEGORY_SLUGS = [
  "mirror",
  "trolley",
  "stool",
  "chair",
  "set-chair",
  "shampoo",
  "shampoo-stand",
];

// 空間提案として組み合わせが伝わる表示順（Mirror → Chair → Trolley → Shampoo）
const SALON_FLOW_ORDER = [
  "mirror",
  "chair",
  "set-chair",
  "trolley",
  "shampoo",
  "shampoo-stand",
  "stool",
];

// キャッチコピー（商品共通・仮テキスト。DBにフィールドが無いため固定文言）
const PRODUCT_TAGLINE = "空間の質を上げる、静かな存在感。";

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
      images: [
        mainImage
          ? { url: mainImage.image_url, width: 1200, height: 1200, alt: product.product_name }
          : { url: `${siteUrl}/logo.png`, width: 640, height: 512, alt: "BSS Beauty Salon Suppliers" },
      ],
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
      "status, stock_quantity, is_made_to_order, lead_time, pdf_url, warranty, " +
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

  // Complete Your Salon（カテゴリ違いの相性商品：ミラー・チェア・ワゴン・シャンプー台等を1点ずつ）
  const complementarySlugs = COMPLEMENTARY_CATEGORY_SLUGS.filter((s) => s !== cat.slug);
  let complementaryProducts: ProductListItem[] = [];
  if (complementarySlugs.length > 0) {
    const { data: compCatsData } = await supabase
      .from("categories")
      .select("id, slug")
      .in("slug", complementarySlugs);

    const compCatIds = (compCatsData ?? []).map((c) => c.id);

    if (compCatIds.length > 0) {
      const { data: compProductsRaw } = await supabase
        .from("products")
        .select(
          "id, product_name, slug, sku, selling_price, color, " +
          "categories(id, name, slug), " +
          "product_images(id, image_url, image_type, alt_text, sort_order)"
        )
        .not("category_id", "is", null)
        .eq("visibility", "public")
        .in("category_id", compCatIds);

      const seen = new Set<string>();
      for (const p of (compProductsRaw ?? []) as unknown as ProductListItem[]) {
        const pCat = extractCategory(p.categories);
        if (!pCat || seen.has(pCat.id)) continue;
        seen.add(pCat.id);
        complementaryProducts.push(p);
      }

      // 空間提案として伝わるよう Mirror → Chair → Trolley → Shampoo の順に並べ替え
      complementaryProducts.sort((a, b) => {
        const aSlug = extractCategory(a.categories)?.slug ?? "";
        const bSlug = extractCategory(b.categories)?.slug ?? "";
        const aIdx = SALON_FLOW_ORDER.indexOf(aSlug);
        const bIdx = SALON_FLOW_ORDER.indexOf(bSlug);
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
      });
    }
  }

  const images = ((product.product_images ?? []) as ProductImage[])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  // image_url が null のレコードを除いた最初の有効な画像URL
  const firstValidImageUrl =
    images.find((img) => !!img.image_url)?.image_url ?? null;

  // サロン設置イメージ（image_type === 'usage'）
  const installationImages = images.filter((img) => img.image_type === "usage");

  // サイズサマリー（dimensions優先、なければ幅×奥行×高さを合成）
  const sizeSummary =
    product.dimensions ??
    ([
      product.width_mm  ? `幅${product.width_mm}mm`   : null,
      product.depth_mm  ? `奥行${product.depth_mm}mm` : null,
      product.height_mm ? `高さ${product.height_mm}mm` : null,
    ].filter((v): v is string => !!v).join(" × ") || null);

  // Specifications（SIZE / COLOR / MATERIAL / DELIVERY / PRODUCTION、保証があればWARRANTYも）
  // ファーストビューでCTAまで収まるよう1つのコンパクトな一覧に統合
  const specRows: { label: string; value: string }[] = [
    sizeSummary       ? { label: "SIZE",     value: sizeSummary }      : null,
    product.color     ? { label: "COLOR",    value: product.color }    : null,
    product.material  ? { label: "MATERIAL", value: product.material } : null,
    { label: "DELIVERY", value: "個別配送（送料は別途お見積り）" },
    product.lead_time
      ? { label: "PRODUCTION", value: product.lead_time }
      : product.is_made_to_order
        ? { label: "PRODUCTION", value: "受注生産" }
        : { label: "PRODUCTION", value: "在庫品・随時出荷" },
    product.warranty  ? { label: "WARRANTY", value: product.warranty } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  // パンくずの末尾は SKU slug（仕様通り）
  const breadcrumbEnd = product.sku ? slugifyForUrl(product.sku) : product.id;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bss-japan.com";
  const productUrl = `${siteUrl}/products/${cat.slug}/${breadcrumbEnd}`;
  const ogImage = images[0]?.image_url ?? `${siteUrl}/logo.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    ...(product.sku        ? { sku:         product.sku         } : {}),
    ...(product.description ? { description: product.description } : {}),
    image: ogImage,
    brand: { "@type": "Brand", name: "BSS Beauty Salon Suppliers" },
    url: productUrl,
    ...(product.selling_price != null
      ? {
          offers: {
            "@type": "Offer",
            price: product.selling_price,
            priceCurrency: "JPY",
            availability:
              product.stock_quantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: productUrl,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      {/* ── JSON-LD 構造化データ ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

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

      {/* ── Hero（PC: サムネイル＋商品画像＋情報の3カラム構成／モバイル: 縦積み） ── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">

        {/* ── 画像ギャラリー（左：縦サムネイル／中央：商品画像） ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ImageGallery images={images} productName={product.product_name} />
        </div>

        {/* ── 商品情報カラム（ファーストビューでCTAまで収まるようコンパクトに構成） ── */}
        <div className="space-y-5">

          {/* COLLECTION名 */}
          <div>
            <p className="text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Collection
            </p>
            <p className="mt-1 text-xs tracking-[0.15em] text-neutral-500">
              {cat.name}
            </p>
          </div>

          {/* 商品名・バッジ・SKU */}
          <div>
            <h1 className="text-[26px] font-light leading-snug tracking-wide text-neutral-100">
              {product.product_name}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={product.status} />
              <StockBadge qty={product.stock_quantity} isMto={product.is_made_to_order} />
              {product.sku && (
                <span className="font-mono text-[11px] text-neutral-600">SKU: {product.sku}</span>
              )}
            </div>
          </div>

          {/* キャッチコピー */}
          <p className="text-sm font-light italic leading-relaxed tracking-wide text-amber-100/80 sm:text-base">
            {PRODUCT_TAGLINE}
          </p>

          {/* 商品説明（2〜3行に要約） */}
          {product.description && (
            <p className="line-clamp-3 text-sm leading-[1.8] text-neutral-400">
              {product.description}
            </p>
          )}

          {/* 価格 */}
          <div className="border-y border-neutral-800 py-4">
            <p className="text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
              Price
            </p>
            {product.selling_price != null && product.selling_price > 0 ? (
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

          {/* Specifications（SIZE / COLOR / MATERIAL / DELIVERY / PRODUCTION） */}
          {specRows.length > 0 && (
            <div>
              <p className="mb-1 text-[9px] font-medium tracking-[0.5em] text-neutral-600 uppercase">
                Specifications
              </p>
              <div className="divide-y divide-neutral-800/60">
                {specRows.map((s) => (
                  <div key={s.label} className="flex items-center justify-between py-2.5">
                    <span className="text-[10px] tracking-[0.25em] text-neutral-600">
                      {s.label}
                    </span>
                    <span className="text-right text-xs text-neutral-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 受注生産の注意書き */}
          {product.stock_quantity === 0 && product.is_made_to_order && (
            <p className="rounded-xl border border-amber-800/30 bg-amber-950/20 px-5 py-3 text-xs leading-relaxed text-amber-300/80">
              この商品は受注生産品です。ご注文後に製造を開始いたします。
              {product.lead_time && `　納期の目安：${product.lead_time}`}
            </p>
          )}

          {/* ── CTAクラスター（お問い合わせ・見積もり／カートに入れる／カートを見るの3構成） ── */}
          <div className="space-y-3 rounded-2xl border border-neutral-800/70 bg-neutral-900/20 p-5">
            {/* カートに入れる（価格未設定商品は非表示） */}
            {product.selling_price != null && product.selling_price > 0 && (
              <AddToCartButton
                productId={product.id}
                productName={product.product_name}
                sku={product.sku}
                unitPrice={product.selling_price}
                imageUrl={firstValidImageUrl}
                categorySlug={cat.slug}
                productSlug={breadcrumbEnd}
              />
            )}

            {/* お問い合わせ・お見積もり（モーダル+スティッキー統合） */}
            <InquirySection
              productId={product.id}
              productName={product.product_name}
              sku={product.sku}
              categorySlug={cat.slug}
            />

            {/* カートを見る／仕様書PDF */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <Link
                href="/cart"
                className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-amber-400"
              >
                <ShoppingCart size={13} />
                カートを見る
              </Link>
              {product.pdf_url && (
                <a
                  href={product.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-amber-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
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
                  仕様書PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── サロン設置イメージ（Hero直下・image_type === 'usage' の画像がある場合のみ） ── */}
      {installationImages.length > 0 && (
        <InstallationGallery
          images={installationImages}
          productName={product.product_name}
        />
      )}

      {/* ── Brand Story ── */}
      <section className="mt-20 border-y border-amber-500/20 bg-black px-6 py-28 text-center">
        <div className="mx-auto mb-8 h-px w-16 bg-amber-500/40" />
        <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
          Designed for Beautiful Salons.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-[2] tracking-wide text-neutral-500">
          BSSは、家具を売るだけではなく、美容室というブランド空間をデザインします。
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-amber-500/40" />
      </section>

      {/* ── Complete Your Salon（空間提案：組み合わせが伝わるフロー表示） ── */}
      {complementaryProducts.length > 0 && (
        <section className="mt-24 border-t border-neutral-800/60 pt-16">
          <div className="mb-14 text-center">
            <p className="mb-3 text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
              Space Styling
            </p>
            <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
              Complete Your Salon
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-neutral-500">
              ミラー、チェア、ワゴン、シャンプー台まで。空間全体で美しく調和する組み合わせをご提案します。
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-10">
            {complementaryProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-5">
                <div className="w-36 sm:w-44">
                  <ProductCard p={p} />
                </div>
                {i < complementaryProducts.length - 1 && (
                  <span className="text-2xl font-extralight text-amber-500/40">+</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ブランドメッセージ ── */}
      <section className="mt-24 border-y border-amber-500/20 bg-black px-6 py-32 text-center">
        <div className="mx-auto mb-10 h-px w-20 bg-amber-500/40" />
        <p className="text-2xl font-light tracking-[0.35em] text-neutral-100 sm:text-3xl">
          BEAUTY SALON SUPPLIERS
        </p>
        <p className="mt-5 text-sm font-light italic tracking-wide text-amber-400/90 sm:text-base">
          We Design Beautiful Salons.
        </p>
        <div className="mx-auto mt-10 h-px w-20 bg-amber-500/40" />
      </section>

      {/* スティッキーバー分の余白 */}
      <div className="h-24" />
    </div>
  );
}
