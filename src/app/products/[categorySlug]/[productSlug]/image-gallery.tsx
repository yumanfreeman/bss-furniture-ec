"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import type { ProductImage } from "@/lib/types";

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ImageGallery({ images, productName }: Props) {
  const mainImg = images.find((i) => i.image_type === "main") ?? images[0];
  const [selectedId, setSelectedId] = useState<string | null>(mainImg?.id ?? null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedIndex = images.findIndex((i) => i.id === selectedId);
  const selected = images[selectedIndex] ?? images[0];

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const goPrev = useCallback(() => {
    if (images.length < 2) return;
    const prevIndex = (selectedIndex - 1 + images.length) % images.length;
    setSelectedId(images[prevIndex].id);
  }, [images, selectedIndex]);

  const goNext = useCallback(() => {
    if (images.length < 2) return;
    const nextIndex = (selectedIndex + 1) % images.length;
    setSelectedId(images[nextIndex].id);
  }, [images, selectedIndex]);

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

  if (images.length === 0) {
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
      <div className="space-y-3">
        {/* ── メイン画像（クリックで Lightbox） ── */}
        <button
          type="button"
          onClick={openLightbox}
          className="group relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-[0_0_40px_rgba(0,0,0,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="画像を拡大表示"
        >
          <div className="relative aspect-square">
            <Image
              src={selected.image_url}
              alt={selected.alt_text ?? productName}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          </div>
          {/* 拡大アイコン（ホバー時） */}
          <div className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            <ZoomIn size={14} className="text-neutral-300" />
          </div>
        </button>

        {/* ── サムネイル（複数枚のみ） ── */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img) => {
              const isActive = img.id === selectedId;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedId(img.id)}
                  className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-900 transition-all duration-150 ${
                    isActive
                      ? "border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                      : "border-neutral-800 hover:border-neutral-600"
                  }`}
                  aria-label={img.alt_text ?? `画像 ${images.indexOf(img) + 1}`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text ?? ""}
                    fill
                    sizes="72px"
                    className="object-contain p-1.5"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* 枚数インジケーター */}
        {images.length > 1 && (
          <p className="text-center font-mono text-[10px] text-neutral-700">
            {selectedIndex + 1} / {images.length}
          </p>
        )}
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
          {images.length > 1 && (
            <p className="absolute top-5 left-1/2 -translate-x-1/2 font-mono text-[11px] text-neutral-600">
              {selectedIndex + 1} / {images.length}
            </p>
          )}

          {/* 前へ */}
          {images.length > 1 && (
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
          {images.length > 1 && (
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
          {images.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 overflow-x-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, i) => {
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
