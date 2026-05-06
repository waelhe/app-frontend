import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/stores/QueryProvider";
import { AuthInitializer } from "@/components/system/AuthInitializer";
import { CapacitorInitializer } from "@/components/system/CapacitorInitializer";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { BackendStatusBanner } from "@/components/system/BackendStatusBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "نبض - Nabd | سوق الخدمات المحلية",
  description: "سوق الخدمات المحلية - اكتشف أفضل المزوّدين والخدمات في منطقتك. نبض هو دليلك الشامل للخدمات المحلية.",
  keywords: ["نبض", "Nabd", "خدمات محلية", "سوق", "سوريا", "local services", "marketplace"],
  authors: [{ name: "Nabd Team" }],
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "نبض - Nabd | سوق الخدمات المحلية",
    description: "اكتشف أفضل المزوّدين والخدمات في منطقتك",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning style={{ overflowAnchor: 'none' }}>

      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D32F2F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="نبض" />
        <script dangerouslySetInnerHTML={{ __html: `if('scrollRestoration' in window.history){window.history.scrollRestoration='manual';}` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <CapacitorInitializer />
          <AuthInitializer>
            <div className="flex min-h-screen flex-col">
              <Header />
              <BackendStatusBanner />
              <main className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
              <Footer />
              <BottomNav />
            </div>
          </AuthInitializer>
        </QueryProvider>
        <Toaster />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}` }} />
      </body>
    </html>
  );
}
