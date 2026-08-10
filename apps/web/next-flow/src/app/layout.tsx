import type { Metadata, Viewport } from "next";

import { FoodFlowProvider } from "@/store";

import "./globals.css";

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
  themeColor: "#12372a",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="min-h-full bg-background antialiased">
      <body className="min-h-full bg-background text-foreground">
        <FoodFlowProvider>{children}</FoodFlowProvider>
      </body>
    </html>
  );
}
