import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ryan Widgeon | Free Tech for Small Businesses",
  description: "I help small businesses scale using AI and technology. For free.",
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
        {/* Calendly */}
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if key is available
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }
  
  return content;
}
