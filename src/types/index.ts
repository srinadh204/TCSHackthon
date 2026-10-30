export type DeviceStatus = 'ok' | 'warn' | 'alert';

export type DeviceType =
  | 'PLC'
  | 'CCTV Camera'
  | 'SCADA Server'
  | 'HMI Panel'
  | 'IoT Gateway'
  | 'Vibration Sensor'
  | 'Energy Meter'
  | 'CNC Machine'
  | 'Industrial Switch'
  | 'Operator Workstation'
  | 'Unknown IoT Device'
  | 'External Remote Host';

export type SubnetZone = 'OT_ZONE' | 'IOT_ZONE' | 'IT_CONTROL' | 'EXTERNAL';

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  type: DeviceType;
  zone: SubnetZone;
  vendor: string;
  modelEstimated?: string;
  status: DeviceStatus;
  firstSeen: string;
  lastSeen: string;
  protocols: string[];
  openPorts: number[];
  bytesIn: number;
  bytesOut: number;
  activeAlertsCount: number;
  location: string;
  description: string;
  isExternal?: boolean;
}

export type ProtocolType =
  | 'MODBUS'
  | 'OPC_UA'
  | 'RTSP'
  | 'MQTT'
  | 'HTTP'
  | 'HTTPS'
  | 'SSH'
  | 'FTP'
  | 'FANUC_FOCAS'
  | 'TCP_UNKNOWN';

export interface NetworkFlow {
  id: string;
  timestamp: string; // ISO string
  srcIp: string;
  dstIp: string;
  srcPort: number;
  dstPort: number;
  protocol: ProtocolType;
  bytes: number;
  packets?: number;
  isAnomaly?: boolean;
  notes?: string;
}

export type AnomalyRule =
  | 'NEW_EXTERNAL_CONNECTION'
  | 'UNUSUAL_PROTOCOL'
  | 'DATA_EXFILTRATION_SPIKE'
  | 'UNEXPECTED_PEER_COMM'
  | 'ROGUE_OT_DEVICE';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Alert {
  id: string;
  timestamp: string;
  rule: AnomalyRule;
  severity: AlertSeverity;
  deviceIp: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  dstIp?: string;
  dstCountry?: string;
  dstPort?: number;
  protocol: string;
  bytes?: number;
  title: Record<'en' | 'hi' | 'ta', string>;
  story: Record<'en' | 'hi' | 'ta', string>;
  action: Record<'en' | 'hi' | 'ta', string>;
  status: 'active' | 'investigating' | 'mitigated';
  flowId?: string;
}

export type Language = 'en' | 'hi' | 'ta';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ThreatIntelResult {
  targetIp: string;
  analysis: string;
  sources: GroundingSource[];
  timestamp: string;
}

export interface VisualAuditResult {
  deviceName: string;
  deviceType: string;
  manufacturer: string;
  estimatedModel: string;
  confidenceScore: number;
  protocolsExpected: string[];
  visiblePorts: string[];
  physicalRisks: string[];
  cyberRisks: string[];
  securityRating: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SECURE';
  humanSummary: string;
  recommendedActions: string[];
}
