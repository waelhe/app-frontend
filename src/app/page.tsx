import { HomePage } from "@/components/HomePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نبض - Nabd | سوق الخدمات المحلية",
  description:
    "منصة متكاملة لخدمات المنطقة - صيدليات مناوبة، أطباء، سوق محلي، عقارات، ومجتمع. كل ما تحتاجه في مكان واحد.",
  keywords: [
    "نبض",
    "قدسيا",
    "خدمات محلية",
    "صيدليات",
    "أطباء",
    "سوق",
    "عقارات",
    "مجتمع",
    "سوريا",
    "ضاحية قدسيا",
  ],
  authors: [{ name: "Nabd Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "نبض - سوق الخدمات المحلية",
    description:
      "منصة متكاملة لخدمات المنطقة - كل ما تحتاجه في مكان واحد",
    type: "website",
  },
};

export default function Page() {
  return <HomePage />;
}
