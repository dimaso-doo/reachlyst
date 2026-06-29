import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://reachlyst.com";

const publicRoutes = [
  { path: "/", priority: 1 },
  { path: "/pricing", priority: 0.9 },
  { path: "/privacy", priority: 0.4 },
  { path: "/terms", priority: 0.4 },
  { path: "/refund", priority: 0.3 }
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority
  }));
}
