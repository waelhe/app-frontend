import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/language-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CartProvider } from "@/providers/cart-provider";
import { RegionProvider } from "@/providers/region-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

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
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
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
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <RegionProvider>
                  <div className="flex min-h-screen flex-col">
                    <Header />
                    <main className="flex-1 pt-16 pb-20 md:pb-0">
                      {children}
                    </main>
                    <Footer />
                    <BottomNav />
                  </div>
                </RegionProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
