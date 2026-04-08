import { useState, useEffect } from "react";
import api from "../api/axios";
import { Wrench, UserPlus, CheckCircle2, X, MessageCircle } from "lucide-react";
import type { ToolLoan } from "../types/index";

export const ToolTracker = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loans, setLoans] = useState<ToolLoan[]>([]);

  // ✅ Usamos solo UN estado para el formulario
  const [formData, setFormData] = useState({
    toolName: "",
    borrowerName: "",
    borrowerPhone: "",
  });

  const fetchLoans = async (): Promise<void> => {
    try {
      const res = await api.get<ToolLoan[]>("/tools/loans/active");
      setLoans(res.data);
    } catch (error) {
      console.error("Error al cargar préstamos:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchLoans();
    };
    load();
  }, []);

  const handleAddLoan = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();

    // ✅ Validación usando formData
    if (!formData.toolName || !formData.borrowerName) return;

    try {
      await api.post<ToolLoan>("/tools/loans", {
        toolName: formData.toolName,
        borrowerName: formData.borrowerName,
        borrowerPhone: formData.borrowerPhone,
      });

      // ✅ Limpieza del objeto
      setFormData({ toolName: "", borrowerName: "", borrowerPhone: "" });
      setShowForm(false);
      await fetchLoans();
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  const handleReturn = async (id: string): Promise<void> => {
    try {
      await api.patch(`/tools/loans/${id}/return`);
      await fetchLoans();
    } catch (error) {
      console.error("Error en la devolución:", error);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl border border-slate-800 mt-8 shadow-2xl bg-[#0E131F]/40 backdrop-blur-md">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500">
            <Wrench size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              Control de Equipos
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Inventario en Préstamo
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-3 rounded-2xl transition-all ${
            showForm
              ? "bg-red-500/20 text-red-500"
              : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
          }`}
        >
          {showForm ? <X size={24} /> : <UserPlus size={24} />}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddLoan}
          className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in zoom-in"
        >
          <input
            placeholder="Herramienta"
            className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white text-xs outline-none focus:border-orange-500/50"
            value={formData.toolName}
            onChange={(e) =>
              setFormData({ ...formData, toolName: e.target.value })
            }
            required
          />
          <input
            placeholder="Nombre"
            className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white text-xs outline-none focus:border-orange-500/50"
            value={formData.borrowerName}
            onChange={(e) =>
              setFormData({ ...formData, borrowerName: e.target.value })
            }
            required
          />
          <input
            placeholder="WhatsApp"
            className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-white text-xs outline-none focus:border-orange-500/50"
            value={formData.borrowerPhone}
            onChange={(e) =>
              setFormData({ ...formData, borrowerPhone: e.target.value })
            }
          />
          <button
            type="submit"
            className="bg-orange-500 text-[#070B14] font-black uppercase text-[10px] rounded-xl hover:bg-orange-400 transition-colors"
          >
            REGISTRAR
          </button>
        </form>
      )}

      <div className="space-y-3">
        {Array.isArray(loans) &&
          loans.length > 0 &&
          (loans || []).map((loan) => (
            <div
              key={loan?.id}
              className="flex justify-between items-center bg-slate-950/40 p-5 rounded-3xl border border-slate-800/50 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-500">
                  <Wrench size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase tracking-tight">
                    {loan?.toolName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                    {loan?.borrowerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/${loan?.borrowerPhone}?text=Hola ${loan?.borrowerName}, recordatorio de devolución: ${loan?.toolName}`,
                    )
                  }
                  className="p-3 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
                >
                  <MessageCircle size={20} />
                </button>
                <button
                  onClick={() => handleReturn(loan?.id)}
                  className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white p-3 rounded-2xl transition-all"
                >
                  <CheckCircle2 size={22} />
                </button>
              </div>
            </div>
          ))}

        {!Array.isArray(loans) && (
          <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-widest py-10 border border-dashed border-slate-800 rounded-3xl">
            Todas las herramientas están en el taller
          </p>
        )}
      </div>
    </div>
  );
};
