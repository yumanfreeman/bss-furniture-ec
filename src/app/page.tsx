import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Globe2, Sparkles, LayoutGrid, Building2, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sortCategories } from "@/lib/category-order";
import { ProductCard } from "@/components/product-card";
import type { Category, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const TOP_TITLE = "BSS Beauty Salon Suppliers | 美容家具・美容器具の卸販売";
const TOP_DESCRIPTION =
  "セット椅子・シャンプー台・ミラー・ワゴンなど美容家具の卸販売。内装デザイン・リフォーム・開業支援までワンストップでサポートするBSS Beauty Salon Suppliers。";

export const metadata: Metadata = {
  title: TOP_TITLE,
  description: TOP_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TOP_TITLE,
    description: TOP_DESCRIPTION,
    url: "/",
    type: "website",
  },
};

const INSTAGRAM_POSTS: { key: string; gradient: string; label: string }[] = [
  { key: "ig1", gradient: "from-neutral-700 to-neutral-900",  label: "Salon Interior" },
  { key: "ig2", gradient: "from-amber-950/70 to-neutral-900", label: "Chair Detail"   },
  { key: "ig3", gradient: "from-neutral-600 to-neutral-900",  label: "Mirror Unit"    },
  { key: "ig4", gradient: "from-amber-900/40 to-neutral-950", label: "Grand Opening"  },
];

const STRENGTHS: {
  key: string;
  icon: LucideIcon;
  en: string;
  ja: string;
  desc: string;
}[] = [
  {
    key: "imported",
    icon: Globe2,
    en: "Imported Design Furniture",
    ja: "海外デザイン家具",
    desc: "世界の美容家具ブランドを厳選し、日本のサロンへ直輸入でお届けします。",
  },
  {
    key: "space",
    icon: Sparkles,
    en: "Salon Space Design",
    ja: "サロン空間提案",
    desc: "家具選定だけでなく、内装コンセプトからトータルでご提案します。",
  },
  {
    key: "layout",
    icon: LayoutGrid,
    en: "Layout Consultation",
    ja: "レイアウト相談",
    desc: "動線や座席配置など、空間設計を無料でご相談いただけます。",
  },
  {
    key: "support",
    icon: Building2,
    en: "Opening & Renovation Support",
    ja: "開業・改装サポート",
    desc: "開業計画から改装工事まで、一貫してサポートいたします。",
  },
];

const WORKS_CARDS: {
  key: string;
  en: string;
  ja: string;
  tag: string;
  gradient: string;
  accentFrom: string;
}[] = [
  {
    key: "luxury",
    en: "Luxury Salon",
    ja: "ラグジュアリーサロン",
    tag: "Interior Design",
    gradient: "from-neutral-700 via-neutral-800 to-neutral-950",
    accentFrom: "from-amber-950/60",
  },
  {
    key: "modern",
    en: "Modern Minimal",
    ja: "モダンミニマル",
    tag: "Full Renovation",
    gradient: "from-neutral-600 via-neutral-800 to-neutral-950",
    accentFrom: "from-neutral-700/40",
  },
  {
    key: "opening",
    en: "Opening Support",
    ja: "開業トータルサポート",
    tag: "Grand Opening",
    gradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    accentFrom: "from-amber-900/30",
  },
];

const CATEGORY_CARDS: {
  key: string;
  en: string;
  ja: string;
  href: string;
  gradient: string;
  accent: string;
}[] = [
  {
    key: "chair",
    en: "Chair",
    ja: "セット椅子",
    href: "/products/salon-chair",
    gradient: "from-neutral-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-950/60",
  },
  {
    key: "mirror",
    en: "Mirror",
    ja: "ミラー",
    href: "/products/mirror",
    gradient: "from-zinc-700 via-neutral-800 to-neutral-950",
    accent: "from-neutral-500/20",
  },
  {
    key: "shampoo",
    en: "Shampoo Unit",
    ja: "シャンプー台",
    href: "/products/shampoo-chair",
    gradient: "from-stone-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-900/50",
  },
  {
    key: "interior",
    en: "Interior",
    ja: "インテリア提案",
    href: "/interior",
    gradient: "from-neutral-600 via-neutral-800 to-neutral-950",
    accent: "from-neutral-700/40",
  },
  {
    key: "opening",
    en: "Opening\nSupport",
    ja: "開業サポート",
    href: "/opening-support",
    gradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    accent: "from-amber-900/30",
  },
];

export default async function TopPage() {
  const supabase = createClient();

  const SELECT_COLS =
    "id, product_name, slug, sku, selling_price, color, " +
    "categories(id, name, slug), " +
    "product_images(id, image_url, image_type, alt_text, sort_order)";

  const [{ data: categoriesData }, { data: featuredRaw }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase
      .from("products")
      .select(SELECT_COLS)
      .not("category_id", "is", null)
      .eq("visibility", "public")
      .eq("featured", true)
      .order("featured_order", { ascending: true, nullsFirst: false })
      .order("sku", { ascending: true, nullsFirst: false }),
  ]);

  // featured=true が 0 件なら最新 8 件にフォールバック
  let featured: ProductListItem[];
  if (featuredRaw && featuredRaw.length > 0) {
    featured = featuredRaw as unknown as ProductListItem[];
  } else {
    const { data: fallback } = await supabase
      .from("products")
      .select(SELECT_COLS)
      .not("category_id", "is", null)
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(8);
    featured = (fallback ?? []) as unknown as ProductListItem[];
  }

  const rawCats = (categoriesData ?? []) as Category[];
  const categories = sortCategories(rawCats);

  // サロン設置イメージ（image_type === 'usage'、公開中のBSS商品のみ）を
  // WORKSセクションのプレビューとして最大3件取得
  type UsageImageRow = {
    id: string;
    image_url: string | null;
    alt_text: string | null;
    products: { visibility: string; category_id: string | null } | { visibility: string; category_id: string | null }[] | null;
  };

  const { data: usageImagesRaw } = await supabase
    .from("product_images")
    .select("id, image_url, alt_text, products!inner(visibility, category_id)")
    .eq("image_type", "usage")
    .eq("products.visibility", "public")
    .not("products.category_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(3);

  const usageImages = ((usageImagesRaw ?? []) as unknown as UsageImageRow[])
    .filter((img): img is UsageImageRow & { image_url: string } => !!img.image_url);

  return (
    <div>
      {/* ── ヒーローバナー ── */}
      <section className="relative min-h-[85vh] overflow-hidden border-b border-neutral-800">
        {/* 背景画像 + グラデーションオーバーレイ（左濃・右薄） */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.25) 100%), url('/images/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* コンテンツ */}
        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl items-center px-6 py-24">
          <div className="max-w-xl">
            <p className="mb-8 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Beauty Salon Suppliers
            </p>
            <h1 className="font-light leading-[0.95] tracking-[0.1em] text-white">
              <span className="block text-6xl sm:text-7xl lg:text-8xl">DESIGN</span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl">YOUR</span>
              <span className="block text-6xl text-amber-400 sm:text-7xl lg:text-8xl">
                SUCCESS.
              </span>
            </h1>
            <div className="my-8 h-px w-16 bg-amber-500/50" />
            <p className="text-sm leading-loose text-neutral-300">
              家具の提供だけでなく、内装デザイン・レイアウト相談・
              <br className="hidden sm:block" />
              開業支援まで一貫してサポートします。
            </p>
            <p className="mt-2 text-xs leading-loose text-neutral-500">
              セット椅子・シャンプー台・ミラー・ワゴン
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-block bg-amber-500 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
              >
                商品を見る
              </Link>
              <Link
                href="/contact"
                className="inline-block border border-neutral-600 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-200 uppercase transition-colors hover:border-amber-500/60 hover:text-amber-400"
              >
                無料レイアウト相談
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BSSの強み ── */}
      <section className="border-b border-neutral-800 bg-neutral-950 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Why BSS
            </p>
            <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
              家具の卸販売だけでは終わらない、
              <br className="hidden sm:block" />
              サロンづくりのパートナー
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-px bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
            {STRENGTHS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.key}
                  className="flex flex-col items-center gap-4 bg-neutral-950 px-6 py-12 text-center transition-colors duration-300 hover:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30">
                    <Icon size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-light tracking-[0.15em] text-neutral-100">
                      {s.en}
                    </p>
                    <p className="mt-1 text-xs tracking-wider text-neutral-500">{s.ja}</p>
                  </div>
                  <p className="text-xs leading-[1.9] text-neutral-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── カテゴリカード ── */}
      <section className="border-b border-neutral-800">
        <div className="grid grid-cols-2 gap-px bg-neutral-800 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORY_CARDS.map((card, i) => (
            <Link
              key={card.key}
              href={card.href}
              className="group relative flex min-h-56 flex-col overflow-hidden bg-neutral-950 transition-all duration-500 hover:z-10 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(0,0,0,0.7)] hover:ring-1 hover:ring-amber-500/50 lg:min-h-80"
            >
              {/* グラデーションプレースホルダー背景 */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`}
              />

              {/* アクセントオーバーレイ */}
              <div
                aria-hidden="true"
                className={`absolute inset-0 bg-gradient-to-t ${card.accent} to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90`}
              />

              {/* 手前の暗転オーバーレイ（テキスト可読性確保） */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
              />

              {/* コンテンツ */}
              <div className="relative flex flex-1 flex-col justify-between p-5 sm:p-6">
                {/* 左上：大きな番号 */}
                <span className="font-mono text-4xl font-light leading-none text-white/10 transition-colors duration-300 group-hover:text-white/20 sm:text-5xl">
                  0{i + 1}
                </span>

                {/* 左下：タイトル + VIEW → */}
                <div>
                  {/* ゴールドライン */}
                  <div className="mb-3 h-px w-8 bg-amber-600/60 transition-all duration-300 group-hover:w-14 group-hover:bg-amber-400" />

                  {/* 英語タイトル */}
                  <p className="whitespace-pre-line text-sm font-light leading-snug tracking-[0.18em] text-neutral-100 transition-colors duration-300 group-hover:text-white sm:text-base lg:text-lg">
                    {card.en}
                  </p>

                  {/* 日本語タイトル */}
                  <p className="mt-1 text-[10px] tracking-wider text-neutral-500 transition-colors duration-300 group-hover:text-neutral-300">
                    {card.ja}
                  </p>

                  {/* VIEW → スライドアニメーション */}
                  <span className="mt-4 inline-block text-[10px] tracking-[0.3em] text-amber-500 transition-transform duration-300 group-hover:translate-x-2">
                    VIEW →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── カテゴリナビ（チップ） ── */}
      <section className="border-b border-neutral-800 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products/${cat.slug}`}
                className="border border-neutral-700 px-5 py-2 text-xs tracking-[0.2em] text-neutral-400 transition-colors hover:border-amber-500/60 hover:text-amber-400"
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
              <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
                Featured
              </p>
              <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-200">
                注目商品
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 border border-neutral-700 px-6 py-2.5 text-[11px] font-light tracking-[0.3em] text-neutral-400 uppercase transition-all duration-300 hover:border-amber-500/60 hover:text-amber-400"
            >
              すべて見る
              <span className="font-mono tracking-normal">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── WORKS ── */}
      <section className="border-t border-neutral-800 bg-neutral-950 py-24">
        <div className="mx-auto max-w-7xl px-6">

          {/* ヘッダー */}
          <div className="mb-16">
            <p className="mb-3 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Works
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-light leading-tight tracking-wider text-neutral-100 sm:text-4xl">
                Salon Design
                <br />
                <span className="text-amber-400">&amp; Renovation</span>
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-neutral-500">
                家具の納品だけでなく、内装設計・リフォーム・開業まで
                <br className="hidden sm:block" />
                一貫してサポートします。
              </p>
            </div>
            <div className="mt-8 h-px w-full bg-neutral-800" />
          </div>

          {/* カード3枚（サロン設置イメージがあれば実写真、無ければプレースホルダー） */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {usageImages.length > 0
              ? usageImages.map((img, i) => (
                  <Link
                    key={img.id}
                    href="/works"
                    className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text ?? "サロン設置イメージ"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <span className="absolute right-5 top-5 font-mono text-5xl font-light text-white/10 select-none">
                      0{i + 1}
                    </span>
                    <span className="relative m-5 self-end border border-amber-500/30 px-3 py-1 text-[10px] tracking-[0.25em] text-amber-500/80 uppercase">
                      Salon Case
                    </span>
                  </Link>
                ))
              : WORKS_CARDS.map((w, i) => (
                  <div
                    key={w.key}
                    className="group relative flex flex-col overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  >
                    {/* プレースホルダー背景 */}
                    <div
                      className={`relative flex aspect-[4/3] w-full items-end bg-gradient-to-br ${w.gradient}`}
                    >
                      {/* ゴールドアクセント光 */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${w.accentFrom} to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                      />
                      {/* 番号 */}
                      <span className="absolute right-5 top-5 font-mono text-5xl font-light text-white/8 select-none">
                        0{i + 1}
                      </span>
                      {/* タグ */}
                      <span className="relative m-5 self-end border border-amber-500/30 px-3 py-1 text-[10px] tracking-[0.25em] text-amber-500/80 uppercase">
                        {w.tag}
                      </span>
                    </div>

                    {/* テキスト */}
                    <div className="flex flex-col gap-1 bg-neutral-900 p-5">
                      <p className="text-base font-light tracking-widest text-neutral-100 transition-colors duration-300 group-hover:text-amber-300">
                        {w.en}
                      </p>
                      <p className="text-xs tracking-wider text-neutral-500">{w.ja}</p>
                    </div>
                  </div>
                ))}
          </div>

          {/* /works への導線 */}
          <div className="mt-14 flex justify-center">
            <Link
              href="/works"
              className="inline-flex items-center gap-4 border border-neutral-700 px-10 py-4 text-xs font-light tracking-[0.4em] text-neutral-400 uppercase transition-all duration-300 hover:border-amber-500/60 hover:text-amber-400"
            >
              施工事例をすべて見る
              <span className="font-mono tracking-normal transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="border-t border-neutral-800 bg-neutral-950 py-24">
        <div className="mx-auto max-w-7xl px-6">

          {/* ヘッダー */}
          <div className="mb-16 text-center">
            <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Instagram
            </p>
            <h2 className="text-3xl font-light tracking-wider text-neutral-100 sm:text-4xl">
              Follow Our Design Stories
            </h2>
            <div className="mx-auto my-6 h-px w-16 bg-amber-500/40" />
            <p className="mx-auto max-w-md text-sm leading-relaxed text-neutral-500">
              最新の納品事例、サロン空間、海外美容家具の世界観を
              <br className="hidden sm:block" />
              Instagramで発信しています。
            </p>
          </div>

          {/* 投稿グリッド（4枚） */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {INSTAGRAM_POSTS.map((post) => (
              <a
                key={post.key}
                href="https://www.instagram.com/beauty_salon_suppliers.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden border border-neutral-800 transition-all duration-500 hover:border-amber-500/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              >
                {/* グラデーションプレースホルダー */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${post.gradient} transition-transform duration-700 group-hover:scale-105`}
                />

                {/* ホバーオーバーレイ */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-400 group-hover:bg-black/30" />

                {/* 中央アイコン（常時表示、控えめ） */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center opacity-15 transition-opacity duration-300 group-hover:opacity-40">
                    <div className="relative h-full w-full">
                      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-amber-400" />
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-amber-400" />
                    </div>
                  </div>
                </div>

                {/* ラベル（ホバー時） */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-8 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="text-[10px] tracking-[0.2em] text-neutral-300 uppercase">
                    {post.label}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Instagram 導線ボタン */}
          <div className="mt-14 flex justify-center">
            <a
              href="https://www.instagram.com/beauty_salon_suppliers.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 border border-neutral-700 px-10 py-4 text-xs font-light tracking-[0.4em] text-neutral-400 uppercase transition-all duration-300 hover:border-amber-500/60 hover:text-amber-400"
            >
              Instagramを見る
              <span className="font-mono tracking-normal">→</span>
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
