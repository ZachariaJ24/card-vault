import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CardVault | Sports Card Market Tracker",
  description: "Track sports card values like the stock market.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060d18] text-white antialiased">{children}</body>
    </html>
  );
}
