import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ROTA — Sınır Ötesi PayFi Yönlendiricisi | Solana",
  description: "Öğrenciler ve serbest çalışanlar için sıfır gizli makaslı, anında 400ms sınır ötesi para transferi. Banka ve SWIFT kesintilerini ortadan kaldıran Solana PayFi altyapısı.",
  keywords: ["Solana", "PayFi", "Remittance", "Cross-border", "Turkey", "Erasmus", "Freelance", "USDC"],
  authors: [{ name: "Altan Çetin Çelik", url: "https://altancelik.dev" }],
  openGraph: {
    title: "ROTA — Cross-Border PayFi Remittance Router on Solana",
    description: "Compare live bank SWIFT fees, hidden FX markups, and instant Solana PayFi rails.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}
