import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { ConditionalFooter } from "@/components/conditional-footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Skin-Aware AI",
  description: "Personalized skincare analysis and AI consultation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <ConditionalFooter />
      </body>
    </html>
  );
}
