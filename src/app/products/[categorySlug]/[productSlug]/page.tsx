import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, Palette, Ruler, ShieldCheck, Truck, ArrowRight, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { extractCategory } from "@/lib/types";
import { ImageGallery } from "./image-gallery";
import { InstallationGallery } from "./installation-gallery";
import { InquirySection } from "./inquiry-section";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import type { Category, ProductDetail, ProductImage, ProductListItem } from "@/lib/types";

// おすすめセット（カテゴリ違いの相性商品）の対象カテゴリ例
const COMPLEMENTARY_CATEGORY_SLUGS = ["mirror", "trolley", "stool"];

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

  // おすすめセット（カテゴリ違いの相性商品：ミラー・ワゴン・スツール等を1点ずつ）
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

  // 商品情報サマリー（アイコン付き：納期・カラー・サイズ・保証・配送方法）
  const sizeSummary =
    product.dimensions ??
    ([
      product.width_mm  ? `幅${product.width_mm}mm`   : null,
      product.depth_mm  ? `奥行${product.depth_mm}mm` : null,
      product.height_mm ? `高さ${product.height_mm}mm` : null,
    ].filter((v): v is string => !!v).join(" × ") || null);

  const infoItems: { label: string; value: string; icon: LucideIcon }[] = [
    product.lead_time ? { label: "納期",   value: product.lead_time, icon: Clock       } : null,
    product.color     ? { label: "カラー", value: product.color,     icon: Palette     } : null,
    sizeSummary        ? { label: "サイズ", value: sizeSummary,       icon: Ruler       } : null,
    product.warranty  ? { label: "保証",   value: product.warranty,  icon: ShieldCheck } : null,
    { label: "配送方法", value: "個別配送（送料は別途お見積り）", icon: Truck },
  ].filter((s): s is { label: string; value: string; icon: LucideIcon } => s !== null);

  // パンくずの末尾は SKU slug（仕様通り）
  const breadcrumbEnd = product.sku ? slugifyForUrl(product.sku) : product.id;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bss-japan.com";
  const productUrl = `${siteUrl}/products/${cat.slug}/${breadcrumbEnd}`;
  const ogImage = images[0]?.image_url ?? `${siteUrl}/logo.png`;

  // WHY THIS PRODUCT（商品ストーリー・仮テキスト）
  const productStory: { num: string; en: string; ja: string; text: string }[] = [
    {
      num: "01",
      en: "For Salons",
      ja: "どんなサロンに合うか",
      text: `ラグジュアリーな空間づくりを目指すサロンから、ミニマルで洗練された雰囲気を求めるサロンまで。${product.product_name}は、幅広いブランドコンセプトに調和します。`,
    },
    {
      num: "02",
      en: "The Atmosphere",
      ja: "どんな世界観を作れるか",
      text: "上質な素材と洗練されたフォルムが、お客様を迎える瞬間から特別な体験を演出します。細部の質感まで、サロンの世界観を底上げします。",
    },
    {
      num: "03",
      en: "For Owners",
      ja: "どんなオーナーにおすすめか",
      text: "細部にまでこだわり、サロン全体のブランド価値を高めたいと考えるオーナー様におすすめです。長く愛用できる、上質な一台です。",
    },
  ];

  // Before / After（商品単体画像 → 設置イメージ）
  const beforeAfterProductImage = images.find((img) => img.image_type !== "usage") ?? images[0];
  const beforeAfterInstallationImage = installationImages[0];

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

          {/* 商品情報サマリー（アイコン付き：納期・カラー・サイズ・保証・配送方法） */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3"
                >
                  <Icon size={16} className="mt-0.5 shrink-0 text-amber-500/70" />
                  <div className="min-w-0">
                    <p className="text-[9px] tracking-[0.2em] text-neutral-600 uppercase">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-neutral-300">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
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

          {/* ── カートに入れる（価格未設定商品は非表示） ── */}
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

          {/* ── 問い合わせ（モーダル+スティッキー統合） ── */}
          <InquirySection
            productId={product.id}
            productName={product.product_name}
            sku={product.sku}
            categorySlug={cat.slug}
          />
        </div>
      </div>

      {/* ── WHY THIS PRODUCT（商品ストーリー） ── */}
      <section className="mt-28 border-t border-neutral-800/60 pt-20">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
            Why This Product
          </p>
          <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
            スペックだけでは伝わらない、
            <br className="hidden sm:block" />
            この商品が生み出す価値
          </h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-16">
          {productStory.map((s) => (
            <div key={s.num} className="text-center">
              <p className="font-mono text-xs tracking-[0.3em] text-amber-500/60">{s.num}</p>
              <p className="mt-3 mb-5 text-[10px] font-medium tracking-[0.4em] text-neutral-500 uppercase">
                {s.en} — {s.ja}
              </p>
              <p className="text-base font-light leading-[2.1] tracking-wide text-neutral-300 sm:text-lg">
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Before / After（商品単体 → 設置イメージ） ── */}
      {beforeAfterProductImage && beforeAfterInstallationImage && (
        <section className="mt-28 border-t border-neutral-800/60 pt-20">
          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Before / After
            </p>
            <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
              置いた瞬間、空間が変わる。
            </h2>
          </div>
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-8">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
              <Image
                src={beforeAfterProductImage.image_url}
                alt={beforeAfterProductImage.alt_text ?? product.product_name}
                fill
                sizes="(max-width: 640px) 100vw, 40vw"
                className="object-contain p-6"
              />
              <span className="absolute left-4 top-4 rounded-full border border-neutral-700 bg-neutral-950/80 px-3 py-1 text-[10px] tracking-[0.25em] text-neutral-400 uppercase backdrop-blur-sm">
                Before
              </span>
            </div>
            <div className="flex items-center justify-center py-2 text-amber-500/60 sm:py-0">
              <ArrowRight size={28} className="hidden sm:block" />
              <div className="h-px w-16 rotate-90 bg-amber-500/30 sm:hidden" />
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl border border-amber-500/20 bg-neutral-950">
              <Image
                src={beforeAfterInstallationImage.image_url}
                alt={beforeAfterInstallationImage.alt_text ?? `${product.product_name} 設置イメージ`}
                fill
                sizes="(max-width: 640px) 100vw, 40vw"
                className="object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full border border-amber-500/40 bg-neutral-950/80 px-3 py-1 text-[10px] tracking-[0.25em] text-amber-400 uppercase backdrop-blur-sm">
                After
              </span>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-lg text-center text-[11px] leading-relaxed text-neutral-600">
            ※ 設置イメージは実際の施工事例またはイメージ画像です。空間・照明により見え方が異なる場合があります。
          </p>
        </section>
      )}

      {/* ── サロン設置イメージ（image_type === 'usage' の画像がある場合のみ） ── */}
      {installationImages.length > 0 && (
        <InstallationGallery
          images={installationImages}
          productName={product.product_name}
        />
      )}

      {/* ── おすすめセット（カテゴリ違いの相性商品） ── */}
      {complementaryProducts.length > 0 && (
        <section className="mt-24 border-t border-neutral-800/60 pt-16">
          <div className="mb-8">
            <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
              Complete The Set
            </p>
            <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-300">
              この商品と相性の良い商品
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {complementaryProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── この商品に合うおすすめ商品 ── */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-neutral-800/60 pt-16">
          <div className="mb-8">
            <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
              Recommended
            </p>
            <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-300">
              この商品に合うおすすめ商品
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── 無料レイアウト相談 CTA ── */}
      <section className="mt-24 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black px-8 py-16 text-center">
        <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
          Free Consultation
        </p>
        <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
          無料レイアウト相談
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-[1.9] text-neutral-500">
          サロンの導線設計やレイアウトのご相談も承っております。
          理想の空間づくりを、BSSが一貫してサポートします。
        </p>
        <div className="mx-auto my-8 h-px w-16 bg-amber-500/40" />
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-amber-500 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
        >
          無料相談を申し込む
        </Link>
      </section>

      {/* ── ブランドメッセージ ── */}
      <section className="mt-24 border-y border-amber-500/20 bg-black px-6 py-32 text-center">
        <div className="mx-auto mb-10 h-px w-20 bg-amber-500/40" />
        <p className="text-2xl font-light tracking-[0.35em] text-neutral-100 sm:text-3xl">
          BEAUTY SALON
          <br className="sm:hidden" />
          <span className="sm:ml-4">SUPPLIERS</span>
        </p>
        <p className="mx-auto mt-8 max-w-md text-xs leading-[2.2] tracking-wide text-neutral-600">
          家具の先にある、サロンというブランド。
          <br />
          BSSは、空間づくりを通じてその価値を高めます。
        </p>
        <div className="mx-auto mt-10 h-px w-20 bg-amber-500/40" />
      </section>

      {/* スティッキーバー分の余白 */}
      <div className="h-24" />
    </div>
  );
}
