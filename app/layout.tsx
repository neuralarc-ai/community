import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";
import MainLayoutClientWrapper from "@/app/components/MainLayoutClientWrapper";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo Sphere black.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo Sphere black.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/logo Sphere black.png" /> {/* Fallback for browsers that don't support media queries */}
      </head>
      <body
        className={`${sora.variable} ${manrope.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden`}
      >
        <MainLayoutClientWrapper>
        {children}
        </MainLayoutClientWrapper>
        <Toaster />
      </body>
    </html>
  );
}
