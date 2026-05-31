import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const domain = "https://farmhouseplatform.com";

  // Fetch all published properties from database
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("is_published", true);

  const staticPages = [
    {
      url: `${domain}/`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${domain}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  const stayPages = (properties || []).map((property) => ({
    url: `${domain}/properties/${property.slug}`,
    lastModified: new Date(property.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...stayPages];
}
