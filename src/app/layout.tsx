import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import { IdentityProvider } from "@/lib/identity";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Crete Trip",
  description: "Balance, places and checklist for the Crete trip",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#175683",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <IdentityProvider>
          <AppShell>{children}</AppShell>
        </IdentityProvider>
      </body>
    </html>
  );
}
