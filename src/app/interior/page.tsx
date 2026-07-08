import Link from "next/link";
import type { Metadata } from "next";

const INTERIOR_TITLE = "Interior Design & Renovation | BSS Beauty Salon Suppliers";
const INTERIOR_DESCRIPTION =
  "美容室のコンセプト設計から内装デザイン・リフォーム・家具選定まで。BSSはサロン空間づくりを一貫してサポートします。";

export const metadata: Metadata = {
  title: INTERIOR_TITLE,
  description: INTERIOR_DESCRIPTION,
  alternates: { canonical: "/interior" },
  openGraph: {
    title: INTERIOR_TITLE,
    description: INTERIOR_DESCRIPTION,
    url: "/interior",
    type: "website",
  },
};

const SERVICES: {
  key: string;
  num: string;
  en: string;
  ja: string;
  desc: string;
  gradient: string;
  accent: string;
}[] = [
  {
    key: "concept",
    num: "01",
    en: "Concept Design",
    ja: "コンセプトデザイン",
    desc: "サロンの世界観、ターゲット、価格帯に合わせた空間コンセプトを設計します。ブランドの方向性を明確にし、来客体験を最大化するデザイン戦略をご提案します。",
    gradient: "from-stone-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-900/50 to-transparent",
  },
  {
    key: "renovation",
    num: "02",
    en: "Renovation",
    ja: "内装リフォーム",
    desc: "既存サロンの雰囲気を活かしながら、集客力のある空間へリフォームします。施工から仕上げまで一貫して対応し、営業への影響を最小限に抑えたスケジュールで進めます。",
    gradient: "from-zinc-700 via-neutral-800 to-neutral-950",
    accent: "from-neutral-500/20 to-transparent",
  },
  {
    key: "styling",
    num: "03",
    en: "Furniture Styling",
    ja: "家具スタイリング",
    desc: "椅子、ミラー、シャンプー台などを内装全体に合わせてコーディネートします。素材・カラー・レイアウトまでトータルで提案し、一貫した世界観を実現します。",
    gradient: "from-neutral-700 via-stone-800 to-neutral-950",
    accent: "from-amber-950/60 to-transparent",
  },
];

export default function InteriorPage() {
  return (
    <div className="bg-neutral-950">

      {/* ── Hero ── */}
      <section className="border-b border-neutral-800 px-6 py-32 text-center">
        <p className="mb-5 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
          Interior
        </p>
        <h1 className="text-4xl font-light leading-snug tracking-wider text-neutral-100 sm:text-5xl">
          Interior Design
          <br />
          <span className="text-amber-400">&amp; Renovation</span>
        </h1>
        <div className="mx-auto my-10 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-lg text-sm leading-[2] text-neutral-500">
          美容室のコンセプト設計から、内装デザイン、リフォーム、家具選定まで。
          <br className="hidden sm:block" />
          BSSはサロン空間づくりを一貫してサポートします。
        </p>
      </section>

      {/* ── Service Cards ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">

        {/* セクションラベル */}
        <div className="mb-16 flex items-center gap-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <p className="text-[10px] tracking-[0.5em] text-neutral-600 uppercase">Our Services</p>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <article
              key={s.key}
              className="group flex flex-col overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              {/* グラデーションプレースホルダー */}
              <div
                className={`relative aspect-[4/3] w-full bg-gradient-to-br ${s.gradient}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${s.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                />
                {/* 番号装飾 */}
                <span className="absolute right-6 top-6 select-none font-mono text-7xl font-extralight text-white/[0.06]">
                  {s.num}
                </span>
                {/* 日本語ラベル */}
                <span className="absolute bottom-6 left-6 border border-amber-500/25 px-3 py-[5px] text-[10px] tracking-[0.25em] text-amber-500/70 uppercase">
                  {s.ja}
                </span>
              </div>

              {/* テキストエリア */}
              <div className="flex flex-1 flex-col gap-4 bg-neutral-900 px-8 py-8">
                <div className="h-px w-8 bg-amber-600/40 transition-all duration-300 group-hover:w-16 group-hover:bg-amber-400" />
                <h2 className="text-lg font-light tracking-[0.15em] text-neutral-100 transition-colors duration-300 group-hover:text-amber-300">
                  {s.en}
                </h2>
                <p className="text-xs leading-[1.95] text-neutral-500">{s.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-neutral-800 px-6 py-28 text-center">
        <p className="mb-4 text-[10px] tracking-[0.6em] text-amber-500 uppercase">
          Consultation
        </p>
        <h2 className="mb-6 text-2xl font-light tracking-wider text-neutral-200 sm:text-3xl">
          まずは無料でご相談ください
        </h2>
        <p className="mx-auto mb-14 max-w-md text-sm leading-[1.9] text-neutral-500">
          内装設計・リフォーム・家具選定など、
          <br className="hidden sm:block" />
          サロンづくりに関するご相談はお気軽にどうぞ。
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-block bg-amber-500 px-12 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
          >
            無料相談する
          </Link>
          <Link
            href="/products"
            className="inline-block border border-neutral-700 px-12 py-4 text-xs font-light tracking-[0.3em] text-neutral-400 uppercase transition-colors hover:border-amber-500/60 hover:text-amber-400"
          >
            商品を見る
          </Link>
        </div>
      </section>

    </div>
  );
}
