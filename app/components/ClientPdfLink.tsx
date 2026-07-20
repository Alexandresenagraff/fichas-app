import type { ReactNode } from "react";

interface ClientPdfLinkProps {
  pdfLink?: string;
  className?: string;
  children: ReactNode;
}

export default function ClientPdfLink({ pdfLink, className, children }: ClientPdfLinkProps) {
  if (!pdfLink) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={pdfLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className || ""} hover:text-blue-400 hover:underline underline-offset-4 transition-colors cursor-pointer`}
      title="Abrir ficha em PDF"
    >
      {children}
    </a>
  );
}
