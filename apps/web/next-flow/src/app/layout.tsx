import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FoodFlowProvider } from "@/store/foodflow-store";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodFlow MVP",
  description: "Restaurant operations from table to kitchen to payment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <FoodFlowProvider>{children}</FoodFlowProvider>
      </body>
    </html>
  );
}
