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
  title: "Rhythm Place",
  description: "Music for all tribes, moods, and moments.",
  openGraph: {
    title: "Rhythm Place",
    description: "Music for all tribes, moods, and moments.",
    url: "https://rhythm.place",
    siteName: "Rhythm Place",
    images: [
      {
        url: "https://rhythm.place/images/ogp.png",
        width: 256,
        height: 256,
        alt: "Rhythm Place - Music for all tribes, moods, and moments.",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/ogp.svg" sizes="any" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
