import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";
import LayoutWrapper from "@/app/components/LayoutWrapper";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sphere Community Portal",
  description: "Manage your community with posts, conclaves, and meetings",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: "/logo Sphere black.png",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: "/logo Sphere black.png",
    },
    {
      url: "/logo Sphere black.png", // Fallback for browsers that don't support media queries
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${manrope.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden`}
      >
        <LayoutWrapper>
        {children}
        </LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
