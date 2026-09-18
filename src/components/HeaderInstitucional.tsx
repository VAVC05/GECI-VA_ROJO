"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/incidentes", label: "Incidentes" },
  { href: "/recursos", label: "Recursos" },
  { href: "/estadisticas", label: "Estadísticas" },
];

export default function HeaderInstitucional() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const esLogin = pathname === "/login";
  const esAdmin = session?.user?.rol === "Administrador";

  return (
    <header className="flex flex-wrap items-center gap-3 bg-rojo px-6 py-3 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white p-1">
          <Image
            src="/logos/pc_metepec.png"
            alt="Protección Civil Metepec"
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white p-1">
          <Image
            src="/logos/bomberos.png"
            alt="H. Cuerpo de Bomberos Metepec"
            width={40}
            height={40}
            className="h-full w-full object-contain"
            priority
          />
        </span>
        <div className="leading-tight">
          <p className="text-lg font-bold tracking-wide text-white">GECI-VA</p>
          <p className="text-xs text-red-100">Gestión del Comando de Incidentes</p>
        </div>
      </Link>

      {!esLogin && session && (
        <>
          <nav className="ml-auto flex flex-wrap items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const activo =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                    activo
                      ? "bg-white text-rojo"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {esAdmin && (
              <Link
                href="/admin"
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-white text-rojo"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3 border-l border-white/20 pl-4 ml-2">
            <span className="hidden text-sm text-white md:inline">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded border border-white/30 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </header>
  );
}