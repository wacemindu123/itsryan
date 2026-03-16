import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";
import NewsletterPopup from "@/components/NewsletterPopup";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ryan Widgeon | Free Tech for Small Businesses",
    template: "%s | ItsRyan.ai",
  },
  description:
    "I help Atlanta small businesses scale using AI and technology—websites, automations, chatbots, and more. For free.",
  metadataBase: new URL("https://www.itsryan.ai"),
  keywords: [
    "free tech for small businesses",
    "AI for small business",
    "Atlanta small business",
    "free website builder",
    "AI automation",
    "chatbot for business",
    "Ryan Widgeon",
  ],
  authors: [{ name: "Ryan Widgeon" }],
  creator: "Ryan Widgeon",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.itsryan.ai",
    siteName: "ItsRyan.ai",
    title: "Ryan Widgeon | Free Tech for Small Businesses",
    description:
      "AI tools, automations, websites—the same stuff big companies pay $50k+ for. Built free for Atlanta small businesses.",
    images: [
      {
        url: "/chatgptportrait.png",
        width: 512,
        height: 512,
        alt: "ItsRyan.ai – Free Tech for Small Businesses",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Ryan Widgeon | Free Tech for Small Businesses",
    description:
      "AI tools, automations, websites—the same stuff big companies pay $50k+ for. Built free for Atlanta small businesses.",
    images: ["/chatgptportrait.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: "/chatgptportrait.png",
    apple: "/chatgptportrait.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en">
      <head>
        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v9crozkcpd");
          `}
        </Script>
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-script" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.variable} antialiased`}>
        <PostHogProvider>
          {children}
          <NewsletterPopup />
        </PostHogProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if key is available
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }
  
  return content;
}
