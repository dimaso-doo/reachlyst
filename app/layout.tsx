import type { Metadata } from "next";
import "@tabler/core/dist/css/tabler.min.css";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://reachlyst.com");
const title = "Reachlyst - AI Sales Navigator Outreach Assistant";
const description =
  "Reachlyst helps teams review Sales Navigator lead context, draft better invites and replies, and organize manual outreach without auto-sending messages.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Reachlyst",
  title: {
    default: title,
    template: "%s | Reachlyst"
  },
  description,
  keywords: [
    "Reachlyst",
    "Sales Navigator outreach",
    "LinkedIn outreach assistant",
    "AI sales outreach",
    "manual outreach workflow",
    "connection invite drafts",
    "B2B lead workflow"
  ],
  authors: [{ name: "Reachlyst" }],
  creator: "Reachlyst",
  publisher: "Reachlyst",
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Reachlyst",
    title,
    description,
    images: [
      {
        url: "/product-screenshots/dashboard.png",
        width: 1440,
        height: 900,
        alt: "Reachlyst outreach workspace dashboard"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/product-screenshots/dashboard.png"]
  },
  category: "software",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
