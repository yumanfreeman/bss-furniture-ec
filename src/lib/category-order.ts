/**
 * カテゴリ表示順の共通定義
 */

export const CATEGORY_ORDER: Record<string, number> = {
  // DBの実スラッグ（英語）— 希望表示順
  "salon-chair":       100,
  "barber-chair":      200,
  "recline-chair":     300,
  "beauty-bed":        400,
  "shampoo-chair":     500,
  "shampoo-backwash":  600,
  "mirror":            700,
  "stool":             800,
  "trolley":           900,
  "sofa":             1000,
  "other":            1100,
  "mirror-only":      1200,
  "accessories":      1300,

  // 後方互換（旧スラッグ）
  "chair":             100,
  "shampoo":           500,
};

export function getCategoryPriorityByNameSlug(
  name?: string | null,
  slug?: string | null,
): number {
  const bySlug = CATEGORY_ORDER[(slug ?? "").toLowerCase()];
  if (bySlug !== undefined) return bySlug;
  const byName = CATEGORY_ORDER[name ?? ""];
  if (byName !== undefined) return byName;
  return 5000;
}

export function sortCategories<T extends { name?: string | null; slug?: string | null }>(
  categories: T[],
): T[] {
  return [...categories].sort(
    (a, b) =>
      getCategoryPriorityByNameSlug(a.name, a.slug) -
      getCategoryPriorityByNameSlug(b.name, b.slug),
  );
}
