import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GECI-VA — Coordinación de Protección Civil y Bomberos de Metepec",
  description:
    "Sistema Web de Gestión de Comando de Incidentes GECI-VA, conforme a la NOM-019-SSPC-2019.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
