import type { Metadata } from "next";
import "./globals.css";
import { Inter, Instrument_Serif, Outfit } from "next/font/google"; // Using Google Fonts
import SmoothScroll from "@/components/ui/smooth-scroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const instrumentSerif = Instrument_Serif({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-serif",
    display: "swap"
});
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap"
});

export const metadata: Metadata = {
    title: "Dynamic Design Factory",
    description: "We build digital experiences.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} ${outfit.variable}`}>
            <body className="antialiased bg-white text-black selection:bg-purple-500 selection:text-white">
                <SmoothScroll />
                {children}
            </body>
        </html>
    );
}
