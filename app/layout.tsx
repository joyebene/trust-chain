
import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    weight: ["400", "500", "600", "700"],
    display: "swap",
});

const manrope = Manrope({
    subsets: ["latin"],
    variable: "--font-manrope",
    weight: ["500", "600", "700", "800"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Trust Chain | Building Wealth Through Bitcoin",
    description:
        "A structured Bitcoin-focused investment platform built around transparency and long-term vision.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${dmSans.variable} ${manrope.variable}`}>
                {children}
            </body>
        </html>
    );
}
