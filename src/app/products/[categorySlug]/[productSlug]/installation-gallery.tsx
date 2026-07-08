"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/lib/types";

type Props = {
  images: ProductImage[];
  productName: string;
};

// 商品詳細ページの「サロン設置イメージ」セクション。
// product_images.image_type === 'usage' の画像のみを受け取り、
// 該当画像が無い場合は何も表示しない（呼び出し側 page.tsx でフィルタ済みの前提）。
// デザイン・Lightbox挙動は既存の ImageGallery に合わせている。
export function InstallationGallery({ images, productName }: Props) {
  // image_url が null/空のレコードを除外（SSR クラッシュ防止）
  const validImages = images.filter(
    (img): img is ProductImage & { image_url: string } => !!img.image_url,
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedIndex = validImages.findIndex((i) => i.id === selectedId);
  const selected = validImages[selectedIndex] ?? validImages[0];

  const openLightbox = (id: string) => {
    setSelectedId(id);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = useCallback(() => {
    if (validImages.length < 2) return;
    const prevIndex = (selectedIndex - 1 + validImages.length) % validImages.length;
    setSelectedId(validImages[prevIndex].id);
  }, [validImages, selectedIndex]);

  const goNext = useCallback(() => {
    if (validImages.length < 2) return;
    const nextIndex = (selectedIndex + 1) % validImages.length;
    setSelectedId(validImages[nextIndex].id);
  }, [validImages, selectedIndex]);

  // キーボード操作（ESC で閉じる・矢印キーで切替）
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goPrev, goNext]);

  // Lightbox 表示中はボディスクロール禁止
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen]);

  if (validImages.length === 0) return null;

  return (
    <section className="mt-24 border-t border-neutral-800/60 pt-16">
      <div className="mb-8">
        <p className="text-[9px] font-medium tracking-[0.5em] text-amber-500 uppercase">
          Installation Image
        </p>
        <h2 className="mt-1 text-lg font-light tracking-wider text-neutral-300">
          サロン設置イメージ
        </h2>
      </div>

      {/* ── グリッド（クリックで Lightbox） ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {validImages.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => openLightbox(img.id)}
            className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition-colors hover:border-amber-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={img.alt_text ?? `サロン設置イメージ ${i + 1}`}
          >
            <Image
              src={img.image_url}
              alt={img.alt_text ?? `${productName} サロン設置イメージ`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
              <ZoomIn size={13} className="text-neutral-300" />
            </div>
          </button>
        ))}
      </div>

      {/* ── 免責文言 ── */}
      <p className="mt-4 text-center text-[10px] leading-relaxed text-neutral-600">
        ※写真はイメージです。実際の設置環境・照明により見え方が異なる場合があります。
      </p>

      {/* ── Lightbox ── */}
      {lightboxOpen && selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* 閉じるボタン */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-neutral-900/80 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="閉じる"
          >
            <X size={22} />
          </button>

          {/* 枚数表示 */}
          {validImages.length > 1 && (
            <p className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-neutral-600">
              {selectedIndex + 1} / {validImages.length}
            </p>
          )}

          {/* 前へ */}
          {validImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-neutral-900/80 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white sm:left-6"
              aria-label="前の画像"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* 次へ */}
          {validImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-neutral-900/80 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white sm:right-6"
              aria-label="次の画像"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* フル画像 */}
          <div
            className="relative mx-14 flex max-h-[90vh] max-w-[90vw] items-center justify-center sm:mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selected.image_url}
              alt={selected.alt_text ?? `${productName} サロン設置イメージ`}
              width={1200}
              height={1200}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}
