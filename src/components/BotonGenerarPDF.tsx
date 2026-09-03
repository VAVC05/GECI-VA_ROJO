"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BotonGenerarPDFProps {
  incidente: any;
}

// Rojo institucional GECI-VA (Protección Civil y Bomberos de Metepec)
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

    // --- Encabezado institucional: logos alineados a la izquierda, mismo tamaño ---
    try {
      const [logoPc, logoBomberos] = await Promise.all([
        cargarImagenBase64("/logos/pc_metepec.png"),
        cargarImagenBase64("/logos/bomberos.png"),
      ]);
      doc.addImage(logoPc, "PNG", 14, 8, 14, 14);
      doc.addImage(logoBomberos, "PNG", 30, 8, 14, 14);
    } catch {
      // Si los logos no cargan, el reporte se genera igual sin ellos.
    }

    // --- Título ---
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

    // --- Información general ---
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 45;

    const info = [
      ["Nombre:", incidente.nombre],
      ["Tipo:", incidente.tipo],
      ["Lugar:", incidente.lugar],
      ["Estado:", incidente.estado],
      ["Fecha de inicio:", new Date(incidente.fechaHoraInicio).toLocaleString()],
    ];
    if (incidente.fechaHoraCierre) {
      info.push(["Fecha de cierre:", new Date(incidente.fechaHoraCierre).toLocaleString()]);
    }
    info.push(["Registrado por:", incidente.usuarioRegistro?.nombreCompleto || "N/A"]);
    if (incidente.observacionesCierre) {
      info.push(["Observaciones de cierre:", incidente.observacionesCierre]);
    }

    info.forEach(([label, value]) => {
      doc.text(`${label} ${value}`, 14, y);
      y += 8;
    });

    y += 4;

    // --- Recursos asignados (tabla) ---
    if (incidente.asignacionesRecurso && incidente.asignacionesRecurso.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("Recursos asignados:", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const tableData = incidente.asignacionesRecurso.map((asignacion: any) => [
        asignacion.recurso?.nombre || "N/A",
        asignacion.recurso?.tipo || "N/A",
        asignacion.tareaAsignada || "Sin tarea",
        asignacion.ubicacionAsignacion || "N/A",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Recurso", "Tipo", "Tarea", "Ubicación"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: ROJO_INSTITUCIONAL, textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // --- Víctimas (tabla) ---
    if (incidente.victimas && incidente.victimas.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("Víctimas registradas:", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      const tableData = incidente.victimas.map((victima: any) => {
        const triage = victima.historialTriage?.[0]?.clasificacion || "Sin clasificar";
        const observaciones = victima.notasAdicionales || "N/A";
        return [
          victima.nombrePaciente || "No identificado",
          victima.sexo || "N/A",
          victima.edad || "?",
          triage,
          victima.estadoAtencion || "N/A",
          victima.centroHospitalario || "N/A",
          observaciones,
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
          1: { cellWidth: 20 },
          2: { cellWidth: 15 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 40 },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // --- Resumen de estadísticas (opcional) ---
    if (incidente.victimas && incidente.victimas.length > 0) {
      const triageCount: { [key: string]: number } = {};
      incidente.victimas.forEach((v: any) => {
        const triage = v.historialTriage?.[0]?.clasificacion || "Sin clasificar";
        triageCount[triage] = (triageCount[triage] || 0) + 1;
      });

      doc.setFontSize(12);
      doc.setTextColor(...ROJO_INSTITUCIONAL);
      doc.text("Resumen por clasificación de triage:", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      for (const [key, value] of Object.entries(triageCount)) {
        doc.text(`- ${key}: ${value}`, 16, y);
        y += 6;
      }
    }

    // --- Pie de página ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generado desde GECI-VA el ${new Date().toLocaleString()}`, 14, 285);

    // Guardar PDF
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