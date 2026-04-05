import { useEffect, useMemo, useState } from "react";
import { MessageSquare, AlertTriangle, CheckCircle, Users, Clock, Send, CheckCheck } from "lucide-react";
import type { ClientFleetData, Props } from "../types";
import { createWhatsAppLink } from "../lib/messages";
import api from "../api/axios";
import { FleetSummaryModal } from "./FleetSummaryModal";


function getHealthColor(diagnostic?: {
  faultCode?: string;
}): "red" | "yellow" | "green" {
  if (!diagnostic) return "yellow";
  if (diagnostic.faultCode) return "red";
  return "green";
}

function getCommunicationStatus(diagnostic?: {
  deliveredAt?: string | null;
  isAccepted?: boolean;
  acceptedAt?: string | null;
}) {
  if (!diagnostic) return null;
  if (diagnostic.isAccepted) {
    return {
      icon: <CheckCheck className="text-blue-500" size={14} />,
      label: "Aceptado",
      tooltip: `Confirmado por el cliente el ${new Date(diagnostic.acceptedAt!).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      color: "text-blue-500"
    };
  }
  if (diagnostic.deliveredAt) {
    return {
      icon: <Send className="text-orange-500" size={14} />,
      label: "Enviado",
      tooltip: `Enviado el ${new Date(diagnostic.deliveredAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      color: "text-orange-500"
    };
  }
  return {
    icon: <Clock className="text-slate-500" size={14} />,
    label: "Pendiente",
    tooltip: "Aún no enviado al cliente",
    color: "text-slate-500"
  };
}

export const ClientFleetView = ({ clientId, onSelectVehicle }: Props) => {
  const [data, setData] = useState<ClientFleetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const fleetHealth = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        red: 0,
        yellow: 0,
        green: 0,
        redDetails: [] as Array<{ plate: string; issue: string }>,
      };
    }

    const summary = {
      total: data.vehicles.length,
      red: 0,
      yellow: 0,
      green: 0,
      redDetails: [] as Array<{ plate: string; issue: string }>,
    };

    data.vehicles.forEach((vehicle) => {
      const lastDiag = vehicle.diagnostics[0];
      const health = getHealthColor(lastDiag);

      if (health === "red") {
        summary.red += 1;
        summary.redDetails.push({
          plate: vehicle.plate,
          issue:
            lastDiag?.faultCode ??
            lastDiag?.description ??
            "Falla principal no disponible",
        });
      } else if (health === "green") {
        summary.green += 1;
      } else {
        summary.yellow += 1;
      }
    });

    return summary;
  }, [data]);

  useEffect(() => {
    const fetchFleet = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/clients/${clientId}/vehicles`);
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, [clientId]);

  if (loading) return <div className="p-8 text-center">Cargando flota...</div>;

  if (!data)
    return (
      <div className="p-8 text-center text-red-500">
        No se encontró el cliente.
      </div>
    );

  const phone = data.phone;
  const whatsappUrl = phone ? createWhatsAppLink(phone, "") : undefined;

  const openSummaryModal = () => {
    setShowReportModal(true);
  };

  const closeSummaryModal = () => {
    setShowReportModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in slide-in-from-right duration-300">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-orange-600 mb-1">
            {data.name}
          </h2>
          <div className="flex items-center gap-4 text-slate-600 font-bold">
            {data.phone && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow"
              >
                <MessageSquare size={16} /> WhatsApp
              </a>
            )}
            {data.email && (
              <span className="bg-slate-100 px-3 py-1 rounded-xl text-xs">
                {data.email}
              </span>
            )}
          </div>
        </div>
        {/* Botón de retorno */}
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow transition-all"
          onClick={() => onSelectVehicle(null)}
        >
          Volver al Diagnóstico
        </button>
      </div>

      {/* Métricas de Flota */}
      <div className="flex flex-wrap gap-4 mb-10 items-center">
        <div className="flex-1 min-w-[-160px] bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-slate-100">
          <Users className="text-orange-500 shadow-lg" size={28} />
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Total Flota</div>
            <div className="text-2xl font-black text-orange-500">{fleetHealth.total}</div>
          </div>
        </div>
        <div className="flex-1 min-w-[-160px] bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-slate-100">
          <AlertTriangle className="text-red-500 shadow-lg" size={28} />
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Estado Crítico</div>
            <div className="text-2xl font-black text-red-500">{fleetHealth.red}</div>
          </div>
        </div>
        <div className="flex-1 min-w-[-160px] bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg border border-slate-100">
          <CheckCircle className="text-emerald-500 shadow-lg" size={28} />
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Mantenimiento Al Día</div>
            <div className="text-2xl font-black text-emerald-500">{fleetHealth.green}</div>
          </div>
        </div>
        <button
          className="ml-auto bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-3xl font-black uppercase tracking-widest shadow-2xl shadow-red-500/20 transition-all"
          onClick={openSummaryModal}
        >
          Generar Reporte Maestro
        </button>
        <button
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg border border-slate-700 transition-all"
          onClick={() => window.print()}
        >
          Exportar Informe de Flota
        </button>
      </div>
      {showReportModal && (
        <FleetSummaryModal
          ownerId={data.id}
          clientName={data.name}
          clientPhone={data.phone ?? ''}
          panelUrl={window.location.href}
          onClose={closeSummaryModal}
        />
      )}

      {/* Grid de vehículos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {data.vehicles.map((vehicle) => {
          const lastDiag = vehicle.diagnostics[0];
          const health = getHealthColor(lastDiag);
          return (
            <button
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className="rounded-3xl shadow-orange-500/5 shadow-lg bg-white p-6 flex flex-col gap-2 border-2 border-slate-100 hover:border-orange-400 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-lg tracking-widest">
                  {vehicle.plate}
                </span>
                <span
                  className={`w-4 h-4 rounded-full ${health === "red" ? "bg-red-500" : health === "yellow" ? "bg-yellow-400" : "bg-emerald-500"} border-2 border-slate-300`}
                  title={
                    health === "red"
                      ? "Crítico"
                      : health === "yellow"
                        ? "Sin diagnóstico"
                        : "OK"
                  }
                ></span>
              </div>
              <div className="font-bold text-slate-700 uppercase text-sm mb-1">
                {vehicle.brand} {vehicle.model}
              </div>
              <div className="text-slate-400 text-xs">Año: {vehicle.year}</div>
              {lastDiag && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Última Gestión:</span>
                  {(() => {
                    const status = getCommunicationStatus(lastDiag);
                    return status ? (
                      <div className={`flex items-center gap-1 ${status.color} text-xs`} title={status.tooltip}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Sin diagnóstico</span>
                    );
                  })()}
                </div>
              )}
              {lastDiag && (
                <div className="mt-2 text-xs text-slate-500 italic">
                  {lastDiag.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
