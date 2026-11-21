import { getSiteUrl } from "@/lib/siteUrl";

/** sitemap.xml: Dev.Idea es una sola página (landing + app). */
export default function sitemap() {
  return [
    {
      url: getSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
