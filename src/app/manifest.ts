import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "classcutcheyaamo?",
    short_name: "classcut?",
    description: "attendance percentage tracker for kerala college students",
    // straight into the app, the proxy bounces to /login if there's no session
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    lang: "en",
    categories: ["education", "productivity"],
    // single values only in a manifest, so these follow the light theme
    background_color: "#fbf7ee",
    theme_color: "#fbf7ee",
    icons: [
      {
        src: "/pwa-icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
