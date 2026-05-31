import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/properties/", "/login", "/signup"],
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: "https://farmhouseplatform.com/sitemap.xml",
  };
}
