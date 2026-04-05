import { useState } from "react";
import { Search, Car, User, AlertCircle, Layers } from "lucide-react";
import api from "../api/axios";
import type { Diagnostic, Vehicle, SearchPlateProps } from "../types"; // Agregamos 'type' para cumplir con verbatimModuleSyntax
import { DiagnosticHistory } from "./DiagnosticHistory";
import { DiagnosticForm } from "./DiagnosticForm";
import { VehicleHealthStatus } from "./VehicleHealthStatus";
import { DiagnosticReport } from "./DiagnosticReport";


export const SearchPlate = ({ onShowFleet }: SearchPlateProps) => {
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get<Vehicle>(
        `/vehicles/${plate.toUpperCase()}`,
      );
      setVehicle(response.data);
    } catch {
      // Quitamos 'err' y el 'any' ya que no usábamos la variable del error
      setVehicle(null);
      setError("Vehículo no registrado en Nexus Core.");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () =>
    handleSearch({ preventDefault: () => {} } as React.FormEvent);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          placeholder="INTRODUCE PLACA (Ej: AE555BC)..."
          className="w-full bg-slate-800/50 border-2 border-slate-700 p-5 pl-14 rounded-2xl text-xl font-black tracking-widest uppercase focus:border-nexus-accent focus:ring-4 focus:ring-nexus-accent/20 transition-all outline-none placeholder:text-slate-600"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-nexus-accent transition-colors"
          size={24}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-nexus-accent hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "SCANNING..." : "BUSCAR"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
          <AlertCircle size={20} />
          <span className="font-bold text-sm uppercase tracking-wider">
            {error}
          </span>
        </div>
      )}

      {vehicle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-6 rounded-3xl border-l-4 border-nexus-accent">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 text-nexus-accent">
                <Car size={24} />
                <h2 className="font-black uppercase tracking-tight text-lg">
                  Información Técnica
                </h2>
              </div>
              {/* NUEVO: Semáforo de Salud */}
              {vehicle.diagnostics && vehicle.diagnostics.length > 0 && (
                <VehicleHealthStatus latestDiagnostic={vehicle.diagnostics[0]} />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase font-bold">Vehículo</p>
              <p className="text-2xl font-black">{vehicle.brand} {vehicle.model}</p>
              <div className="flex gap-4 mt-2">
                <span className="bg-slate-700 px-3 py-1 rounded-md text-xs font-bold uppercase">{vehicle.plate}</span>
                <span className="bg-slate-700 px-3 py-1 rounded-md text-xs font-bold uppercase">Año: {vehicle.year}</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-6 rounded-3xl border-l-4 border-nexus-success">
            <div className="flex items-center gap-3 text-nexus-success mb-4">
              <User size={24} />
              <h2 className="font-black uppercase tracking-tight text-lg">Contacto Cliente</h2>
              {/* Botón Ver Flota */}
              {vehicle.owner && vehicle.owner.id && vehicle.owner._count && vehicle.owner._count?.vehicles > 1 && onShowFleet && (
                <button
                  className="ml-2 flex items-center gap-1 px-2 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow transition-all"
                  title="Ver Flota del Cliente"
                  onClick={() => onShowFleet(vehicle.owner.id)}
                >
                  <Layers size={16} /> Flota
                </button>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase font-bold">Propietario</p>
              <p className="text-2xl font-black">{vehicle.owner.name}</p>
              <p className="text-slate-400 font-medium italic">{vehicle.owner.phone || "Sin teléfono"}</p>
            </div>
          </div>
        </div>
      )}
      {vehicle && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ... aquí van las cards de Info Técnica y Contacto Cliente que ya hicimos ... */}
          </div>
          {/* ... formulario de nuevo diagnóstico ... */}
          <div className="mt-8">
            <DiagnosticForm vehicleId={vehicle.id} onSuccess={refreshData} />
          </div>
          {/* NUEVO: Historial de Diagnósticos */}
          <div className="mt-12">
            <DiagnosticHistory
              diagnostics={vehicle.diagnostics || []}
              onSelectDiagnostic={(diag) => setSelectedDiagnostic(diag)} // Conexión aquí
            />
          </div>
        </>
      )}
      {selectedDiagnostic && (
        <DiagnosticReport
          vehicle={vehicle!}
          diagnostic={selectedDiagnostic}
          onClose={() => setSelectedDiagnostic(null)}
        />
      )}
      {/* Overlay del Reporte */}
      {selectedDiagnostic && vehicle && (
        <DiagnosticReport
          vehicle={vehicle}
          diagnostic={selectedDiagnostic}
          onClose={() => setSelectedDiagnostic(null)}
        />
      )}
    </div>
  );
};
