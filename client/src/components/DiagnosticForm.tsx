import { useState } from "react";
import { PlusCircle, Zap, Activity, Save, X } from "lucide-react";
import api from "../api/axios";

interface Props {
  vehicleId: string;
  onSuccess: () => void; // Para recargar la búsqueda cuando guardemos
}

export const DiagnosticForm = ({ vehicleId, onSuccess }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    faultCode: "",
    technicalNotes: "",
    voltageReading: "",
    gnvPressure: "", // Nuevo
    gnvSolenoid: "", // Nuevo
    gnvLeakTest: false, // Nuevo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/diagnostics", {
        ...formData,
        vehicleId,
        voltageReading: formData.voltageReading
          ? parseFloat(formData.voltageReading)
          : null,
        gnvPressure: formData.gnvPressure
          ? parseFloat(formData.gnvPressure)
          : null,
        gnvLeakTest: Boolean(formData.gnvLeakTest),
        gnvSolenoid: formData.gnvSolenoid === "" ? null : formData.gnvSolenoid,
      });
      setIsOpen(false);
      setFormData({
        description: "",
        faultCode: "",
        technicalNotes: "",
        voltageReading: "",
        gnvPressure: "",
        gnvSolenoid: "",
        gnvLeakTest: false,
      });
      onSuccess(); // Refrescar los datos del vehículo
    } catch (error) {
      console.error("Error guardando diagnóstico", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 border-2 border-dashed border-nexus-accent/30 rounded-2xl text-nexus-accent font-black uppercase tracking-widest hover:bg-nexus-accent/10 transition-all flex items-center justify-center gap-2 group"
      >
        <PlusCircle
          className="group-hover:rotate-90 transition-transform"
          size={20}
        />
        Añadir Nuevo Hallazgo Técnico
      </button>
    );
  }

  return (
    <div className="glass-card p-6 rounded-3xl border-2 border-nexus-accent/50 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
          <Activity className="text-nexus-accent" size={20} /> Nuevo Reporte
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Descripción del Fallo
          </label>
          <input
            required
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white"
            placeholder="Ej: Falla en encendido / Ralentí inestable"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Código DTC
            </label>
            <input
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white uppercase font-mono"
              placeholder="P0300"
              value={formData.faultCode}
              onChange={(e) =>
                setFormData({ ...formData, faultCode: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Voltaje (V)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white pl-10"
                placeholder="13.8"
                value={formData.voltageReading}
                onChange={(e) =>
                  setFormData({ ...formData, voltageReading: e.target.value })
                }
              />
              <Zap
                className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"
                size={16}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
            Notas de Consultoría
          </label>
          <textarea
            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white h-24"
            placeholder="Detalles específicos para el cliente..."
            value={formData.technicalNotes}
            onChange={(e) =>
              setFormData({ ...formData, technicalNotes: e.target.value })
            }
          />
        </div>
        <div className="border-t border-slate-700/50 pt-4 mt-2 space-y-4">
          <div className="text-[10px] font-black uppercase text-nexus-accent tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse"></div>
            <span>Parámetros GNV (Opcional)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                Presión Gas (PSI)
              </label>
              <input
                type="number"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white"
                placeholder="Ej: 3000"
                value={formData.gnvPressure}
                onChange={(e) =>
                  setFormData({ ...formData, gnvPressure: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                Electroválvula
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:border-nexus-accent outline-none text-white"
                value={formData.gnvSolenoid}
                onChange={(e) =>
                  setFormData({ ...formData, gnvSolenoid: e.target.value })
                }
              >
                <option value="">No aplica</option>
                <option value="OK">Operativa (OK)</option>
                <option value="FAIL">Falla / Obstruida</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-nexus-accent focus:ring-nexus-accent"
              checked={formData.gnvLeakTest}
              onChange={(e) =>
                setFormData({ ...formData, gnvLeakTest: e.target.checked })
              }
            />
            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">
              Prueba de fugas realizada
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-nexus-accent py-4 rounded-xl font-black uppercase tracking-widest text-white hover:bg-blue-500 flex items-center justify-center gap-2 shadow-lg shadow-nexus-accent/20"
        >
          <Save size={18} />{" "}
          {loading ? "GUARDANDO..." : "REGISTRAR EN BITÁCORA"}
        </button>
      </form>
    </div>
  );
};
