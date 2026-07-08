import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

const CONTACT_TITLE = "Contact | BSS Beauty Salon Suppliers";
const CONTACT_DESCRIPTION =
  "美容家具の導入、内装デザイン、リフォーム、開業支援についてお気軽にご相談ください。";

export const metadata: Metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: "/contact",
    type: "website",
  },
};

const TOPICS: {
  key: string;
  num: string;
  en: string;
  desc: string;
  gradient: string;
  accent: string;
}[] = [
  {
    key: "furniture",
    num: "01",
    en: "Furniture",
    desc: "椅子、ミラー、シャンプー台など美容家具の導入に関するご相談。",
    gradient: "from-neutral-700 via-stone-800 to-neutral-950",
    accent: "from-amber-950/60 to-transparent",
  },
  {
    key: "interior-design",
    num: "02",
    en: "Interior Design",
    desc: "サロンの世界観に合わせた内装デザインのご相談。",
    gradient: "from-stone-700 via-neutral-800 to-neutral-950",
    accent: "from-amber-900/50 to-transparent",
  },
  {
    key: "renovation",
    num: "03",
    en: "Renovation",
    desc: "既存店舗のリフォーム・改装工事に関するご相談。",
    gradient: "from-zinc-700 via-neutral-800 to-neutral-950",
    accent: "from-neutral-500/20 to-transparent",
  },
  {
    key: "opening-support",
    num: "04",
    en: "Opening Support",
    desc: "開業計画から納品・設置までのトータルサポートのご相談。",
    gradient: "from-amber-950/80 via-neutral-900 to-neutral-950",
    accent: "from-amber-900/30 to-transparent",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-neutral-950">

      {/* ── Hero ── */}
      <section className="border-b border-neutral-800 px-6 py-32 text-center">
        <p className="mb-5 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
          Contact
        </p>
        <h1 className="text-4xl font-light leading-snug tracking-wider text-neutral-100 sm:text-5xl">
          Consultation
          <br />
          <span className="text-amber-400">&amp; Inquiry</span>
        </h1>
        <div className="mx-auto my-10 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-lg text-sm leading-[2] text-neutral-500">
          美容家具の導入、内装デザイン、リフォーム、開業支援について
          <br className="hidden sm:block" />
          お気軽にご相談ください。
        </p>
      </section>

      {/* ── 相談内容カード ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">

        {/* セクションラベル */}
        <div className="mb-16 flex items-center gap-6">
          <div className="h-px flex-1 bg-neutral-800" />
          <p className="text-[10px] tracking-[0.5em] text-neutral-600 uppercase">
            What We Can Help
          </p>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((t) => (
            <article
              key={t.key}
              className="group flex flex-col overflow-hidden border border-neutral-800 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              {/* グラデーションプレースホルダー */}
              <div
                className={`relative aspect-[4/3] w-full bg-gradient-to-br ${t.gradient}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${t.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-80`}
                />
                {/* 番号装飾 */}
                <span className="absolute right-5 top-5 select-none font-mono text-6xl font-extralight text-white/[0.06]">
                  {t.num}
                </span>
              </div>

              {/* テキストエリア */}
              <div className="flex flex-1 flex-col gap-4 bg-neutral-900 px-7 py-8">
                <div className="h-px w-8 bg-amber-600/40 transition-all duration-300 group-hover:w-16 group-hover:bg-amber-400" />
                <h2 className="text-lg font-light tracking-[0.15em] text-neutral-100 transition-colors duration-300 group-hover:text-amber-300">
                  {t.en}
                </h2>
                <p className="text-xs leading-[1.95] text-neutral-500">{t.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── お問い合わせフォーム ── */}
      <section className="border-t border-neutral-800 px-6 py-28">
        <div className="mx-auto max-w-2xl">

          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] tracking-[0.6em] text-amber-500 uppercase">
              Inquiry Form
            </p>
            <h2 className="text-2xl font-light tracking-wider text-neutral-200 sm:text-3xl">
              お問い合わせフォーム
            </h2>
          </div>

          <ContactForm />

        </div>
      </section>

    </div>
  );
}
