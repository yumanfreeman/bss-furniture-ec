import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { slugifyForUrl } from "@/lib/slugify";
import { extractCategory } from "@/lib/types";
import type { Category, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bss-japan.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/works`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/interior`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/opening-support`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
    supabase.from("categories").select("id, name, slug"),
    supabase
      .from("products")
      .select("id, product_name, slug, sku, selling_price, color, description, categories(id, name, slug), product_images(id, image_url, image_type, alt_text, sort_order)")
      .not("category_id", "is", null)
      .eq("visibility", "public"),
  ]);

  const categories = (categoriesData ?? []) as Category[];
  const products = (productsData ?? []) as unknown as ProductListItem[];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/products/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products
    .map((p) => {
      const cat = extractCategory(p.categories);
      if (!cat?.slug) return null;
      const key = p.sku ? slugifyForUrl(p.sku) : p.id;
      return {
        url: `${siteUrl}/products/${cat.slug}/${key}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
