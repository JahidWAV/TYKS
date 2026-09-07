import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "iorti — Vos pass événements sans friction",
  description:
    "iorti est la billetterie événementielle sans friction : connexion en un clic, pass infalsifiables, zéro jargon crypto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${syne.variable}`}>
      <body className="font-sans antialiased bg-void">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
