import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwipeMRR — Swipe through startups for sale",
  description:
    "Discover startups for sale with a Tinder-style swipe interface. Browse MRR, pricing, and growth metrics at a glance.",
  metadataBase: new URL("https://swipemrr.com"),
  openGraph: {
    title: "SwipeMRR — Swipe through startups for sale",
    description:
      "Discover startups for sale with a Tinder-style swipe interface. Browse MRR, pricing, and growth metrics at a glance.",
    url: "https://swipemrr.com",
    siteName: "SwipeMRR",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwipeMRR — Swipe through startups for sale",
    description:
      "Discover startups for sale with a Tinder-style swipe interface. Browse MRR, pricing, and growth metrics at a glance.",
    creator: "@michal_codes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
      <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
    </html>
  );
}
