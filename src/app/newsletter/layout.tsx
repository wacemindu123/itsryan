import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter – AI Tips for Small Businesses",
  description:
    "Join the ItsRyan.ai newsletter for weekly AI tips, tools, and strategies to help your small business grow.",
  openGraph: {
    title: "Newsletter – AI Tips for Small Businesses",
    description:
      "Weekly AI tips, tools, and strategies to help your small business grow.",
    url: "https://www.itsryan.ai/newsletter",
  },
};

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
