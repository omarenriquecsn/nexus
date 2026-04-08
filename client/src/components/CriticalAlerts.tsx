import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquare } from "lucide-react";
import api from "../api/axios";
import {
  createWhatsAppLink,
  formatCriticalAlertMessage,
} from "../lib/messages";
import type { CriticalAlert } from "../types";

export const CriticalAlerts = () => {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeliveryId, setPendingDeliveryId] = useState<string | null>(
    null,
  );
  const [hideManaged, setHideManaged] = useState(true);
  const [removingAlertIds, setRemovingAlertIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchCriticalAlerts = async () => {
      try {
        const { data } = await api.get<CriticalAlert[]>(
          "/diagnostics/critical",
        );
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      } catch (error) {
        console.error(error);
        setError("No se pudieron cargar las alertas críticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalAlerts();
  }, []);

  const handleNotifyOwner = (
    phone: string | undefined,
    ownerName: string,
    plate: string,
  ) => {
    if (!phone) return;
    const message = formatCriticalAlertMessage(ownerName, plate);
    const whatsappUrl = createWhatsAppLink(phone, message);
    window.open(whatsappUrl, "_blank");
  };

  const handleMarkDelivered = async (id: string) => {
    setPendingDeliveryId(id);

    try {
      const { data: updatedDiagnostic } = await api.patch<CriticalAlert>(
        `/diagnostics/${id}/deliver`,
      );
      setAlerts((current) =>
        current.map((alert) =>
          alert.id === id
            ? {
                ...alert,
                ...updatedDiagnostic,
                healthStatus: alert.healthStatus,
              }
            : alert,
        ),
      );

      if (hideManaged) {
        setRemovingAlertIds((current) => [...current, id]);
        window.setTimeout(() => {
          setAlerts((current) => current.filter((alert) => alert.id !== id));
          setRemovingAlertIds((current) =>
            current.filter((remId) => remId !== id),
          );
        }, 300);
      }
    } catch (error) {
      console.error(error);
      setError("No se pudo marcar la entrega. Intenta de nuevo.");
    } finally {
      setPendingDeliveryId(null);
    }
  };

  const visibleAlerts = alerts.filter((alert) => {
    const isDelivered = Boolean(alert.deliveredAt);
    if (!hideManaged) return true;
    return !isDelivered || removingAlertIds.includes(alert.id);
  });

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/50 shadow-black/20 shadow-xl overflow-hidden">
      <div className="flex flex-col gap-4 border-l-4 border-red-600 bg-slate-950/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
            Atención Prioritaria
          </p>
          <h3 className="mt-2 text-lg font-black text-white">
            Vehículos en ROJO
          </h3>
        </div>

        <div className="flex flex-col gap-3 sm:items-end sm:flex-row sm:gap-6">
          <label className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300 transition">
            <span>Ocultar Gestionados</span>
            <button
              type="button"
              aria-pressed={hideManaged}
              onClick={() => setHideManaged((value) => !value)}
              className={`relative inline-flex h-6 w-12 flex-shrink:-0 items-center rounded-full transition-all duration-300 ${hideManaged ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${hideManaged ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </label>
          <div className="rounded-2xl bg-red-600/20 p-3 text-red-300 animate-pulse">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {loading && (
          <div className="p-6 text-slate-400">Cargando alertas críticas...</div>
        )}

        {!loading && error && <div className="p-6 text-red-400">{error}</div>}

        {!loading && !error && visibleAlerts.length === 0 && (
          <div className="p-6 text-slate-400">
            No hay alertas críticas pendientes.
          </div>
        )}

        {!loading &&
          !error &&
          visibleAlerts.map((alert) => {
            const ownerPhone = alert.vehicle.owner.phone;
            const isSent = Boolean(alert.deliveredAt);
            const isAccepted = Boolean(alert.isAccepted);
            const isRemoving = removingAlertIds.includes(alert.id);
            const dimmed = isSent || isAccepted;
            const statusLabel = isAccepted
              ? "CONFIRMADO"
              : isSent
                ? "ENVIADA"
                : "CRÍTICO";
            const statusClasses = isAccepted
              ? "bg-sky-600/15 text-sky-200"
              : isSent
                ? "bg-slate-700/15 text-slate-300"
                : "bg-red-500/10 text-red-300";

            return (
              <div
                key={alert.id}
                className={`flex flex-col gap-4 p-5 transition-all duration-300 ${dimmed ? "opacity-50" : "hover:bg-slate-900/70"} ${isRemoving ? "opacity-0 max-h-0 overflow-hidden py-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-mono text-sm ${isAccepted ? "text-sky-200 opacity-70" : isSent ? "text-slate-400 opacity-70" : "text-slate-200"}`}
                    >
                      {alert.vehicle.plate}
                    </p>
                    {isAccepted && <span className="text-sky-400">✅✅</span>}
                    {!isAccepted && isSent && (
                      <span className="text-slate-400">✅</span>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${statusClasses}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-slate-400 text-xs">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                      Placa
                    </p>
                    <p
                      className={`font-mono text-sm ${isSent ? "text-slate-400 opacity-70" : "text-slate-100"}`}
                    >
                      {alert.vehicle.plate}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={!ownerPhone}
                      onClick={() =>
                        handleNotifyOwner(
                          ownerPhone,
                          alert.vehicle.owner.name,
                          alert.vehicle.plate,
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      <MessageSquare size={16} /> WhatsApp
                    </button>
                    {!isSent && (
                      <button
                        type="button"
                        disabled={pendingDeliveryId === alert.id}
                        onClick={() => handleMarkDelivered(alert.id)}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-200 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-950 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                      >
                        {pendingDeliveryId === alert.id
                          ? "Procesando..."
                          : "Confirmar Entrega"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
