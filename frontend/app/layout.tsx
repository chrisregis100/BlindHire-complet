import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BlindHire — Fair Freelance Bidding on Starknet",
    template: "%s | BlindHire",
  },
  description:
    "Privacy-preserving freelance marketplace with commit-reveal sealed bids on Starknet. No one sees your price until the confirmation period.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <Navbar />
          <div className="min-h-[calc(100vh-65px)]">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
