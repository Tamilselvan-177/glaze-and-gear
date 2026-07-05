import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { Inter, Playfair_Display } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: {
    default: "Glaze & Gear — Premium Ceramics & Automotive Gifts",
    template: "%s | Glaze & Gear",
  },
  description: "Discover handcrafted ceramic glazeware and premium automotive gear at Glaze & Gear. Unique gifts for car lovers and homemakers. Shop now — free gift wrapping available.",
  keywords: ["ceramic gifts", "automotive gear", "premium gifts India", "car accessories", "glaze pottery"],
  openGraph: {
    type: "website",
    siteName: "Glaze & Gear",
    title: "Glaze & Gear — Premium Ceramics & Automotive Gifts",
    description: "Unique handcrafted ceramics and premium automotive gear. Perfect for every occasion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Glaze & Gear — Premium Gifts",
    description: "Handcrafted ceramics & automotive gear for every occasion.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#F9EAEA]/30 text-[#0a0a0a]`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}