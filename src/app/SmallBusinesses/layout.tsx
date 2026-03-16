import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Small Businesses I'm Helping",
  description:
    "Real results for real small businesses. See the Atlanta businesses I'm helping scale with free AI tools and technology.",
  openGraph: {
    title: "Small Businesses I'm Helping",
    description:
      "Real results for real small businesses using free AI tools and technology.",
    url: "https://www.itsryan.ai/SmallBusinesses",
  },
};

export default function SmallBusinessesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
