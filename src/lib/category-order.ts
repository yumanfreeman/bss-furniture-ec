/**
 * カテゴリ表示順の共通定義 — bss-furniture-admin と共通ロジック
 */

export const CATEGORY_ORDER: Record<string, number> = {
  "chair":            100,
  "mirror":           200,
  "shampoo":          300,
  "recline-chair":    400,
  "trolley":          500,
  "beauty-bed":       600,
  "sofa":             700,
  "stool":            800,
  "barber-chair":     900,
  "shampoo-chair":   1000,
  "shampoo-backwash":1100,
  "mirror-only":     1200,
  "other":           1300,
  "accessories":     9999,

  // 日本語 name 後方互換
  "セットチェア": 100,
  "椅子":         100,
  "セット面":     200,
  "シャンプー台": 300,
  "リクライニングチェア": 400,
  "ワゴン":       500,
  "ビューティーベッド": 600,
  "ソファ":       700,
  "スツール":     800,
  "バーバーチェア": 900,
  "シャンプーチェア": 1000,
  "シャンプーバックウォッシュ": 1100,
  "ミラー":       1200,
  "その他":       1300,
  "Accessories":  9999,
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
