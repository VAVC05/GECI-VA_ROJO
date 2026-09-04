"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BotonGenerarPDFProps {
  incidente: any;
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
    const doc = new jsPDF();

    // Encabezado
    try {
      const [logoPc, logoBomberos] = await Promise.all([
        cargarImagenBase64("/logos/pc_metepec.png"),
        cargarImagenBase64("/logos/bomberos.png"),
      ]);
      doc.addImage(logoPc, "PNG", 14, 8, 14, 14);
      doc.addImage(logoBomberos, "PNG", 30, 8, 14, 14);
    } catch {}

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

    // ============================================================
    // SECCIÓN 1: SCI-201 - RESUMEN DEL INCIDENTE
    // ============================================================
    doc.setFontSize(13);
    doc.setTextColor(...ROJO_INSTITUCIONAL);
    doc.text("1. SCI-201 - Resumen del Incidente", 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const infoGeneral = [
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

    const adicionales = [
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

    const todosCampos = [...infoGeneral];
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

    // ============================================================
    // SECCIÓN 2: ORGANIZACIÓN DEL SCI (organigrama)
    // ============================================================
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

      incidente.organizacionSCI.forEach((item: any, idx: number) => {
        const prefix = idx === 0 ? "└──" : "├──";
        doc.text(`${prefix} ${item.rol}: ${item.nombre}`, 14, y);
        y += 5;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });
      y += 4;
    }

    // ============================================================
    // SECCIÓN 3: SCI-202 - PLAN DE ACCIÓN
    // ============================================================
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

      incidente.planesAccion.forEach((plan: any, index: number) => {
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

        const datosPlan = [
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

    // ============================================================
    // SECCIÓN 4: SCI-211 - REGISTRO DE RECURSOS
    // ============================================================
    if (incidente.asignacionesRecurso && incidente.asignacionesRecurso.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("4. SCI-211 - Registro de Recursos", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const tableData = incidente.asignacionesRecurso.map((asignacion: any) => [
        asignacion.recurso?.nombre || "N/A",
        asignacion.recurso?.tipo || "N/A",
        asignacion.tareaAsignada || "Sin tarea",
        asignacion.ubicacionAsignacion || "N/A",
        new Date(asignacion.fechaHoraAsignacion).toLocaleString(),
        asignacion.fechaHoraDesmovilizacion ? new Date(asignacion.fechaHoraDesmovilizacion).toLocaleString() : "Activo",
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
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ============================================================
    // SECCIÓN 5: SCI-207 - REGISTRO DE VÍCTIMAS
    // ============================================================
    if (incidente.victimas && incidente.victimas.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("5. SCI-207 - Registro de Víctimas", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const tableData = incidente.victimas.map((victima: any) => {
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
      y = (doc as any).lastAutoTable.finalY + 8;

      // Resumen de triage
      const triageCount: { [key: string]: number } = {};
      incidente.victimas.forEach((v: any) => {
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

    // ============================================================
    // SECCIÓN 6: PERIODOS OPERACIONALES
    // ============================================================
    if (incidente.periodosOperacionales && incidente.periodosOperacionales.length > 0) {
      if (y > 200) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(13);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("6. Periodos Operacionales", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const periodoData = incidente.periodosOperacionales.map((p: any) => [
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
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Pie de página
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