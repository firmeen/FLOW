import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Inter, Public_Sans } from "next/font/google";

import { FLOW_BRAND_ASSETS } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-flow-sans",
});

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-foodflow-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-foodflow-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "FoodFlow - Restaurant Operations | FLOW",
    template: "%s | FLOW",
  },
  description:
    "One connected restaurant flow from table ordering to kitchen, service, billing, and owner visibility.",
  applicationName: "FoodFlow",
  icons: {
    icon: [
      {
        url: FLOW_BRAND_ASSETS.favicon,
        type: "image/png",
        sizes: "1254x1254",
      },
    ],
    shortcut: FLOW_BRAND_ASSETS.favicon,
  },
  openGraph: {
    type: "website",
    siteName: "FLOW",
    title: "FoodFlow - Restaurant Operations",
    description:
      "One connected restaurant flow from table ordering to kitchen, service, billing, and owner visibility.",
    images: [
      {
        url: FLOW_BRAND_ASSETS.openGraph,
        width: 1536,
        height: 1024,
        alt: "FLOW",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodFlow - Restaurant Operations",
    description:
      "One connected restaurant flow from table ordering to kitchen, service, billing, and owner visibility.",
    images: [FLOW_BRAND_ASSETS.openGraph],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f22" },
  ],
  colorScheme: "light dark",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-full bg-background font-sans antialiased",
        ibmPlexSans.variable,
        publicSansHeading.variable,
        inter.variable,
      )}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
