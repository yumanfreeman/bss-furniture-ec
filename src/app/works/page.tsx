import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Works | BSS Beauty Salon Suppliers",
  description:
    "BSSの施工事例。美容家具の納品だけでなく、内装設計・リフォーム・開業支援まで一貫してサポートするサロン空間ブランドです。",
};

const WORKS: {
  key: string;
  num: string;
  en: string;
  ja: string;
  tag: string;
  desc: string;
  gradient: string;
  accent: string;
}[] = [
  {
    key: "luxury",
    num: "01",
    en: "Luxury Salon",
    ja: "ラグジュアリーサロン",
    tag: "Interior Design",
    desc: "VIP個室・高級椅子・アートミラーを組み合わせた、来客に強い印象を与えるラグジュアリー空間。ブランドの世界観を余すことなく体現するインテリアをご提案します。",
    gradient: "from-neutral-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-950/60 to-transparent",
  },
  {
    key: "modern",
    num: "02",
    en: "Modern Minimal",
    ja: "モダンミニマル",
    tag: "Full Renovation",
    desc: "余白とモノトーンを活かしたモダンミニマルデザイン。空間を広く見せる家具配置と素材選びで、洗練されたサロン環境を実現します。",
    gradient: "from-neutral-600 via-neutral-800 to-neutral-950",
    accent: "from-neutral-500/20 to-transparent",
  },
  {
    key: "opening",
    num: "03",
    en: "Opening Support",
    ja: "開業トータルサポート",
    tag: "Grand Opening",
    desc: "物件選びから内装設計・家具選定・工事手配まで、開業のすべてをワンストップでサポート。初めてのサロン開業も安心してお任せください。",
    gradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    accent: "from-amber-900/30 to-transparent",
  },
];

export default function WorksPage() {
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
          <span className="text-amber-400">&amp; Renovation Works</span>
        </h1>
        <div className="mx-auto my-8 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-500">
          美容家具の納品だけでなく、内装設計・リフォーム・開業支援まで一貫してサポート。
          <br className="hidden sm:block" />
          サロンの世界観に合わせた空間づくりをご提案します。
        </p>
      </section>

      {/* ── 施工事例カード ── */}
      <section className="mx-auto max-w-7xl px-6 py-24">

        {/* セクションラベル */}
        <div className="mb-14 flex items-center gap-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <p className="text-[10px] tracking-[0.5em] text-neutral-600 uppercase">Case Studies</p>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {WORKS.map((w) => (
            <article
              key={w.key}
              className="group flex flex-col overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
            >
              {/* プレースホルダー画像エリア */}
              <div
                className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${w.gradient}`}
              >
                {/* ゴールドアクセント */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${w.accent} opacity-70 transition-opacity duration-500 group-hover:opacity-90`}
                />
                {/* 番号 */}
                <span className="absolute right-5 top-5 select-none font-mono text-6xl font-light text-white/8">
                  {w.num}
                </span>
                {/* タグ */}
                <span className="absolute bottom-5 left-5 border border-amber-500/30 px-3 py-1 text-[10px] tracking-[0.25em] text-amber-500/80 uppercase">
                  {w.tag}
                </span>
              </div>

              {/* テキストエリア */}
              <div className="flex flex-1 flex-col gap-3 bg-neutral-900 p-7">
                <div className="h-px w-8 bg-amber-600/50 transition-all duration-300 group-hover:w-14 group-hover:bg-amber-400" />
                <h2 className="text-lg font-light tracking-widest text-neutral-100 transition-colors duration-300 group-hover:text-amber-300">
                  {w.en}
                </h2>
                <p className="text-[11px] tracking-wider text-neutral-600">{w.ja}</p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">{w.desc}</p>
              </div>
            </article>
          ))}
        </div>
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
            お問い合わせ
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
