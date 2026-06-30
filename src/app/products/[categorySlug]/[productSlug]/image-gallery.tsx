"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";

type Props = {
  images: ProductImage[];
  productName: string;
};

export function ImageGallery({ images, productName }: Props) {
  const mainImg = images.find((i) => i.image_type === "main") ?? images[0];
  const [selectedId, setSelectedId] = useState<string | null>(mainImg?.id ?? null);

  const selected = images.find((i) => i.id === selectedId) ?? images[0];

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
    <div className="space-y-3">
      {/* メイン画像 — 正方形で大きく */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <Image
          src={selected.image_url}
          alt={selected.alt_text ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4 transition-opacity duration-300"
          priority
        />
      </div>

      {/* サブ画像サムネイル（複数枚のときのみ表示） */}
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
    </div>
  );
}
