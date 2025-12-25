import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Doto } from "next/font/google";
import { CursorIconLayer } from "@/components/CursorIconLayer";

const doto = Doto({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  display: "swap",
  variable: "--font-doto",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModTac Media",
  description: "Tactical marketing, executed with restraint.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${doto.variable} antialiased bg-black text-white scrollbar-hidden`}
      >
        {children}
        <CursorIconLayer />
      </body>
    </html>
  );
}
