import type { Metadata } from "next";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import HeaderInstitucional from "@/components/HeaderInstitucional";

export const metadata: Metadata = {
  title: "GECI-VA — Coordinación de Protección Civil y Bomberos de Metepec",
  description:
    "Sistema Web de Gestión de Comando de Incidentes GECI-VA, conforme a la NOM-019-SSPC-2019.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-gris">
        <HeaderInstitucional />
        <SessionProviderWrapper>
          <div className="flex-1">{children}</div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
