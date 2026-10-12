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
  title: "Rota — Cross-border payment requests on Solana",
  description:
    "Students and young freelancers in Türkiye request money from abroad with a link. Payers settle in USDC via Solana Pay; receipts are verified on-chain.",
  keywords: ["Solana", "Solana Pay", "PayFi", "Remittance", "Cross-border", "Turkey", "Erasmus", "Freelance", "USDC"],
  authors: [{ name: "Altan Çetin Çelik", url: "https://altancelik.dev" }],
  icons: { icon: "/icon.png" },
  openGraph: {
    title: "Rota — Cross-border payment requests on Solana",
    description: "Request money from abroad with a link. Paid in USDC in seconds, verified on-chain.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white">{children}</body>
    </html>
  );
}
