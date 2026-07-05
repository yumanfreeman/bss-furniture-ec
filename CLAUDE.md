# ⚠️ BSSブランドルール（最優先・変更禁止）

**正式ロゴは `public/logo.png`（BSS Beauty Salon Suppliers）のみ使用する。**

- 対象: ECサイト全ページ / ヘッダー / OGP / メール / PDF
- `public/logo.png` 以外のロゴを使用・提案・復元してはいけない
- Lash Supplier のロゴ・名称・画像・ブランドを表示・提案・復元してはいけない
- ロゴが変わっていた場合は不具合として `public/logo.png` へ戻す
- **このルールは他のすべての実装指示より優先する**

# BSS EC サイト（bss-furniture-ec）

## プロジェクト概要

セット椅子・シャンプー台・ミラー・ワゴン等の美容器具を扱うECサイト（公開向け）。

## システム構成

- フレームワーク: Next.js 16（App Router）
- DB: Supabase（anon key のみ使用・secret key 不使用）
- スタイル: Tailwind CSS v4
- デザイン: 黒×ゴールド（高級感）

## 重要ルール

- **secret key は使わない**（anon key で安全に insert できる RLS 設計）
- **Lash Supplier 側のデータ・画面は触らない**
- BSS商品フィルター: `.not("category_id", "is", null)`（eyelash商品は category_id = null）
- 全ページに `export const dynamic = "force-dynamic"` が必要
- `createClient()` は同期（ブラウザクライアント）
