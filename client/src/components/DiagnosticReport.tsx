import type { Vehicle, Diagnostic } from "../types";
import { MessageSquare } from "lucide-react";
import { useRef, useState } from "react";
import api from "../api/axios";
import {
  createWhatsAppLink,
  formatDiagnosticDeliveryMessage,
} from "../lib/messages";
import { uploadReportSnapshot } from "../lib/reportSnapshot";


interface Props {
  vehicle: Vehicle;
  diagnostic: Diagnostic;
  onClose: () => void;
  onEditClient?: () => void; // Para abrir el modal desde fuera si es necesario
}

// Helper para limpiar el número de teléfono
function cleanPhoneNumber(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d]/g, "").replace(/^0+/, "");
}

export const DiagnosticReport = ({
  vehicle,
  diagnostic,
  onClose,
  onEditClient,
}: Props) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [showPhoneAlert, setShowPhoneAlert] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [currentDiagnostic, setCurrentDiagnostic] =
    useState<Diagnostic>(diagnostic);

  const reportLink = window.location.href;
  const isDelivered =
    currentDiagnostic.isAccepted && !!currentDiagnostic.deliveredAt;
  const deliveredAtText = currentDiagnostic.deliveredAt
    ? new Date(currentDiagnostic.deliveredAt).toLocaleString("es-VE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const handleSendWhatsApp = async () => {
    const phone = cleanPhoneNumber(vehicle.owner.phone);

    if (!phone) {
      if (onEditClient) onEditClient();
      else setShowPhoneAlert(true);
      return;
    }

    const textWithoutAttachment = formatDiagnosticDeliveryMessage(
      vehicle.owner.name,
      reportLink,
      false,
    );

    const whatsappUrl = createWhatsAppLink(phone, textWithoutAttachment);
    window.open(whatsappUrl, "_blank");
  };

  const handleConfirmDelivery = async () => {
    if (isDelivered) return;

    setDeliveryError(null);
    setConfirmingDelivery(true);

    let reportImageUrl: string | undefined;
    if (reportRef.current) {
      try {
        reportImageUrl = await uploadReportSnapshot(
          "report-snapshot",
          currentDiagnostic.id,
        );
      } catch (error) {
        console.error("Error al capturar y subir el reporte:", error);
        setDeliveryError(
          "No se pudo capturar el reporte. Por favor inténtalo de nuevo.",
        );
        setConfirmingDelivery(false);
        return;
      }
    }

    try {
      const { data } = await api.patch<Diagnostic>(
        `/diagnostics/${currentDiagnostic.id}/delivery`,
        { reportImageUrl },
      );
      setCurrentDiagnostic(data);
    } catch (error) {
      console.error(error);
      setDeliveryError(
        "No se pudo confirmar la entrega. Por favor intente nuevamente.",
      );
    } finally {
      setConfirmingDelivery(false);
    }
  };

  const handlePrintReport = () => {
    if (!reportRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const headContent = Array.from(
      document.head.querySelectorAll("link[rel='stylesheet'], style"),
    )
      .map((node) => node.outerHTML)
      .join("");

    printWindow.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Diagnóstico</title>${headContent}</head><body class="bg-white text-slate-900">${reportRef.current.innerHTML}</body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto p-4 md:p-10 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col gap-4 print:hidden">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
          >
            ← VOLVER AL PANEL
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSendWhatsApp}
              title="Enviar por WhatsApp"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs uppercase tracking-widest shadow transition-all"
            >
              <MessageSquare size={16} className="mr-1" />
              WhatsApp
            </button>

            <button
              onClick={handleConfirmDelivery}
              disabled={confirmingDelivery || isDelivered}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                isDelivered
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {isDelivered
                ? "ENTREGA CONFIRMADA"
                : confirmingDelivery
                  ? "CONFIRMANDO..."
                  : "Confirmar Entrega"}
            </button>

            <button
              onClick={handlePrintReport}
              className="bg-nexus-blue hover:bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
            >
              IMPRIMIR REPORTE
            </button>
          </div>
        </div>

        {deliveryError && (
          <div className="p-4 rounded-2xl bg-red-100 text-red-700 text-sm font-bold">
            {deliveryError}
          </div>
        )}

        {showPhoneAlert && (
          <div className="p-4 rounded-2xl bg-red-100 text-red-700 text-sm font-bold flex justify-between items-center">
            El cliente no tiene un número de teléfono registrado. Por favor,
            edítalo para poder enviar el reporte.
            <button
              onClick={() => setShowPhoneAlert(false)}
              className="ml-4 text-red-500 hover:underline"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      <div
        id="report-snapshot"
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white text-slate-900 p-10 md:p-16 rounded-[40px] shadow-2xl print:shadow-none print:rounded-none min-h[-1100px] flex flex-col"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-start border-b-2 border-slate-100 pb-10 mb-10">
          <div className="flex gap-5 items-center">
            <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-black italic text-3xl shadow-lg">
              NX
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic leading-none">
                NEXUS <span className="text-blue-600">CORE</span>
              </h1>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1.5">
                Especialista en Diagnóstico & GNV
              </p>
              <div className="mt-3 text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                Valencia, Edo. Carabobo — Zona Industrial <br />
                Taller Principal | WhatsApp: +58 4XX XXX XXXX
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">
              Certificado Técnico
            </span>
            <p className="text-slate-400 font-mono text-[10px] block">
              REF: {currentDiagnostic.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-slate-900 font-bold text-xs mt-1">
              {new Date(currentDiagnostic.createdAt).toLocaleDateString(
                "es-VE",
                { day: "2-digit", month: "long", year: "numeric" },
              )}
            </p>
            {deliveredAtText && (
              <p className="text-emerald-600 font-bold text-xs mt-2">
                Entrega confirmada: {deliveredAtText}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Propietario
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {vehicle.owner.name}
            </p>
            <p className="text-slate-500 font-medium mt-1">
              {vehicle.owner.phone || "Sin teléfono"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Vehículo
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight">
              {vehicle.brand} {vehicle.model}{" "}
              <span className="text-slate-400">({vehicle.year})</span>
            </p>
            <div className="mt-2 inline-block bg-white border-2 border-slate-900 px-3 py-1 rounded-lg font-mono font-black text-sm tracking-tighter">
              PLACA: {vehicle.plate.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grow">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-slate-200 grow"></div>
            <div className="flex items-center gap-2 text-blue-600">
              <span className="font-black uppercase text-xs tracking-[0.2em]">
                Análisis del Sistema
              </span>
            </div>
            <div className="h-px bg-slate-200 grow"></div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
            {currentDiagnostic.description}
          </h2>

          <div className="flex gap-6 mb-10 flex-wrap">
            {currentDiagnostic.faultCode && (
              <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl w-40 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                  Código DTC
                </p>
                <p className="text-2xl font-mono font-black text-red-600">
                  {currentDiagnostic.faultCode}
                </p>
              </div>
            )}
            {currentDiagnostic.voltageReading && (
              <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl w-40 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                  Voltaje Sistema
                </p>
                <div className="flex items-baseline gap-1">
                  <p className="text-2xl font-mono font-black text-slate-900">
                    {currentDiagnostic.voltageReading}
                  </p>
                  <span className="text-sm font-bold text-slate-400">V</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                Conclusiones del Especialista
              </p>
              <div className="bg-slate-50 p-6 rounded-3xl border-l-8 border-blue-600 text-slate-700 leading-relaxed italic font-medium">
                {currentDiagnostic.technicalNotes ||
                  "El sistema no presenta fallas adicionales registradas durante la evaluación estática y dinámica."}
              </div>
            </div>

            {currentDiagnostic.gnvPressure && (
              <div className="border-2 border-slate-900 rounded[-2rem] overflow-hidden">
                <div className="bg-slate-900 text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest flex justify-between">
                  <span>Protocolo de Revisión GNV</span>
                  <span className="text-blue-400">
                    Certificación de Hermeticidad
                  </span>
                </div>
                <div className="p-8 grid grid-cols-3 gap-8 text-center bg-white">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Presión de Trabajo
                    </p>
                    <p className="text-xl font-black text-slate-900">
                      {currentDiagnostic.gnvPressure} PSI
                    </p>
                  </div>
                  <div className="border-x border-slate-100 px-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Estanqueidad
                    </p>
                    <p
                      className={`text-xl font-black ${currentDiagnostic.gnvLeakTest ? "text-emerald-600" : "text-slate-400"}`}
                    >
                      {currentDiagnostic.gnvLeakTest ? "APROBADA" : "PENDIENTE"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                      Electroválvula
                    </p>
                    <p
                      className={`text-xl font-black ${currentDiagnostic.gnvSolenoid === "FAIL" ? "text-red-600" : "text-slate-900"}`}
                    >
                      {currentDiagnostic.gnvSolenoid || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isDelivered && (
          <div className="mt-14 p-8 rounded[-32px] border border-emerald-200 bg-emerald-50">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-600">
                  Ticket de Salida
                </p>
                <h3 className="text-3xl font-black text-slate-900 mt-3">
                  Entrega Confirmada
                </h3>
              </div>
              <div className="rounded-full bg-emerald-600 text-white px-4 py-2 text-xs uppercase font-black tracking-[0.2em] inline-flex items-center justify-center">
                Confirmado
              </div>
            </div>

            <div className="grid gap-4 mt-8 md:grid-cols-3 text-sm text-slate-700">
              <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-400 mb-2">
                  Cliente
                </p>
                <p className="font-bold text-slate-900">{vehicle.owner.name}</p>
                <p className="text-slate-500">
                  {vehicle.owner.phone || "Sin teléfono"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-400 mb-2">
                  Vehículo
                </p>
                <p className="font-bold text-slate-900">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p className="text-slate-500">{vehicle.plate.toUpperCase()}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm">
                <p className="text-[9px] uppercase tracking-[0.25em] font-black text-slate-400 mb-2">
                  Confirmación
                </p>
                <p className="font-bold text-slate-900">{deliveredAtText}</p>
                <p className="text-slate-500">Recepción validada por cliente</p>
              </div>
            </div>

            <div className="mt-8 text-slate-700 leading-relaxed text-sm bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
              <p className="font-black uppercase tracking-[0.2em] text-slate-900 text-[10px] mb-3">
                Resumen del Ticket
              </p>
              <p>
                El diagnóstico ha sido marcado como entregado. El cliente puede
                revisar el reporte completo y confirmar su recepción desde Nexus
                Core.
              </p>
            </div>
          </div>
        )}

        <div className="mt-16 pt-10 border-t-2 border-slate-100">
          <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-end">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 text-emerald-600 mb-4">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <span className="font-black uppercase text-[10px] tracking-[0.2em]">
                  Diagnóstico Validado
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Este documento certifica que el vehículo ha sido sometido a un
                análisis técnico riguroso mediante equipos de precisión en
                Valencia, Venezuela.
              </p>
            </div>

            <div className="text-center w-full md:w-64">
              <div className="mb-4">
                <div className="h-16 flex items-end justify-center">
                  <p className="text-slate-300 font-serif italic text-3xl opacity-20 select-none">
                    NexusCore
                  </p>
                </div>
                <div className="h[-2px] bg-slate-900 w-full"></div>
              </div>
              <p className="font-black text-sm uppercase text-slate-900 tracking-tight">
                Omar Contreras
              </p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                Consultor Técnico Senior
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
