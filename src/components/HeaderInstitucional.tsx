import Image from "next/image";

export default function HeaderInstitucional() {
  return (
    <header className="flex items-center gap-3 bg-rojo px-6 py-3 shadow-sm">
      <div className="flex items-center gap-2">
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
      </div>

      <div className="leading-tight">
        <p className="text-lg font-bold tracking-wide text-white">GECI-VA</p>
        <p className="text-xs text-red-100">
          Gestión del Comando de Incidentes
        </p>
      </div>
    </header>
  );
}
