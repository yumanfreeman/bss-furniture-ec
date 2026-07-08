import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bss-japan.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // カート・注文フローは検索結果に出す必要がないページのため除外
      disallow: ["/cart", "/checkout", "/order-complete"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
