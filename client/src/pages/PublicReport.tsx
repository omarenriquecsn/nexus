import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Wrench, AlertCircle, Zap, Loader2 } from "lucide-react";
import api from "../api/axios";
import type { PublicDiagnostic } from "../types";

const getHealthStatus = (diagnostic: PublicDiagnostic) => {
  if (diagnostic.faultCode || (diagnostic.voltageReading ?? 0) < 12.5) {
    return { label: "Rojo", color: "red", tone: "text-red-600", badge: "bg-red-100 text-red-700", bg: "bg-red-50" };
  }
  if (!diagnostic.faultCode && !diagnostic.voltageReading) {
    return { label: "Amarillo", color: "yellow", tone: "text-amber-600", badge: "bg-amber-100 text-amber-700", bg: "bg-yellow-50" };
  }
  return { label: "Verde", color: "green", tone: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", bg: "bg-green-50" };
};

export const PublicReport = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<PublicDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PublicDiagnostic>(`/diagnostics/${id}/public`);
        setReport(data);
        setConfirmed(Boolean(data.isAccepted));
      } catch (err) {
        console.error(err);
        setError("No se encontró el reporte.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleConfirmReport = async () => {
    if (!id || !report) return;
    setConfirming(true);

    try {
      await api.patch(`/diagnostics/${id}/confirm-client`);
      setConfirmed(true);
      setReport((current) => current ? { ...current, isAccepted: true } : current);
    } catch (err) {
      console.error(err);
      setError("No se pudo confirmar la recepción. Intenta nuevamente.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 text-center">
          <p className="text-slate-500">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 text-center">
          <p className="text-red-600 font-bold">{error ?? "Reporte no disponible."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex w-full justify-center rounded-3xl bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-slate-800"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const status = getHealthStatus(report);
  const isConfirmed = Boolean(report.isAccepted || confirmed);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className={`rounded-4xl border border-slate-200 ${status.bg} p-6 shadow-xl shadow-slate-200/50`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Nexus Core
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                Reporte de diagnóstico
              </p>
            </div>
            <div className="rounded-3xl bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
              {report.vehicle.plate}
            </div>
          </div>

          <div className="mt-6 rounded-4xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Salud del vehículo</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className={`inline-flex h-16 w-16 items-center justify-center rounded-full ${status.color === "red" ? "bg-red-100 text-red-600" : status.color === "yellow" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"} text-3xl font-black`}>
                {status.label.charAt(0)}
              </span>
              <div className="text-left">
                <p className={`text-2xl font-black ${status.tone}`}>{status.label}</p>
                <p className="mt-1 text-sm text-slate-500">Estado actual del diagnóstico</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Técnico encontrado</p>
                  <p className="mt-2 text-base font-black text-slate-900">{report.description || "Sin observaciones técnicas"}</p>
                </div>
                <Wrench className="text-slate-600" size={24} />
              </div>
            </div>

            {report.faultCode && (
              <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-red-500">Código de falla</p>
                    <p className="mt-2 text-sm font-black text-red-700">{report.faultCode}</p>
                  </div>
                </div>
              </div>
            )}

            {report.voltageReading !== undefined && report.voltageReading !== null && (
              <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5">
                <div className="flex items-center gap-3">
                  <Zap className="text-amber-600" size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-500">Voltaje</p>
                    <p className="mt-2 text-sm font-black text-amber-700">{report.voltageReading.toFixed(1)} V</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-100 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Vehículo</p>
              <p className="mt-2 text-base font-black text-slate-900">
                {report.vehicle.brand} {report.vehicle.model}
              </p>
              <p className="mt-1 text-sm text-slate-500">Año {report.vehicle.year}</p>
            </div>
          </div>

          {isConfirmed ? (
            <div className="mt-7 rounded-4xl bg-emerald-600 px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-emerald-300/20 text-center">
              ¡Gracias! Su confirmación ha sido enviada a Valencia Precision. Ya estamos trabajando en su vehículo.
            </div>
          ) : (
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirmReport}
              className="mt-7 w-full rounded-4xl bg-sky-600 px-6 py-4 text-base font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-sky-300/20 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {confirming ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Confirmando...
                </>
              ) : (
                "✅ Confirmar Recepción y Lectura"
              )}
            </button>
          )}
        </div>

        <Link
          to="/"
          className="block rounded-4xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-900 shadow-sm transition hover:bg-slate-50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};
