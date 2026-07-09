import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Globe2,
  LayoutGrid,
  Building2,
  LifeBuoy,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ABOUT_TITLE = "About | BSS Beauty Salon Suppliers";
const ABOUT_DESCRIPTION =
  "BSSは家具の卸販売だけでなく、海外デザイン家具・サロン空間設計・レイアウト提案・開業支援までを一貫してサポートする、美容室づくりのブランドです。";

export const metadata: Metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: "/about",
    type: "website",
  },
};

const SERVICES: {
  key: string;
  icon: typeof Globe2;
  title: string;
  desc: string;
}[] = [
  {
    key: "furniture",
    icon: Globe2,
    title: "海外デザイン家具",
    desc: "世界の美容家具ブランドを厳選し、直輸入でお届けします。",
  },
  {
    key: "layout",
    icon: LayoutGrid,
    title: "内装・レイアウト提案",
    desc: "サロンの世界観に合わせた空間設計と動線計画をご提案します。",
  },
  {
    key: "opening",
    icon: Building2,
    title: "開業サポート",
    desc: "物件選びから内装・家具選定・工事手配まで一貫してサポートします。",
  },
  {
    key: "after",
    icon: LifeBuoy,
    title: "アフターサポート",
    desc: "納品後のメンテナンスやご相談にも継続して対応いたします。",
  },
];

const WHY_BSS: string[] = [
  "世界中からデザイン家具を厳選",
  "サロンに合わせた提案",
  "施工イメージ作成",
  "長期的なパートナー",
];

type ShowcaseImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
};

export default async function AboutPage() {
  const supabase = createClient();

  // 写真セクション用：サロン設置イメージ（公開中のBSS商品のみ）を最大2枚取得
  const { data: rawRows } = await supabase
    .from("product_images")
    .select(
      "id, image_url, alt_text, products!inner(visibility, category_id)",
    )
    .eq("image_type", "usage")
    .eq("products.visibility", "public")
    .not("products.category_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(2);

  const showcaseImages: ShowcaseImage[] = (rawRows ?? [])
    .filter((row): row is typeof row & { image_url: string } => !!row.image_url)
    .map((row) => ({
      id: row.id as string,
      imageUrl: row.image_url as string,
      altText: row.alt_text as string | null,
    }));

  // usage画像が無い場合は既存のヒーロー画像でフォールバック（セクションを空にしない）
  const fallbackImages: ShowcaseImage[] =
    showcaseImages.length > 0
      ? showcaseImages
      : [{ id: "fallback", imageUrl: "/images/hero.jpg", altText: "BSSのサロン空間づくり" }];

  return (
    <div className="bg-neutral-950">

      {/* ── Hero ── */}
      <section className="border-b border-neutral-800 px-6 py-28 text-center">
        <p className="mb-5 text-[10px] font-medium tracking-[0.7em] text-amber-500 uppercase">
          About BSS
        </p>
        <h1 className="text-4xl font-light leading-snug tracking-wider text-neutral-100 sm:text-5xl">
          Design Beautiful
          <br />
          <span className="text-amber-400">Salons.</span>
        </h1>
        <div className="mx-auto my-8 h-px w-16 bg-amber-500/40" />
        <p className="mx-auto max-w-lg text-sm leading-[2] text-neutral-500">
          海外デザイン家具、サロン空間設計、レイアウト提案、
          <br className="hidden sm:block" />
          開業・改装支援まで、美容室づくりをトータルでサポートします。
        </p>
      </section>

      {/* ── OUR PHILOSOPHY ── */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="mb-8 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
          Our Philosophy
        </p>
        <p className="text-xl font-light leading-[2.1] tracking-wide text-neutral-200 sm:text-2xl">
          美容室は、
          <br />
          ただ椅子を並べる場所ではなく、
          <br />
          お客様の体験をデザインする空間。
        </p>
        <div className="mx-auto my-10 h-px w-16 bg-amber-500/30" />
        <p className="text-xl font-light leading-[2.1] tracking-wide text-neutral-200 sm:text-2xl">
          BSSは、
          <br />
          家具だけではなく、
          <br />
          美容室というブランドづくりを提案します。
        </p>
      </section>

      {/* ── 写真セクション ── */}
      <section className="border-y border-neutral-800">
        <div
          className={`grid grid-cols-1 ${
            fallbackImages.length > 1 ? "sm:grid-cols-2" : ""
          }`}
        >
          {fallbackImages.map((img) => (
            <div key={img.id} className="relative aspect-[4/3] sm:aspect-[3/4]">
              <Image
                src={img.imageUrl}
                alt={img.altText ?? "BSSのサロン空間づくり"}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
                priority={false}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR SERVICES ── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
            Our Services
          </p>
          <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
            家具の提供にとどまらない、
            <br className="hidden sm:block" />
            サロンづくりの総合サポート
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="flex flex-col items-center gap-4 border border-neutral-800 px-6 py-12 text-center transition-colors duration-300 hover:border-amber-500/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30">
                  <Icon size={20} className="text-amber-500" />
                </div>
                <p className="text-sm font-light tracking-[0.15em] text-neutral-100">
                  {s.title}
                </p>
                <p className="text-xs leading-[1.9] text-neutral-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── WHY BSS ── */}
      <section className="border-t border-neutral-800 bg-neutral-900/30 px-6 py-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] font-medium tracking-[0.6em] text-amber-500 uppercase">
              Why BSS
            </p>
            <h2 className="text-2xl font-light tracking-wider text-neutral-100 sm:text-3xl">
              選ばれる理由
            </h2>
          </div>

          <ul className="space-y-6">
            {WHY_BSS.map((reason) => (
              <li key={reason} className="flex items-center gap-4 border-b border-neutral-800 pb-6">
                <CheckCircle2 size={18} className="shrink-0 text-amber-500" />
                <span className="text-sm font-light tracking-wide text-neutral-200">
                  {reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-neutral-800 px-6 py-28 text-center">
        <p className="mb-4 text-[10px] tracking-[0.6em] text-amber-500 uppercase">
          Free Consultation
        </p>
        <h2 className="mb-6 text-2xl font-light tracking-wider text-neutral-200 sm:text-3xl">
          サロンの空間づくりをご相談ください
        </h2>
        <p className="mx-auto mb-12 max-w-md text-sm leading-relaxed text-neutral-500">
          家具選定から内装デザイン、開業支援まで、まずはお気軽にご相談ください。
        </p>
        <Link
          href="/contact"
          className="inline-block bg-amber-500 px-10 py-4 text-xs font-medium tracking-[0.3em] text-neutral-950 uppercase transition-colors hover:bg-amber-400"
        >
          無料レイアウト相談
        </Link>
      </section>

    </div>
  );
}
