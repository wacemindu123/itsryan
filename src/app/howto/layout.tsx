import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How-To Guides – Learn AI for Your Business",
  description:
    "Step-by-step guides on using AI, ChatGPT, and automation to grow your small business. Free and paid guides available.",
  openGraph: {
    title: "How-To Guides – Learn AI for Your Business",
    description:
      "Step-by-step guides on using AI, ChatGPT, and automation to grow your small business.",
    url: "https://www.itsryan.ai/howto",
  },
};

export default function HowtoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
