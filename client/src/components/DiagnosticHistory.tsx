import type { Diagnostic } from '../types';
import { Activity, Calendar, Zap, ClipboardList, Eye, Clock, Send, CheckCheck } from 'lucide-react';

interface Props {
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (diagnostic: Diagnostic) => void; // Nueva prop
}

const getCommunicationStatus = (diagnostic: Diagnostic) => {
  if (diagnostic.isAccepted) {
    return {
      icon: <CheckCheck className="text-blue-500" size={16} />,
      label: "Aceptado",
      tooltip: `Confirmado por el cliente el ${new Date(diagnostic.acceptedAt!).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      color: "text-blue-500"
    };
  }
  if (diagnostic.deliveredAt) {
    return {
      icon: <Send className="text-orange-500" size={16} />,
      label: "Enviado",
      tooltip: `Enviado el ${new Date(diagnostic.deliveredAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      color: "text-orange-500"
    };
  }
  return {
    icon: <Clock className="text-slate-500" size={16} />,
    label: "Pendiente",
    tooltip: "Aún no enviado al cliente",
    color: "text-slate-500"
  };
};

export const DiagnosticHistory = ({ diagnostics, onSelectDiagnostic }: Props) => {
  if (diagnostics.length === 0) {
    return (
      <div className="glass-card p-8 rounded-3xl text-center border-dashed border-2 border-slate-700">
        <ClipboardList className="mx-auto text-slate-600 mb-2" size={32} />
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Sin registros previos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="text-nexus-accent" size={20} />
        <h3 className="font-black uppercase tracking-tighter text-xl">Historial Clínico</h3>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
        {diagnostics.map((item) => (
          <div key={item.id} className="relative group">
            {/* Punto de la línea de tiempo */}
            <div className="absolute -left[-41px] top-1 bg-nexus-dark border-2 border-nexus-accent w-4 h-4 rounded-full group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            
            {/* Tarjeta Interactiva */}
            <button 
              onClick={() => onSelectDiagnostic(item)}
              className="w-full text-left glass-card p-5 rounded-2xl border border-transparent hover:border-nexus-accent/50 hover:bg-slate-800/80 transition-all duration-300 relative overflow-hidden group/card"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                  <Calendar size={14} />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2 items-center">
                  {(() => {
                    const status = getCommunicationStatus(item);
                    return (
                      <div className={`flex items-center gap-1 ${status.color} text-xs font-bold`} title={status.tooltip}>
                        {status.icon}
                        <span>{status.label}</span>
                      </div>
                    );
                  })()}
                  {item.faultCode && (
                    <span className="bg-red-500/10 text-red-400 border border-red-400/20 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">
                      DTC: {item.faultCode}
                    </span>
                  )}
                  <div className="opacity-0 group-hover/card:opacity-100 transition-opacity bg-nexus-accent text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                    <Eye size={12} /> VER REPORTE
                  </div>
                </div>
              </div>

              <h4 className="text-white font-bold text-lg mb-2 group-hover/card:text-nexus-accent transition-colors">
                {item.description}
              </h4>
              
              {item.technicalNotes && (
                <p className="text-slate-500 text-sm italic mb-4 line-clamp-2">
                  "{item.technicalNotes}"
                </p>
              )}

              {item.voltageReading && (
                <div className="flex items-center gap-2 bg-nexus-accent/5 w-fit px-3 py-1.5 rounded-lg border border-nexus-accent/20">
                  <Zap className="text-yellow-400" size={14} />
                  <span className="text-xs font-bold text-nexus-accent uppercase tracking-wider">
                    {item.voltageReading}V
                  </span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};