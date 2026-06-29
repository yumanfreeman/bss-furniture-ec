/**
 * SKU → URL slug 変換
 * 例: "AC-01-Matt-Black-004" → "ac-01-matt-black-004"
 * 一覧ページと詳細ページで同じ関数を使う
 */
export function slugifyForUrl(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")        // スペース → ハイフン
    .replace(/[^a-z0-9-]/g, "-") // 英数字・ハイフン以外 → ハイフン
    .replace(/-+/g, "-")          // 連続ハイフン → 1つ
    .replace(/^-|-$/g, "");       // 先頭・末尾のハイフン除去
}
