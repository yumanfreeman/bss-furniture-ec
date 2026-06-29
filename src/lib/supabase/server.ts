import { createServerClient } from "@supabase/ssr";

/**
 * EC サイト用 Supabase サーバークライアント
 * 認証なし・読み取り専用・anon key のみ使用
 */
export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    },
  );
}
