import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Reachlyst",
    short_name: "Reachlyst",
    description: "AI outreach assistant for Sales Navigator and manual B2B outreach workflows.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7fb",
    theme_color: "#1677ff",
    icons: [
      {
        src: "/icon.png",
        sizes: "256x256",
        type: "image/png"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
}
