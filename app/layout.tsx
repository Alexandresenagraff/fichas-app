import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fichas Sublimação",
  description: "Sistema de fichas",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}