export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  _count?: { vehicles: number };
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  owner: Client;
  diagnostics?: Diagnostic[];
}

export interface Diagnostic {
  id: string;
  vehicleId: string;
  description: string;
  faultCode?: string;
  technicalNotes?: string;
  voltageReading?: number;
  createdAt: string;
  deliveredAt?: string | null;
  isAccepted?: boolean;
  acceptedAt?: string | null;
  reportImageUrl?: string | null;
  gnvPressure?: number | null; // Presión en PSI
  gnvLeakTest?: boolean | null; // Prueba de fugas
  gnvSolenoid?: string | null; // Estado de electroválvu
}

export interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}

export interface ToolLoan {
  id: string;
  toolName: string;
  borrowerName: string;
  borrowerPhone: string;
  status: 'BORROWED' | 'RETURNED';
  loanDate: string;
  returnDate?: string | null;
}

export interface ClientFleetVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  diagnostics: Array<{
    id: string;
    description: string;
    createdAt: string;
    faultCode?: string;
    technicalNotes?: string;
    voltageReading?: number;
    deliveredAt?: string | null;
    isAccepted?: boolean;
    acceptedAt?: string | null;
    reportImageUrl?: string | null;
    gnvPressure?: number | null;
    gnvLeakTest?: boolean | null;
    gnvSolenoid?: string | null;
  }>;
}

export interface ClientFleetData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  vehicles: ClientFleetVehicle[];
}

export interface SearchPlateProps {
  onShowFleet?: (clientId: string) => void;
}

export interface Props {
  clientId: string;
  onSelectVehicle: (vehicle: ClientFleetVehicle | null) => void;
}

export interface PriorityAlert {
  id: string;
  description: string;
  createdAt: string;
  faultCode?: string | null;
  voltageReading?: number | null;
  deliveredAt?: string | null;
  isAccepted?: boolean;
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    owner: {
      id: string;
      name: string;
      phone?: string | undefined;
    };
  };
  healthStatus: "RED";
}

export type CriticalAlert = PriorityAlert;

export interface PublicDiagnostic {
  id: string;
  description: string;
  faultCode?: string | null;
  voltageReading?: number | null;
  createdAt: string;
  deliveredAt?: string | null;
  isAccepted?: boolean;
  acceptedAt?: string | null;
  vehicle: {
    plate: string;
    brand?: string;
    model?: string;
    year?: number;
  };
}

export interface FleetReportPayload {
  clientName: string;
  totalCritical: number;
  totalPreventive: number;
  totalOperational: number;
  redDetails: Array<{ plate: string; issue: string }>;
}

export interface FleetSummaryPlate {
  plate: string;
  issue?: string;
  lastFailure?: string;
}

export interface FleetSummaryData {
  totalVehicles: number;
  counts: {
    RED: number;
    YELLOW: number;
    GREEN: number;
  };
  groups: {
    RED: Array<FleetSummaryPlate>;
    YELLOW: Array<{ plate: string }>;
    GREEN: Array<{ plate: string }>;
  };
}

export interface FleetSummaryModalProps {
  ownerId: string;
  clientName: string;
  clientPhone?: string;
  panelUrl: string;
  onClose: () => void;
}