import type { MetadataRoute } from "next";
import { ALGORITHMS } from "@/data/algorithms";

const BASE_URL = "https://playground.hugofmiranda.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/compare`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const algorithmRoutes: MetadataRoute.Sitemap = ALGORITHMS.map((algorithm) => ({
    url: `${BASE_URL}/algorithms/${algorithm.slug}`,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...algorithmRoutes];
}
