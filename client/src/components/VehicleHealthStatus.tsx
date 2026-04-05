import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { Diagnostic } from '../types';

interface Props {
  latestDiagnostic?: Diagnostic;
}

export const VehicleHealthStatus = ({ latestDiagnostic }: Props) => {
  if (!latestDiagnostic) return null;

  // Lógica simple de semáforo
  const hasDTC = !!latestDiagnostic.faultCode;
  const isLowVoltage = latestDiagnostic.voltageReading ? latestDiagnostic.voltageReading < 12.5 : false;

  let status = {
    color: 'text-nexus-success',
    bg: 'bg-nexus-success/10',
    border: 'border-nexus-success/20',
    label: 'Sistema Estable',
    icon: <CheckCircle2 size={18} />
  };

  if (hasDTC || isLowVoltage) {
    status = {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      label: 'Atención Preventiva',
      icon: <AlertTriangle size={18} />
    };
  }

  if (hasDTC && isLowVoltage) {
    status = {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      label: 'Fallo Crítico Detallado',
      icon: <XCircle size={18} />
    };
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${status.bg} ${status.color} ${status.border} w-fit animate-pulse`}>
      {status.icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
    </div>
  );
};
