import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENAGRAFF",
  description: "Sistema de Produção SENAGRAFF",
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