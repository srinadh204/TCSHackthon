import { DeviceType, SubnetZone } from '../types';

export interface ClassificationRuleResult {
  type: DeviceType;
  confidence: number;
  reason: string;
  vendorGuess: string;
}

/**
 * Heuristic auto-classifier as defined in Build Plan:
 * - RTSP or dest port 554 / 8554 -> CCTV Camera
 * - MODBUS or src/dst port 502 -> PLC
 * - OPC_UA or port 4840 -> SCADA / OPC UA Server
 * - MQTT or port 1883 / 8883 -> IoT Gateway
 * - HTTP traffic only & multiple peers -> HMI / Management
 * - Port 8193 -> CNC Machine
 */
export function classifyDeviceByTraffic(
  ip: string,
  protocols: string[],
  ports: number[],
  macPrefix: string = ''
): ClassificationRuleResult {
  const isExternal = !ip.startsWith('192.168.') && !ip.startsWith('10.') && !ip.startsWith('172.16.');

  if (isExternal) {
    return {
      type: 'External Remote Host',
      confidence: 0.99,
      reason: 'IP address is outside local factory subnet (Internet routable)',
      vendorGuess: 'External Cloud Provider / ISP',
    };
  }

  // Check RTSP / Camera
  if (protocols.includes('RTSP') || ports.includes(554) || ports.includes(8554)) {
    let vendor = 'Hikvision / Dahua';
    if (macPrefix.startsWith('00:12:17')) vendor = 'CP Plus';
    if (macPrefix.startsWith('bc:ba:e1')) vendor = 'Hikvision Digital';
    return {
      type: 'CCTV Camera',
      confidence: 0.95,
      reason: 'Observed RTSP real-time streaming protocol on port 554/8554',
      vendorGuess: vendor,
    };
  }

  // Check Modbus / PLC
  if (protocols.includes('MODBUS') || ports.includes(502)) {
    let vendor = 'Siemens S7';
    if (macPrefix.startsWith('00:80:f4')) vendor = 'Schneider Electric';
    if (macPrefix.startsWith('00:00:0e')) vendor = 'Delta Electronics';
    if (macPrefix.startsWith('00:0c:41')) vendor = 'Omron Industrial';
    return {
      type: 'PLC',
      confidence: 0.92,
      reason: 'Active Modbus TCP communication detected on standard industrial port 502',
      vendorGuess: vendor,
    };
  }

  // Check OPC-UA / SCADA
  if (protocols.includes('OPC_UA') || ports.includes(4840)) {
    return {
      type: 'SCADA Server',
      confidence: 0.94,
      reason: 'Serving OPC Unified Architecture telemetry on port 4840',
      vendorGuess: 'Inductive Automation (Ignition) / Siemens WinCC',
    };
  }

  // Check CNC Machine
  if (protocols.includes('FANUC_FOCAS') || ports.includes(8193)) {
    return {
      type: 'CNC Machine',
      confidence: 0.9,
      reason: 'Fanuc FOCAS industrial CNC machine controller telemetry on port 8193',
      vendorGuess: 'Fanuc Robotics & CNC',
    };
  }

  // Check MQTT / Sensor Gateway
  if (protocols.includes('MQTT') || ports.includes(1883) || ports.includes(8883)) {
    return {
      type: 'IoT Gateway',
      confidence: 0.88,
      reason: 'Telemetry broker traffic observed on MQTT port 1883/8883',
      vendorGuess: 'Advantech WISE / Kewal Energy',
    };
  }

  // Check HMI Panel
  if (ports.includes(8080) || ports.includes(3000) || (ports.includes(80) && ip.endsWith('.15'))) {
    return {
      type: 'HMI Panel',
      confidence: 0.75,
      reason: 'Dedicated industrial web control interface for operator station',
      vendorGuess: 'Siemens SIMATIC Comfort / Weintek',
    };
  }

  // Check Switch / Gateway
  if (ip.endsWith('.1') || ip.endsWith('.254')) {
    return {
      type: 'Industrial Switch',
      confidence: 0.95,
      reason: 'Subnet gateway router & managed industrial network switch',
      vendorGuess: 'Cisco Industrial / Moxa',
    };
  }

  return {
    type: 'Unknown IoT Device',
    confidence: 0.5,
    reason: 'Unmatched protocol pattern, generic TCP/IP traffic',
    vendorGuess: 'Generic Embedded Linux / Microcontroller',
  };
}

export function inferSubnetZone(ip: string): SubnetZone {
  if (!ip.startsWith('192.168.')) return 'EXTERNAL';
  const octets = ip.split('.');
  const thirdOctet = parseInt(octets[2], 10);
  const fourthOctet = parseInt(octets[3], 10);

  if (thirdOctet === 1) return 'IT_CONTROL';
  if (fourthOctet >= 70 && fourthOctet <= 90) return 'IOT_ZONE';
  return 'OT_ZONE';
}
