import type { Metadata } from "next";
import { Open_Sans, Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";
import GoogleAnalytics from "./components/GoogleAnalytics";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fake Billboard Generator",
  description: "Create custom billboard designs for entertainment purposes. A free, browser-based tool for making parody billboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${oswald.variable} ${playfairDisplay.variable} antialiased font-[family-name:var(--font-open-sans)]`}
      >
        {children}
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
