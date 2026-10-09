import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Nav, { Foot, TabBar } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Kitsune — Find what to watch next",
  description:
    "A calm, cinematic way to browse 20,000+ anime. Search, filter by mood, and let the interface take its colour from what you find.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/kitsune.png" />
      </head>
      <body>
        <Providers>
          <div className="glow" aria-hidden="true" />
          <div className="grain" aria-hidden="true" />
          <Nav />
          {children}
          <Foot />
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
