export const formatPriorityAlertMessage = (ownerName: string, vehiclePlate: string): string => {
  return `Hola ${ownerName}, se ha detectado una alerta crítica en el vehículo ${vehiclePlate}. Por favor contáctanos inmediatamente para coordinar la atención.`;
};

export const formatCriticalAlertMessage = (ownerName: string, vehiclePlate: string): string => {
  return `Hola ${ownerName}, detectamos una alerta crítica en su vehículo ${vehiclePlate}. Por favor, contáctenos para revisión.`;
};

export interface FleetReportPayload {
  clientName: string;
  totalCritical: number;
  totalPreventive: number;
  totalOperational: number;
  redDetails: Array<{ plate: string; issue: string }>;
}

export const formatFleetReportMessage = (payload: FleetReportPayload): string => {
  const { clientName, totalCritical, totalPreventive, totalOperational, redDetails } = payload;
  const header = `Reporte Maestro de Flota para ${clientName}`;
  const summary = `Su flota tiene ${totalCritical} vehículos críticos, ${totalPreventive} preventivos y ${totalOperational} operativos.`;
  const redSection = redDetails.length
    ? `\n\nVehículos en ROJO:\n${redDetails
        .map((item) => `• ${item.plate}: ${item.issue}`)
        .join("\n")}`
    : "\n\nNo se detectaron vehículos en ROJO.";

  return `${header}\n${summary}${redSection}`;
};

export interface FleetSummaryWhatsAppPayload {
  clientName: string;
  totalVehicles: number;
  totalCritical: number;
  totalPreventive: number;
  totalOperational: number;
  panelUrl: string;
}

export const formatFleetSummaryWhatsAppMessage = (payload: FleetSummaryWhatsAppPayload): string => {
  const { clientName, totalCritical, totalPreventive, totalOperational, panelUrl } = payload;
  return `📊 NEXUS CORE - Resumen de Flota: ${clientName}\n\n🔴 Críticos: ${totalCritical} | 🟡 Preventivos: ${totalPreventive} | 🟢 Operativos: ${totalOperational}\n\nLink al panel: ${panelUrl}`;
};

export const formatDiagnosticDeliveryMessage = (
  clientName: string,
  reportLink: string,
  withAttachment = false,
): string => {
  const base = `Hola ${clientName}, su reporte ha sido generado.`;
  const attachmentText = withAttachment
    ? "Adjunto encontrarás una captura del reporte para su control."
    : "";
  return `${base} ${attachmentText} Puede visualizarlo y confirmar su recepción aquí: ${reportLink}`.trim();
};

export const createWhatsAppLink = (phone: string, message: string): string => {
  let digits = phone.replace(/\D/g, "");
  
  if(digits.startsWith('0')) {
    digits = `+58${digits.substring(1)}`
  }

  if(digits.startsWith('58')) {
    digits = `+${digits}`
  }
  if(!digits.startsWith('+58')){
    digits = `+58${digits}`
  }

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encodedText}`;
};
