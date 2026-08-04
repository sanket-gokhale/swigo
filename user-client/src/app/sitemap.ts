import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://swigo.me",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://swigo.me/pgs",
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: "https://swigo.me/about",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: "https://swigo.me/contact",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
