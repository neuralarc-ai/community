import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";

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
        <link rel="icon" href="/logo Sphere black.png" />
      </head>
      <body
        className={`${sora.variable} ${manrope.variable} antialiased bg-background text-foreground font-sans overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
