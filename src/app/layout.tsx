import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LegalNoticeModal } from "@/components/LegalNoticeModal";
import ModuleGuard from "@/components/ModuleGuard";
import RootPageChrome from "@/components/RootPageChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salus",
  description: "Salus Health & Safety Management System",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ModuleGuard>
          <RootPageChrome>{children}</RootPageChrome>
          <LegalNoticeModal />
        </ModuleGuard>
      </body>
    </html>
  );
}
