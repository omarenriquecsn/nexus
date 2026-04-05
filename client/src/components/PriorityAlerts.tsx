import { useEffect, useState } from "react";
import { AlertTriangle, MessageSquare } from "lucide-react";
import api from "../api/axios";
import { createWhatsAppLink, formatPriorityAlertMessage } from "../lib/messages";
import type { PriorityAlert } from "../types";


export const PriorityAlerts = () => {
  const [alerts, setAlerts] = useState<PriorityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriorityAlerts = async () => {
      try {
        const { data } = await api.get<PriorityAlert[]>("/diagnostics/priority");
        setAlerts(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las alertas críticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityAlerts();
  }, []);

  const handleNotifyOwner = (ownerPhone: string | undefined, ownerName: string, vehiclePlate: string) => {
    if (!ownerPhone) return;
    const message = formatPriorityAlertMessage(ownerName, vehiclePlate);
    const whatsappUrl = createWhatsAppLink(ownerPhone, message);
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/50 shadow-black/20 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between border-l-4 border-red-600 bg-slate-950/40 px-5 py-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
            Radar de Alertas
          </p>
          <h3 className="mt-2 text-lg font-black text-white">Últimos 5 críticos</h3>
        </div>
        <div className="rounded-2xl bg-red-600/20 p-3 text-red-300 animate-pulse">
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {loading && (
          <div className="p-6 text-slate-400">Cargando alertas...</div>
        )}

        {!loading && error && (
          <div className="p-6 text-red-400">{error}</div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <div className="p-6 text-slate-400">No hay diagnósticos críticos recientes.</div>
        )}

        {!loading && !error && alerts.map((alert) => {
          const ownerPhone = alert.vehicle.owner.phone;
          return (
            <div key={alert.id} className="flex flex-col gap-3 p-5 hover:bg-slate-900/70 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-red-300 font-black uppercase text-[10px] tracking-[0.35em]">
                    <AlertTriangle size={14} /> CRÍTICO
                  </div>
                  <p className="mt-3 text-sm text-slate-200 font-semibold">{alert.vehicle.plate} · {alert.vehicle.brand} {alert.vehicle.model}</p>
                </div>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-red-300">
                  RED
                </span>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">{alert.description}</p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-slate-400 text-xs">
                  <p>{alert.vehicle.owner.name}</p>
                  <p>{ownerPhone ? ownerPhone : 'Teléfono no disponible'}</p>
                </div>
                <button
                  type="button"
                  disabled={!ownerPhone}
                  onClick={() => handleNotifyOwner(ownerPhone, alert.vehicle.owner.name, alert.vehicle.plate)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  <MessageSquare size={16} /> WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
