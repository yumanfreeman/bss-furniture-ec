import Link from "next/link";
import type { Metadata } from "next";

const OPENING_SUPPORT_TITLE = "Opening Support | BSS Beauty Salon Suppliers";
const OPENING_SUPPORT_DESCRIPTION =
  "美容室の開業に必要な家具選定、内装設計、導線計画、納品スケジュールまで。BSSが理想のサロンづくりを一貫してサポートします。";

export const metadata: Metadata = {
  title: OPENING_SUPPORT_TITLE,
  description: OPENING_SUPPORT_DESCRIPTION,
  alternates: { canonical: "/opening-support" },
  openGraph: {
    title: OPENING_SUPPORT_TITLE,
    description: OPENING_SUPPORT_DESCRIPTION,
    url: "/opening-support",
    type: "website",
  },
};

const SUPPORTS: {
  key: string;
  num: string;
  en: string;
  desc: string;
  gradient: string;
  accent: string;
}[] = [
  {
    key: "planning",
    num: "01",
    en: "Planning",
    desc: "開業コンセプト、ターゲット、メニュー構成に合わせた空間計画を行います。",
    gradient: "from-stone-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-900/50 to-transparent",
  },
  {
    key: "interior",
    num: "02",
    en: "Interior",
    desc: "内装デザイン、リフォーム、施工スケジュールまでサポートします。",
    gradient: "from-zinc-700 via-neutral-800 to-neutral-950",
    accent: "from-neutral-500/20 to-transparent",
  },
  {
    key: "furniture",
    num: "03",
    en: "Furniture",
    desc: "椅子、ミラー、シャンプー台など、空間に合う美容家具を選定します。",
    gradient: "from-neutral-700 via-stone-800 to-neutral-950",
    accent: "from-amber-950/60 to-transparent",
  },
  {
    key: "launch",
    num: "04",
    en: "Launch",
    desc: "納品、設置、開業前準備までスムーズに進行できるよう支援します。",
    gradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    accent: "from-amber-900/30 to-transparent",
  },
];

export default function OpeningSupportPage() {
  return (
    <div className="bg-neutral-950">

      {/* ── Hero ── */}
      <section className="border-b border-neutral-800 px-6 py-32 text-center">
        <p className="mb-5 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
          Opening Support
        </p>
        <h1 className="text-4xl font-light leading-snug tracking-wider text-neutral-100 sm:text-5xl">
          Salon Opening
          <br />
          <span className="text-amber-400">Support</span>
        </h1>
        <div className="mx-auto my-10 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-lg text-sm leading-[2] text-neutral-500">
          美容室の開業に必要な家具選定、内装設計、導線計画、納品スケジュールまで。
          <br className="hidden sm:block" />
          BSSが理想のサロンづくりを一貫してサポートします。
        </p>
      </section>

      {/* ── Support Cards ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">

        {/* セクションラベル */}
        <div className="mb-16 flex items-center gap-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <p className="text-[10px] tracking-[0.5em] text-neutral-600 uppercase">Our Support</p>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORTS.map((s) => (
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
                <span className="absolute right-5 top-5 select-none font-mono text-6xl font-extralight text-white/[0.06]">
                  {s.num}
                </span>
              </div>

              {/* テキストエリア */}
              <div className="flex flex-1 flex-col gap-4 bg-neutral-900 px-7 py-8">
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
          理想のサロンづくりをご相談ください
        </h2>
        <p className="mx-auto mb-14 max-w-md text-sm leading-[1.9] text-neutral-500">
          物件選びから内装、家具選定、開業準備まで、
          <br className="hidden sm:block" />
          BSSがワンストップでサポートします。
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="inline-block bg-amber-500 px-12 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
          >
            開業相談する →
          </Link>
          <Link
            href="/products"
            className="inline-block border border-neutral-700 px-12 py-4 text-xs font-light tracking-[0.3em] text-neutral-400 uppercase transition-colors hover:border-amber-500/60 hover:text-amber-400"
          >
            商品を見る →
          </Link>
        </div>
      </section>

    </div>
  );
}
