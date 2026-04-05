import React, { useState } from "react";
import api from "../api/axios";
import { Car, Hash, Calendar, Plus, X } from "lucide-react";
import { ClientSelector } from "./ClientSelector";

export const VehicleRegistration = ({
  onVehicleAdded,
}: {
  onVehicleAdded: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado alineado a tu modelo Prisma
  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    ownerId: "", // Aquí deberías pasar el ID de un cliente existente o manejar la creación de uno
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ajustamos el envío para que coincida con tu tabla
      await api.post("/vehicles", {
        ...formData,
        year: Number(formData.year), // Aseguramos que sea Int para Prisma
      });

      setFormData({ plate: "", brand: "", model: "", year: 2024, ownerId: "" });
      setIsOpen(false);
      onVehicleAdded();
    } catch (error) {
      console.error("Error al registrar vehículo:", error);
      alert(
        "Error: Asegúrate de que la placa no esté repetida y el Owner exista.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-orange-500 text-[#070B14] px-6 py-3 rounded-2xl font-black text-xs hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
      >
        {isOpen ? <X size={18} /> : <Plus size={18} />}
        {isOpen ? "CANCELAR" : "REGISTRAR VEHÍCULO"}
      </button>

      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 glass-card p-6 rounded-3xl border border-slate-800 bg-[#0E131F] animate-in fade-in slide-in-from-top-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PLACA */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                Placa / Matrícula
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-3 text-slate-600"
                  size={18}
                />
                <input
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white font-mono uppercase focus:border-orange-500 outline-none"
                  value={formData.plate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plate: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>

            {/* MARCA */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                Marca
              </label>
              <div className="relative">
                <Car
                  className="absolute left-3 top-3 text-slate-600"
                  size={18}
                />
                <input
                  required
                  placeholder="Ej: Toyota"
                  className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white focus:border-orange-500 outline-none"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                />
              </div>
            </div>

            {/* MODELO */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                Modelo
              </label>
              <input
                required
                placeholder="Ej: Corolla"
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-white focus:border-orange-500 outline-none"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            {/* AÑO (INT) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                Año
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-3 text-slate-600"
                  size={18}
                />
                <input
                  type="number"
                  required
                  className="w-full bg-slate-900 border border-slate-700 p-3 pl-10 rounded-xl text-white focus:border-orange-500 outline-none"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>

            {/* OWNER ID (Relación con Client) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">
                Seleccionar Propietario
              </label>
              <ClientSelector
                onSelect={(id) => setFormData({ ...formData, ownerId: id })}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
              >
                {loading ? "GUARDANDO..." : "CONFIRMAR INGRESO"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
