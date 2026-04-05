import "./index.css";
import { SearchPlate } from "./components/SearchPlate";
import { ToolTracker } from "./components/ToolTracker";
import { CriticalAlerts } from "./components/CriticalAlerts";
import { PublicReport } from "./pages/PublicReport";
import { Activity, ShieldCheck, Zap, LogOut } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./components/Login";
import { supabase } from "./lib/supabase";
import { VehicleRegistration } from "./components/VehicleRegistration";
import { ClientFleetView } from "./components/ClientFleetView";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  // NUEVO: Estado global de vista y cliente seleccionado
  const [viewMode, setViewMode] = useState<"dashboard" | "fleet">("dashboard");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session),
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report/:id" element={<PublicReport />} />
        <Route
          path="/*"
          element={
            session ? (
              <div className="min-h-screen bg-[#070B14] text-slate-200 selection:bg-orange-500/30 font-sans">
                <header className="border-b border-slate-800 bg-[#0E131F]/50 backdrop-blur-md sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                        <Activity className="text-[#070B14]" size={20} />
                      </div>
                      <div>
                        <h1 className="text-xl font-black tracking-tighter italic uppercase">
                          NEXUS <span className="text-orange-500">CORE</span>
                        </h1>
                        <p className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.3em] leading-none">
                          Valencia Precision v1.0
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-950/30 hover:border-red-500/50 hover:text-red-500 transition-all duration-300"
                    >
                      <span>SALIR</span>
                      <LogOut size={14} />
                    </button>
                  </div>
                </header>

                {viewMode === "fleet" && selectedClientId && (
                  <div className="animate-in fade-in slide-in-from-right duration-300">
                    <ClientFleetView
                      clientId={selectedClientId}
                      onSelectVehicle={() => {
                        setViewMode("dashboard");
                      }}
                    />
                    <div className="mt-6 text-center">
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-2xl font-black uppercase tracking-widest shadow transition-all"
                        onClick={() => setViewMode("dashboard")}
                      >
                        Volver al Diagnóstico
                      </button>
                    </div>
                  </div>
                )}

                {viewMode === "dashboard" && (
                  <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                    <section className="max-w-3xl mx-auto border-b border-slate-800 pb-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-6 bg-orange-500 rounded-full" />
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                          Recepción de Unidad
                        </h2>
                      </div>
                      <VehicleRegistration onVehicleAdded={() => {}} />
                    </section>

                    <section className="max-w-3xl mx-auto">
                      <SearchPlate
                        onShowFleet={(clientId: string) => {
                          setSelectedClientId(clientId);
                          setViewMode("fleet");
                        }}
                      />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <section className="lg:col-span-8">
                        <ToolTracker />
                      </section>

                      <aside className="lg:col-span-4 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">
                          Métricas en Tiempo Real
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#0E131F] flex items-center gap-5 border-b-4 border-b-orange-500 hover:translate-y[-4px] transition-transform">
                            <div className="bg-orange-500/10 p-4 rounded-2xl text-orange-500">
                              <Activity size={24} />
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase">
                                Diagnósticos Hoy
                              </p>
                              <p className="text-3xl font-black text-white">12</p>
                            </div>
                          </div>

                          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#0E131F] flex items-center gap-5 border-b-4 border-b-emerald-500 hover:translate-y[-4px] transition-transform">
                            <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-500">
                              <ShieldCheck size={24} />
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase">
                                Sistemas Validados
                              </p>
                              <p className="text-3xl font-black text-white">98%</p>
                            </div>
                          </div>

                          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-[#0E131F] flex items-center gap-5 border-b-4 border-b-red-500 group">
                            <div className="bg-red-500/10 p-4 rounded-2xl text-red-500 group-hover:animate-pulse">
                              <Zap size={24} />
                            </div>
                            <div>
                              <p className="text-slate-500 text-[10px] font-black uppercase">
                                Alertas Activas
                              </p>
                              <p className="text-3xl font-black text-red-500">3</p>
                            </div>
                          </div>

                          <CriticalAlerts />
                        </div>
                      </aside>
                    </div>
                  </main>
                )}
              </div>
            ) : (
              <Login />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
