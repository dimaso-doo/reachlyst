import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://reachlyst.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/login", "/signup"]
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
