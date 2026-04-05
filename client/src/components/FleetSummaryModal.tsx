import { useEffect, useState } from "react";
import { AlertTriangle, CircleDot, MessageSquare, X } from "lucide-react";
import api from "../api/axios";
import {
  createWhatsAppLink,
  formatFleetSummaryWhatsAppMessage,
} from "../lib/messages";
import type { FleetSummaryData, FleetSummaryModalProps } from "../types";

export const FleetSummaryModal = ({
  ownerId,
  clientName,
  clientPhone,
  panelUrl,
  onClose,
}: FleetSummaryModalProps) => {
  const [summary, setSummary] = useState<FleetSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<FleetSummaryData>(
          `/fleet/${ownerId}/summary`,
        );
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el resumen de flota.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [ownerId]);

  const handleSendWhatsApp = () => {
    if (!summary || !clientPhone) return;
    const message = formatFleetSummaryWhatsAppMessage({
      clientName,
      totalVehicles: summary.totalVehicles,
      totalCritical: summary.counts.RED,
      totalPreventive: summary.counts.YELLOW,
      totalOperational: summary.counts.GREEN,
      panelUrl,
    });
    window.open(createWhatsAppLink(clientPhone, message), "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded[-2rem] border border-slate-700 bg-slate-950/95 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
              Reporte Maestro de Flota
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {clientName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900/90 p-3 text-slate-400 transition hover:border-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading && <div className="text-slate-400">Cargando resumen...</div>}
          {error && <div className="text-red-400">{error}</div>}

          {summary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded[-2rem] border border-red-600/20 bg-red-500/10 p-6 text-white shadow-xl shadow-red-500/10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-200">
                    Críticos
                  </p>
                  <p className="mt-4 text-5xl font-black text-red-400">
                    {summary.counts.RED}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Vehículos con última falla crítica
                  </p>
                </div>
                <div className="rounded[-2rem] border border-yellow-500/20 bg-yellow-500/10 p-6 text-white shadow-xl shadow-yellow-500/10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-200">
                    Preventivos
                  </p>
                  <p className="mt-4 text-5xl font-black text-yellow-300">
                    {summary.counts.YELLOW}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Vehículos con seguimiento pendiente
                  </p>
                </div>
                <div className="rounded[-2rem] border border-emerald-500/20 bg-emerald-500/10 p-6 text-white shadow-xl shadow-emerald-500/10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-200">
                    Operativos
                  </p>
                  <p className="mt-4 text-5xl font-black text-emerald-300">
                    {summary.counts.GREEN}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Vehículos con última revisión OK
                  </p>
                </div>
              </div>

              <div className="rounded[-2rem] border border-slate-700 bg-slate-900/80 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <AlertTriangle className="text-red-400" size={22} />
                  <h3 className="text-xl font-black text-white">
                    Placas Críticas
                  </h3>
                </div>
                {summary.groups.RED.length === 0 ? (
                  <p className="text-slate-400">
                    No hay vehículos críticos en este momento.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {summary.groups.RED.map((item) => (
                      <div
                        key={item.plate}
                        className="rounded-3xl border border-red-600/20 bg-slate-950/80 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-sm uppercase tracking-[0.2em] text-slate-500">
                              Placa
                            </p>
                            <p className="text-lg font-black text-white">
                              {item.plate}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-600/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-red-300">
                            <CircleDot size={12} /> Crítico
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-400">
                          {item.issue}
                        </p>
                        {item.lastFailure && (
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                            Última falla:{" "}
                            {new Date(item.lastFailure).toLocaleString(
                              "es-ES",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-300 transition hover:bg-slate-800 sm:w-auto"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!clientPhone}
                  className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <MessageSquare size={16} /> Enviar WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
