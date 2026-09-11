import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trust Chain | Building Wealth Through Bitcoin",
  description: "A structured Bitcoin-focused investment platform built around transparency and long-term vision.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
