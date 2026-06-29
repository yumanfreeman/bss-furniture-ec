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
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
        <div className="flex h-full items-center justify-center text-sm text-neutral-700">
          NO IMAGE
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* メイン画像 */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
        <Image
          src={selected.image_url}
          alt={selected.alt_text ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain transition-opacity duration-200"
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
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-neutral-900 transition-all ${
                  isActive
                    ? "border-amber-500"
                    : "border-neutral-700 hover:border-neutral-500"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text ?? ""}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
