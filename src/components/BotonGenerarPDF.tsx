"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Tipos para el incidente y sus relaciones
interface OrganizacionSCI {
    rol: string;
    nombre: string;
}

interface PlanComunicaciones {
    sistema?: string;
    canales?: string;
    equipos?: string;
}

interface PlanMedico {
    instalaciones?: string;
    hospitales?: string;
    personal?: string;
}

interface RecursoAsignado {
    recurso?: { nombre: string; tipo: string };
    tareaAsignada?: string | null;
    ubicacionAsignacion?: string | null;
    fechaHoraAsignacion: string;
    fechaHoraDesmovilizacion?: string | null;
}

interface HistorialTriageItem {
    clasificacion: string;
    fechaHoraClasificacion?: string;
}

interface Victima {
    nombrePaciente?: string | null;
    sexo?: string | null;
    edad?: number | null;
    estadoAtencion?: string;
    centroHospitalario?: string | null;
    notasAdicionales?: string | null;
    historialTriage?: HistorialTriageItem[];
}

interface PeriodoOperacional {
    numeroPeriodo: number;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    observaciones?: string | null;
}

interface PlanAccion {
    objetivosOperacionales: string;
    estrategias?: string | null;
    tacticas?: string | null;
    recursosEnLugar?: string | null;
    recursosPorSolicitar?: string | null;
    mensajeSeguridad?: string | null;
    nombreJefePlanificacion?: string | null;
    fechaHoraPreparacion: string;
    periodo?: { numeroPeriodo: number };
}

interface IncidentePDF {
    folio: string;
    nombre: string;
    tipo: string;
    lugar: string;
    estado: string;
    fechaHoraInicio: string;
    fechaHoraCierre?: string | null;
    amenazasPresentes?: string | null;
    areasAfectadas?: string | null;
    objetivoInicial?: string | null;
    ubicacionPc?: string | null;
    ubicacionAe?: string | null;
    rutaIngreso?: string | null;
    rutaEgreso?: string | null;
    mensajeSeguridad?: string | null;
    canalesComunicacion?: string | null;
    observacionesCierre?: string | null;
    usuarioRegistro?: { nombreCompleto: string } | null;
    organizacionSCI?: OrganizacionSCI[];
    planComunicaciones?: PlanComunicaciones;
    planMedico?: PlanMedico;
    planesAccion?: PlanAccion[];
    asignacionesRecurso?: RecursoAsignado[];
    victimas?: Victima[];
    periodosOperacionales?: PeriodoOperacional[];
}

interface BotonGenerarPDFProps {
    incidente: IncidentePDF;
}

// Extensión  jsPDF 
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable?: { finalY: number };
}

const ROJO_INSTITUCIONAL: [number, number, number] = [179, 0, 0];

async function cargarImagenBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export default function BotonGenerarPDF({ incidente }: BotonGenerarPDFProps) {
    const generarPDF = async () => {
        const doc = new jsPDF() as jsPDFWithAutoTable;

        try {
            const [logoPc, logoBomberos] = await Promise.all([
                cargarImagenBase64("/logos/pc_metepec.png"),
                cargarImagenBase64("/logos/bomberos.png"),
            ]);
            doc.addImage(logoPc, "PNG", 14, 8, 14, 14);
            doc.addImage(logoBomberos, "PNG", 30, 8, 14, 14);
        } catch {
            
        }

        doc.setFontSize(16);
        doc.setTextColor(...ROJO_INSTITUCIONAL);
        doc.text("GECI-VA", 48, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Coordinación de Protección Civil y Bomberos de Metepec", 48, 20);

        doc.setDrawColor(200);
        doc.line(14, 26, 196, 26);

        doc.setFontSize(14);
        doc.setTextColor(...ROJO_INSTITUCIONAL);
        doc.text(`Reporte de Incidente - ${incidente.folio}`, 14, 35);

        let y = 45;
        const lineHeight = 7;

        // Resumen del incidente
        doc.setFontSize(13);
        doc.setTextColor(...ROJO_INSTITUCIONAL);
        doc.text("1. SCI-201 - Resumen del Incidente", 14, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const infoGeneral: [string, string][] = [
            ["Folio:", incidente.folio],
            ["Nombre:", incidente.nombre],
            ["Tipo:", incidente.tipo],
            ["Lugar:", incidente.lugar],
            ["Estado:", incidente.estado],
            ["Fecha de inicio:", new Date(incidente.fechaHoraInicio).toLocaleString()],
        ];
        if (incidente.fechaHoraCierre) {
            infoGeneral.push(["Fecha de cierre:", new Date(incidente.fechaHoraCierre).toLocaleString()]);
        }
        infoGeneral.push(["Registrado por:", incidente.usuarioRegistro?.nombreCompleto || "N/A"]);

        const adicionales: [string, string | null | undefined][] = [
            ["Amenazas presentes:", incidente.amenazasPresentes],
            ["Áreas afectadas:", incidente.areasAfectadas],
            ["Objetivo inicial:", incidente.objetivoInicial],
            ["Ubicación Puesto de Comando:", incidente.ubicacionPc],
            ["Ubicación Área de Espera:", incidente.ubicacionAe],
            ["Ruta de ingreso:", incidente.rutaIngreso],
            ["Ruta de egreso:", incidente.rutaEgreso],
            ["Mensaje de seguridad:", incidente.mensajeSeguridad],
            ["Canales de comunicación:", incidente.canalesComunicacion],
        ];

        const todosCampos: [string, string][] = [...infoGeneral];
        adicionales.forEach(([label, value]) => {
            if (value) todosCampos.push([label, value]);
        });
        if (incidente.observacionesCierre) {
            todosCampos.push(["Observaciones de cierre:", incidente.observacionesCierre]);
        }

        todosCampos.forEach(([label, value]) => {
            doc.text(`${label} ${value}`, 14, y);
            y += lineHeight;
            if (y > 270) {
                doc.addPage();
                y = 20;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
            }
        });

        //  Organización del SCI
        if (incidente.organizacionSCI && incidente.organizacionSCI.length > 0) {
            if (y > 240) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("2. Organización de la Emergencia (SCI)", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            incidente.organizacionSCI.forEach((item, idx) => {
                const prefix = idx === 0 ? "+--" : "|--";
                doc.text(`${prefix} ${item.rol}: ${item.nombre}`, 14, y);
                y += 5;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
            y += 4;
        }

        //  Plan de Acción
        if (incidente.planesAccion && incidente.planesAccion.length > 0) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("3. SCI-202 - Plan de Acción", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            incidente.planesAccion.forEach((plan, index) => {
                if (y > 240) {
                    doc.addPage();
                    y = 20;
                    doc.setFontSize(13);
                    doc.setTextColor(...ROJO_INSTITUCIONAL);
                    doc.text("Plan de Acción (continuación)", 14, y);
                    y += 6;
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                }

                const periodoNum = plan.periodo?.numeroPeriodo || "N/A";
                doc.setFontSize(11);
                doc.setTextColor(0, 0, 0);
                doc.text(`Plan ${index + 1} - Periodo ${periodoNum}`, 14, y);
                y += 5;

                const datosPlan: [string, string][] = [
                    ["Objetivos:", plan.objetivosOperacionales],
                    ["Estrategias:", plan.estrategias || "—"],
                    ["Tácticas:", plan.tacticas || "—"],
                    ["Recursos en lugar:", plan.recursosEnLugar || "—"],
                    ["Recursos por solicitar:", plan.recursosPorSolicitar || "—"],
                    ["Mensaje de seguridad:", plan.mensajeSeguridad || "—"],
                    ["Jefe de Planificación:", plan.nombreJefePlanificacion || "—"],
                    ["Preparado:", new Date(plan.fechaHoraPreparacion).toLocaleString()],
                ];
                datosPlan.forEach(([label, value]) => {
                    doc.text(`${label} ${value}`, 16, y);
                    y += 5;
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                        doc.setFontSize(10);
                        doc.setTextColor(0, 0, 0);
                    }
                });
                y += 2;
            });
        }

        // Plan de Comunicaciones
        if (
            incidente.planComunicaciones &&
            (incidente.planComunicaciones.sistema ||
                incidente.planComunicaciones.canales ||
                incidente.planComunicaciones.equipos)
        ) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("4. SCI-205 - Plan de Comunicaciones", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const datosCom: [string, string][] = [
                ["Sistema/Equipo:", incidente.planComunicaciones.sistema || "—"],
                ["Canales/Frecuencias:", incidente.planComunicaciones.canales || "—"],
                ["Equipos disponibles:", incidente.planComunicaciones.equipos || "—"],
            ];
            datosCom.forEach(([label, value]) => {
                doc.text(`${label} ${value}`, 14, y);
                y += 5;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
            y += 4;
        }

        // Plan Médico
        if (
            incidente.planMedico &&
            (incidente.planMedico.instalaciones ||
                incidente.planMedico.hospitales ||
                incidente.planMedico.personal)
        ) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("5. SCI-206 - Plan Médico", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const datosMed: [string, string][] = [
                ["Instalaciones médicas:", incidente.planMedico.instalaciones || "—"],
                ["Hospitales de derivación:", incidente.planMedico.hospitales || "—"],
                ["Personal médico:", incidente.planMedico.personal || "—"],
            ];
            datosMed.forEach(([label, value]) => {
                doc.text(`${label} ${value}`, 14, y);
                y += 5;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });
            y += 4;
        }

        // Registro de Recursos
        if (incidente.asignacionesRecurso && incidente.asignacionesRecurso.length > 0) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("6. SCI-211 - Registro de Recursos", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const tableData = incidente.asignacionesRecurso.map((asignacion) => [
                asignacion.recurso?.nombre || "N/A",
                asignacion.recurso?.tipo || "N/A",
                asignacion.tareaAsignada || "Sin tarea",
                asignacion.ubicacionAsignacion || "N/A",
                new Date(asignacion.fechaHoraAsignacion).toLocaleString(),
                asignacion.fechaHoraDesmovilizacion
                    ? new Date(asignacion.fechaHoraDesmovilizacion).toLocaleString()
                    : "Activo",
            ]);

            autoTable(doc, {
                startY: y,
                head: [["Recurso", "Tipo", "Tarea", "Ubicación", "Asignado", "Desmovilizado"]],
                body: tableData,
                theme: "striped",
                headStyles: { fillColor: ROJO_INSTITUCIONAL, textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 7 },
                margin: { left: 14, right: 14 },
                styles: { cellPadding: 1.5 },
            });
            y = (doc.lastAutoTable?.finalY ?? y) + 8;
        }

        // Registro de Víctimas
        if (incidente.victimas && incidente.victimas.length > 0) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("7. SCI-207 - Registro de Víctimas", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const tableData = incidente.victimas.map((victima) => {
                const triage = victima.historialTriage?.[0]?.clasificacion || "Sin clasificar";
                return [
                    victima.nombrePaciente || "No identificado",
                    victima.sexo || "N/A",
                    victima.edad || "?",
                    triage,
                    victima.estadoAtencion || "N/A",
                    victima.centroHospitalario || "N/A",
                    victima.notasAdicionales || "N/A",
                ];
            });

            autoTable(doc, {
                startY: y,
                head: [["Nombre", "Sexo", "Edad", "Triage", "Estado", "Hospital", "Observaciones"]],
                body: tableData,
                theme: "striped",
                headStyles: { fillColor: ROJO_INSTITUCIONAL, textColor: 255, fontSize: 7 },
                bodyStyles: { fontSize: 7 },
                margin: { left: 14, right: 14 },
                styles: { cellPadding: 1.5 },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 18 },
                    2: { cellWidth: 14 },
                    3: { cellWidth: 24 },
                    4: { cellWidth: 24 },
                    5: { cellWidth: 30 },
                    6: { cellWidth: 40 },
                },
            });
            y = (doc.lastAutoTable?.finalY ?? y) + 8;

            const triageCount: { [key: string]: number } = {};
            incidente.victimas.forEach((v) => {
                const triage = v.historialTriage?.[0]?.clasificacion || "Sin clasificar";
                triageCount[triage] = (triageCount[triage] || 0) + 1;
            });

            doc.setFontSize(11);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("Resumen por clasificación de triage:", 14, y);
            y += 5;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            for (const [key, value] of Object.entries(triageCount)) {
                doc.text(`- ${key}: ${value}`, 16, y);
                y += 5;
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            }
        }

        //  Periodos Operacionales
        if (incidente.periodosOperacionales && incidente.periodosOperacionales.length > 0) {
            if (y > 200) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(13);
            doc.setTextColor(...ROJO_INSTITUCIONAL);
            doc.text("8. Periodos Operacionales", 14, y);
            y += 6;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            const periodoData = incidente.periodosOperacionales.map((p) => [
                `Periodo ${p.numeroPeriodo}`,
                new Date(p.fechaHoraInicio).toLocaleString(),
                new Date(p.fechaHoraFin).toLocaleString(),
                p.observaciones || "—",
            ]);

            autoTable(doc, {
                startY: y,
                head: [["Periodo", "Inicio", "Fin", "Observaciones"]],
                body: periodoData,
                theme: "striped",
                headStyles: { fillColor: ROJO_INSTITUCIONAL, textColor: 255, fontSize: 8 },
                bodyStyles: { fontSize: 8 },
                margin: { left: 14, right: 14 },
            });
            y = (doc.lastAutoTable?.finalY ?? y) + 8;
        }

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado desde GECI-VA el ${new Date().toLocaleString()}`, 14, 285);

        doc.save(`incidente_${incidente.folio}.pdf`);
    };

    return (
        <button
            onClick={generarPDF}
            className="rounded bg-carbon px-4 py-2 text-sm font-medium text-white hover:bg-carbon-oscuro"
        >
            Generar PDF
        </button>
    );
}