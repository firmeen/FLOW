import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Public_Sans } from "next/font/google";

import { FoodFlowProvider } from "@/store";
import { cn } from "@/lib/utils";

import "./globals.css";

const publicSansHeading = Public_Sans({
  subsets: ["latin"],
  variable: "--font-foodflow-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-foodflow-sans",
});

export const metadata: Metadata = {
  title: {
    default: "FoodFlow - Restaurant Operations",
    template: "%s - FoodFlow",
  },
  description:
    "One connected restaurant flow from table ordering to kitchen, service, billing, and owner visibility.",
  applicationName: "FoodFlow",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1f22" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "min-h-full bg-background font-sans antialiased",
        ibmPlexSans.variable,
        publicSansHeading.variable,
      )}
    >
      <body className="min-h-full bg-background text-foreground">
        <FoodFlowProvider>{children}</FoodFlowProvider>
      </body>
    </html>
  );
}
