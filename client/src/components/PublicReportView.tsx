import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Zap } from "lucide-react";
import api from "../api/axios";
import type { PublicDiagnostic } from "../types";

const getHealthStatus = (diagnostic: PublicDiagnostic) => {
  if (diagnostic.faultCode || (diagnostic.voltageReading ?? 0) < 12.5) {
    return { label: "Rojo", color: "red" };
  }
  if (!diagnostic.faultCode && !diagnostic.voltageReading) {
    return { label: "Amarillo", color: "yellow" };
  }
  return { label: "Verde", color: "green" };
};

export const PublicReportView = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<PublicDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PublicDiagnostic>(
          `/diagnostics/public/${id}`,
        );
        setReport(data);
      } catch (err) {
        console.error(err);
        setError("No se encontró el reporte.");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleConfirmReception = async () => {
    if (!id || !report) return;
    setConfirming(true);

    try {
      const { data } = await api.patch<PublicDiagnostic>(
        `/diagnostics/public/${id}/accept`,
      );
      setReport(data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo confirmar la recepción del reporte. Intenta de nuevo.",
      );
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center px-4">
        <div className="rounded-3xl bg-slate-950/95 p-8 shadow-2xl shadow-black/40 text-center">
          <p className="text-slate-400">Cargando reporte público...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center px-4">
        <div className="rounded-3xl bg-slate-950/95 p-8 shadow-2xl shadow-black/40 text-center">
          <p className="text-red-400">{error ?? "Reporte no disponible."}</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white hover:bg-slate-800 transition"
          >
            Regresar al inicio
          </Link>
        </div>
      </div>
    );
  }

  const status = getHealthStatus(report);
  const isConfirmed = Boolean(report.isAccepted);

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded[-2rem] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              NEXUS CORE
            </p>
            <h1 className="mt-2 text-2xl font-black text-white">
              Reporte de Diagnóstico
            </h1>
          </div>
          <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-300">
            {report.vehicle.plate}
          </div>
        </div>

        <div className="rounded[-2rem] border border-slate-800 bg-slate-900/90 p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Estado de Salud
              </p>
              <p
                className={`mt-2 text-3xl font-black ${status.color === "red" ? "text-red-400" : status.color === "yellow" ? "text-amber-300" : "text-emerald-300"}`}
              >
                {status.label}
              </p>
            </div>
            <div
              className={`rounded-3xl px-4 py-3 text-sm font-black uppercase tracking-[0.2em] ${status.color === "red" ? "bg-red-500/10 text-red-200" : status.color === "yellow" ? "bg-amber-500/10 text-amber-200" : "bg-emerald-500/10 text-emerald-200"}`}
            >
              {status.label}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded[-2rem] border border-slate-800 bg-slate-900/90 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Fallas detectadas
            </p>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {report.faultCode ? (
                <div className="rounded-3xl bg-slate-950/80 p-4 border border-red-700/20">
                  <p className="font-black text-white">Código de falla</p>
                  <p className="mt-1">{report.faultCode}</p>
                </div>
              ) : null}
              {report.voltageReading !== undefined &&
              report.voltageReading !== null ? (
                <div className="rounded-3xl bg-slate-950/80 p-4 border border-yellow-700/20">
                  <p className="font-black text-white">Voltaje</p>
                  <p className="mt-1">{report.voltageReading.toFixed(1)} V</p>
                </div>
              ) : null}
              {report.description ? (
                <div className="rounded-3xl bg-slate-950/80 p-4 border border-slate-700/20">
                  <p className="font-black text-white">Descripción</p>
                  <p className="mt-1 text-slate-300">{report.description}</p>
                </div>
              ) : null}
              {!report.faultCode &&
                !report.voltageReading &&
                !report.description && (
                  <p className="text-slate-400">
                    No se identificaron fallas específicas en este reporte.
                  </p>
                )}
            </div>
          </div>

          <div className="rounded[-2rem] border border-slate-800 bg-slate-900/90 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Último estado
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                <Zap size={18} />
              </span>
              <div>
                <p className="font-black text-white">Reporte emitido</p>
                <p className="text-slate-400">
                  {report.deliveredAt
                    ? new Date(report.deliveredAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sin registro de envío"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={isConfirmed || confirming}
          onClick={handleConfirmReception}
          className="mt-6 w-full rounded-3xl bg-sky-500 px-6 py-4 text-base font-black uppercase tracking-[0.2em] text-slate-950 shadow-xl shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isConfirmed
            ? "Reporte Confirmado"
            : confirming
              ? "Confirmando..."
              : "Confirmar Recepción del Reporte"}
        </button>

        {isConfirmed && (
          <div className="mt-4 rounded-3xl border border-sky-600/30 bg-sky-700/10 p-4 text-sky-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <p className="font-black">Recepción confirmada</p>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Gracias por confirmar. El estado se actualizará en el radar interno.
            </p>
          </div>
        )}
        {!isConfirmed && success && (
          <div className="mt-4 rounded-3xl border border-sky-600/30 bg-sky-700/10 p-4 text-sky-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              <p className="font-black">Recepción registrada</p>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              Tu confirmación fue registrada correctamente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
