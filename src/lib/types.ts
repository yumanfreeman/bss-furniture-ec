// BSS EC サイト 型定義（読み取り専用）

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  product_id?: string;
  image_url: string;
  image_type: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProductListItem = {
  id: string;
  product_name: string;
  slug: string | null;
  sku: string | null;
  selling_price: number | null;
  color: string | null;
  description: string | null;
  // Supabase join は配列で返る場合がある
  categories: Category | Category[] | null;
  product_images: ProductImage[];
};

export type ProductDetail = {
  id: string;
  product_name: string;
  slug: string | null;
  sku: string | null;
  description: string | null;
  features: string | null;
  selling_price: number | null;
  color: string | null;
  material: string | null;
  dimensions: string | null;
  width_mm: number | null;
  depth_mm: number | null;
  height_mm: number | null;
  // 在庫・販売情報
  status: string;
  stock_quantity: number;
  is_made_to_order: boolean;
  lead_time: string | null;
  pdf_url: string | null;
  categories: Category | Category[] | null;
  product_images: ProductImage[];
};

/** Supabase join 結果から Category を1件取り出す */
export function extractCategory(
  raw: Category | Category[] | null | undefined,
): Category | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}
