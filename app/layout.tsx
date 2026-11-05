import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { copy } from "@/lib/copy";
import "./globals.css";

// Dua font dari Google, dimuat lewat fitur bawaan Next.js (bukan library tambahan).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: copy.brand,
  description: copy.metaDescription,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${instrumentSerif.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-dvh">
        {/* Latar "Dune": gradasi senja dan gelembung buram di belakang semua kaca. */}
        <div className="dune" aria-hidden="true">
          <div className="dune-blob b1" />
          <div className="dune-blob b2" />
          <div className="dune-blob b3" />
          <div className="dune-blob b4" />
        </div>
        {children}
      </body>
    </html>
  );
}
