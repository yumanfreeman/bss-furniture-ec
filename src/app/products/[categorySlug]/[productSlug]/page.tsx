import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { ImageGallery } from "./image-gallery";
import type { Category, ProductDetail, ProductImage } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatYen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    on_sale:      { label: "販売中",   cls: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50" },
    draft:        { label: "準備中",   cls: "bg-neutral-800 text-neutral-500 border-neutral-700" },
    discontinued: { label: "販売終了", cls: "bg-red-950/60 text-red-400 border-red-800/50" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-neutral-800 text-neutral-500 border-neutral-700" };
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

  // Step 2: そのカテゴリの公開商品を全件取得（詳細フィールド込み）
  const { data: productsData } = await supabase
    .from("products")
    .select(
      "id, product_name, slug, sku, description, features, selling_price, " +
      "color, material, dimensions, width_mm, depth_mm, height_mm, " +
      "status, stock_quantity, is_made_to_order, lead_time, " +
      "categories(id, name, slug), " +
      "product_images(id, image_url, image_type, alt_text, sort_order)"
    )
    .not("category_id", "is", null)
    .eq("visibility", "public")
    .eq("category_id", cat.id);

  // Step 3: slugifyForUrl(sku) === productSlug で一致判定（id フォールバックも含む）
  const products = (productsData ?? []) as unknown as ProductDetail[];
  const product = products.find(
    (p) =>
      (p.sku ? slugifyForUrl(p.sku) : null) === productSlug ||
      p.id === productSlug
  );

  if (!product) notFound();

  const images = ((product.product_images ?? []) as ProductImage[])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const specs: { label: string; value: string }[] = [
    product.color      ? { label: "カラー", value: product.color      } : null,
    product.material   ? { label: "素材",   value: product.material   } : null,
    product.dimensions ? { label: "サイズ", value: product.dimensions } : null,
    product.width_mm   ? { label: "幅",     value: `${product.width_mm} mm`  } : null,
    product.depth_mm   ? { label: "奥行",   value: `${product.depth_mm} mm`  } : null,
    product.height_mm  ? { label: "高さ",   value: `${product.height_mm} mm` } : null,
    product.lead_time  ? { label: "納期",   value: product.lead_time         } : null,
  ].filter((s): s is { label: string; value: string } => s !== null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* パンくず（slug 英語） */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-600">
        <Link href="/" className="font-mono transition-colors hover:text-amber-400">home</Link>
        <span>/</span>
        <Link href="/products" className="font-mono transition-colors hover:text-amber-400">products</Link>
        <span>/</span>
        <Link href={`/products/${cat.slug}`} className="font-mono transition-colors hover:text-amber-400">
          {cat.slug}
        </Link>
        <span>/</span>
        <span className="max-w-xs truncate text-neutral-400">{product.product_name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* ── 画像ギャラリー ── */}
        <ImageGallery images={images} productName={product.product_name} />

        {/* ── 情報カラム ── */}
        <div className="space-y-6">
          {/* バッジ群 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-800/50 bg-amber-950/30 px-3 py-1 font-mono text-[10px] text-amber-500">
              {cat.slug}
            </span>
            <StatusBadge status={product.status} />
            <StockBadge qty={product.stock_quantity} isMto={product.is_made_to_order} />
          </div>

          {/* 商品名 */}
          <h1 className="text-2xl font-light leading-snug tracking-wide text-neutral-100">
            {product.product_name}
          </h1>

          {/* SKU */}
          {product.sku && (
            <p className="font-mono text-xs text-neutral-600">SKU: {product.sku}</p>
          )}

          {/* 価格 */}
          {product.selling_price != null && (
            <div className="border-y border-neutral-800 py-4">
              <p className="text-[9px] tracking-[0.4em] text-neutral-600 uppercase">Price</p>
              <p className="mt-1 text-3xl font-semibold text-amber-400">
                {formatYen(product.selling_price)}
              </p>
              <p className="mt-1 text-[10px] text-neutral-600">税込・卸価格</p>
            </div>
          )}

          {/* 受注生産の注意書き */}
          {product.stock_quantity === 0 && product.is_made_to_order && (
            <p className="rounded-lg border border-amber-800/30 bg-amber-950/20 px-4 py-3 text-xs text-amber-300/80">
              この商品は受注生産品です。ご注文後に製造を開始いたします。
              {product.lead_time && `　納期の目安：${product.lead_time}`}
            </p>
          )}

          {/* 説明 */}
          {product.description && (
            <div>
              <p className="mb-2 text-[9px] font-medium tracking-[0.4em] text-neutral-600 uppercase">
                Description
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-400">
                {product.description}
              </p>
            </div>
          )}

          {/* スペック */}
          {specs.length > 0 && (
            <div>
              <p className="mb-3 text-[9px] font-medium tracking-[0.4em] text-neutral-600 uppercase">
                Specifications
              </p>
              <div className="divide-y divide-neutral-800 rounded-lg border border-neutral-800">
                {specs.map((s) => (
                  <div key={s.label} className="flex items-center gap-4 px-4 py-2.5">
                    <span className="w-20 shrink-0 text-[10px] text-neutral-600">{s.label}</span>
                    <span className="text-xs text-neutral-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 特徴 */}
          {product.features && (
            <div>
              <p className="mb-2 text-[9px] font-medium tracking-[0.4em] text-neutral-600 uppercase">
                Features
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-400">
                {product.features}
              </p>
            </div>
          )}

          {/* ── 問い合わせボタン ── */}
          <div className="space-y-3 pt-2">
            <a
              href={`mailto:bss-Japan1001@gmail.com?subject=${encodeURIComponent(
                `商品についてのお問い合わせ：${product.product_name}${product.sku ? ` (${product.sku})` : ""}`
              )}`}
              className="flex w-full items-center justify-center rounded-lg bg-amber-500 px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
            >
              この商品についてお問い合わせ
            </a>
            <a
              href={`mailto:bss-Japan1001@gmail.com?subject=${encodeURIComponent(
                `お見積依頼：${product.product_name}${product.sku ? ` (${product.sku})` : ""}`
              )}`}
              className="flex w-full items-center justify-center rounded-lg border border-neutral-700 px-6 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
            >
              お見積もりを依頼する
            </a>
            <p className="text-center text-[10px] text-neutral-700">
              bss-Japan1001@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
