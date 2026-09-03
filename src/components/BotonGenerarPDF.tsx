"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface BotonGenerarPDFProps {
  incidente: any;
}

export default function BotonGenerarPDF({ incidente }: BotonGenerarPDFProps) {
  const generarPDF = () => {
    const generarPDFAsync = async () => {
      try {
        const [bomberosBase64, pcBase64] = await Promise.all([
          fetch("/logos/bomberos.png")
            .then((r) => r.blob())
            .then((blob) => new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })),
          fetch("/logos/pc_metepec.png")
            .then((r) => r.blob())
            .then((blob) => new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })),
        ]);

        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");

        const xInicio = 14;
        const yInicio = 10;
        const altoLogo = 16; // Tamaño pequeño y uniforme

        // Logos del mismo tamaño, alineados a la izquierda
        if (bomberosBase64) {
          doc.addImage(bomberosBase64 as string, "PNG", xInicio, yInicio, 20, altoLogo);
        }
        if (pcBase64) {
          doc.addImage(pcBase64 as string, "PNG", xInicio + 28, yInicio, 20, altoLogo);
        }

        // Línea vertical separadora (opcional, pero no necesaria en PDF)
        // doc.line(xInicio + 24, yInicio, xInicio + 24, yInicio + altoLogo);

        doc.setFontSize(16);
        doc.setTextColor(0, 51, 102);
        doc.text(`Reporte - ${incidente.folio}`, xInicio, yInicio + altoLogo + 8);

        // Resto del contenido...
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        let y = yInicio + altoLogo + 16;
        const lineHeight = 7;

        doc.text(`Nombre: ${incidente.nombre}`, xInicio, y);
        y += lineHeight;
        doc.text(`Tipo: ${incidente.tipo}`, xInicio, y);
        y += lineHeight;
        doc.text(`Lugar: ${incidente.lugar}`, xInicio, y);
        y += lineHeight;
        doc.text(`Estado: ${incidente.estado}`, xInicio, y);
        y += lineHeight;
        doc.text(`Fecha de inicio: ${new Date(incidente.fechaHoraInicio).toLocaleString()}`, xInicio, y);
        y += lineHeight;
        if (incidente.fechaHoraCierre) {
          doc.text(`Fecha de cierre: ${new Date(incidente.fechaHoraCierre).toLocaleString()}`, xInicio, y);
          y += lineHeight;
        }
        doc.text(`Registrado por: ${incidente.usuarioRegistro?.nombreCompleto || "N/A"}`, xInicio, y);
        y += lineHeight;

        if (incidente.observacionesCierre) {
          doc.text(`Observaciones de cierre: ${incidente.observacionesCierre}`, xInicio, y);
          y += lineHeight;
        }

        // Recursos
        if (incidente.asignacionesRecurso && incidente.asignacionesRecurso.length > 0) {
          y += 4;
          doc.setFontSize(12);
          doc.setTextColor(0, 51, 102);
          doc.text("Recursos asignados:", xInicio, y);
          y += 6;
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);

          const recursosData = incidente.asignacionesRecurso.map((asignacion: any) => [
            asignacion.recurso?.nombre || "Sin nombre",
            asignacion.recurso?.tipo || "N/A",
            asignacion.tareaAsignada || "Sin tarea",
            asignacion.ubicacionAsignacion || "N/A",
          ]);

          autoTable(doc, {
            startY: y + 2,
            head: [["Nombre", "Tipo", "Tarea", "Ubicación"]],
            body: recursosData,
            theme: "striped",
            headStyles: { fillColor: [0, 51, 102] },
            styles: { fontSize: 7 },
            margin: { left: 14, right: 14 },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }

        // Víctimas
        if (incidente.victimas && incidente.victimas.length > 0) {
          if (y > 240) {
            doc.addPage();
            y = 20;
          }
          doc.setFontSize(12);
          doc.setTextColor(0, 51, 102);
          doc.text("Víctimas registradas:", xInicio, y);
          y += 6;
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);

          const victimasData = incidente.victimas.map((victima: any) => {
            const ultimoTriage = victima.historialTriage?.[0]?.clasificacion || "Sin clasificar";
            const hospital = victima.centroHospitalario || "N/A";
            const notas = victima.notasAdicionales || "—";
            return [
              victima.nombrePaciente || "No identificado",
              victima.sexo || "N/A",
              victima.edad || "?",
              ultimoTriage,
              victima.estadoAtencion || "EN_ESPERA",
              hospital,
              notas,
            ];
          });

          autoTable(doc, {
            startY: y + 2,
            head: [["Nombre", "Sexo", "Edad", "Triage", "Estado", "Hospital", "Observaciones"]],
            body: victimasData,
            theme: "striped",
            headStyles: { fillColor: [0, 51, 102] },
            styles: { fontSize: 6.5 },
            columnStyles: {
              0: { cellWidth: 28 },
              1: { cellWidth: 18 },
              2: { cellWidth: 14 },
              3: { cellWidth: 24 },
              4: { cellWidth: 24 },
              5: { cellWidth: 32 },
              6: { cellWidth: 38 },
            },
            margin: { left: 14, right: 14 },
          });
          y = (doc as any).lastAutoTable.finalY + 8;
        }

        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generado desde GECI-VA el ${new Date().toLocaleString()}`, xInicio, 285);

        doc.save(`incidente_${incidente.folio}.pdf`);
      } catch (error) {
        console.error("Error al generar PDF:", error);
        alert("Error al generar el PDF. Revisa que los logos estén en la carpeta public/logos/");
      }
    };

    generarPDFAsync();
  };

  return (
    <button
      onClick={generarPDF}
      className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
    >
      Generar PDF
    </button>
  );
}