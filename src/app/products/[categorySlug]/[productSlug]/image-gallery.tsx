"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/lib/types";

type Props = {
  images: ProductImage[];
  productName: string;
};

type ViewMode = "product" | "installation";

export function ImageGallery({ images, productName }: Props) {
  // image_url が null/空のレコードを除外（SSR クラッシュ防止）
  const validImages = images.filter(
    (img): img is ProductImage & { image_url: string } => !!img.image_url,
  );

  // 商品画像（main/sub/color/drawing）と設置イメージ（usage）を分離
  const productImages = validImages.filter((i) => i.image_type !== "usage");
  const installationImages = validImages.filter((i) => i.image_type === "usage");
  const hasProduct = productImages.length > 0;
  const hasInstallation = installationImages.length > 0;

  const [viewMode, setViewMode] = useState<ViewMode>(hasProduct ? "product" : "installation");
  const activeImages =
    viewMode === "installation" && hasInstallation ? installationImages : productImages;

  const mainImg =
    activeImages.find((i) => i.image_type === "main") ?? activeImages[0] ?? validImages[0];
  const [selectedId, setSelectedId] = useState<string | null>(mainImg?.id ?? null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // タブ切替時は先頭画像を選び直す
  useEffect(() => {
    setSelectedId(activeImages[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const selectedIndex = activeImages.findIndex((i) => i.id === selectedId);
  const selected = activeImages[selectedIndex] ?? activeImages[0];

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = useCallback(() => {
    if (activeImages.length < 2) return;
    const prevIndex = (selectedIndex - 1 + activeImages.length) % activeImages.length;
    setSelectedId(activeImages[prevIndex].id);
  }, [activeImages, selectedIndex]);

  const goNext = useCallback(() => {
    if (activeImages.length < 2) return;
    const nextIndex = (selectedIndex + 1) % activeImages.length;
    setSelectedId(activeImages[nextIndex].id);
  }, [activeImages, selectedIndex]);

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

  if (validImages.length === 0 || !selected) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-700">
          <span className="font-mono text-xs tracking-widest">NO IMAGE</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* ── 商品画像 / 設置イメージ 切替タブ ── */}
        {hasProduct && hasInstallation && (
          <div className="inline-flex rounded-full border border-neutral-800 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode("product")}
              className={`rounded-full px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-200 ${
                viewMode === "product"
                  ? "bg-amber-500 text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              商品画像
            </button>
            <button
              type="button"
              onClick={() => setViewMode("installation")}
              className={`rounded-full px-4 py-1.5 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors duration-200 ${
                viewMode === "installation"
                  ? "bg-amber-500 text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              設置イメージ
            </button>
          </div>
        )}

        {/* ── サムネイル＋メイン画像（PC：サムネイル左・メイン右／モバイル：メイン上・サムネイル下） ── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          {/* サムネイル（複数枚のみ） */}
          {activeImages.length > 1 && (
            <div className="order-2 flex gap-2.5 overflow-x-auto pb-1 lg:order-1 lg:max-h-[560px] lg:w-20 lg:shrink-0 lg:flex-col lg:gap-3 lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
              {activeImages.map((img, i) => {
                const isActive = img.id === selectedId;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedId(img.id)}
                    className={`relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-lg border bg-neutral-900 transition-all duration-200 lg:w-full ${
                      isActive
                        ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-[1.03]"
                        : "border-neutral-800 opacity-70 hover:border-neutral-600 hover:opacity-100"
                    }`}
                    aria-label={img.alt_text ?? `画像 ${i + 1}`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text ?? ""}
                      fill
                      sizes="76px"
                      className="object-contain p-1.5"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* メイン画像（クリックで Lightbox）：画面を占有しすぎないよう最大幅を制限し、商品を主役に中央配置 */}
          <div className="order-1 min-w-0 flex-1 lg:order-2 lg:mx-auto lg:max-w-[440px]">
            <button
              type="button"
              onClick={openLightbox}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-950 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.035),transparent_70%)] shadow-[0_0_50px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="画像を拡大表示"
            >
              <div className="relative aspect-square">
                {/* 黒背景内で商品を上品に見せる、柔らかい設置影 */}
                <div className="pointer-events-none absolute inset-x-12 bottom-6 h-8 rounded-full bg-black/70 blur-2xl" />
                <Image
                  src={selected.image_url}
                  alt={selected.alt_text ?? productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="relative object-contain p-8 transition-transform duration-500 group-hover:scale-[1.02] sm:p-10"
                  priority
                />
              </div>
              {/* 拡大アイコン（ホバー時） */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
                <ZoomIn size={14} className="text-neutral-300" />
              </div>
            </button>

            {/* 枚数インジケーター */}
            {activeImages.length > 1 && (
              <p className="mt-3 text-center font-mono text-[10px] tracking-widest text-neutral-700">
                {selectedIndex + 1} / {activeImages.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && (
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
          {activeImages.length > 1 && (
            <p className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-neutral-600">
              {selectedIndex + 1} / {activeImages.length}
            </p>
          )}

          {/* 前へ */}
          {activeImages.length > 1 && (
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
          {activeImages.length > 1 && (
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
              alt={selected.alt_text ?? productName}
              width={1200}
              height={1200}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>

          {/* モバイル：下部サムネイル */}
          {activeImages.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {activeImages.map((img, i) => {
                const isActive = img.id === selectedId;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedId(img.id)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 bg-neutral-900 transition-all ${
                      isActive
                        ? "border-amber-500"
                        : "border-neutral-700 opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`画像 ${i + 1}`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text ?? ""}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
