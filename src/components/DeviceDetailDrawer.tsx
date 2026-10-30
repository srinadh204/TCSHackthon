import React, { useState } from 'react';
import { Device, Alert, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  X,
  Cpu,
  Video,
  Server,
  Monitor,
  Radio,
  Layers,
  Globe,
  Wifi,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Search,
  Camera,
  Activity,
  Network,
  Clock,
  HardDrive,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface DeviceDetailDrawerProps {
  device: Device | null;
  alerts: Alert[];
  onClose: () => void;
  language: Language;
  onOpenThreatIntel: (ip: string, protocol: string, deviceType: string) => void;
  onOpenVisualAudit: () => void;
}

export const DeviceDetailDrawer: React.FC<DeviceDetailDrawerProps> = ({
  device,
  alerts,
  onClose,
  language,
  onOpenThreatIntel,
  onOpenVisualAudit,
}) => {
  if (!device) return null;

  const deviceAlerts = alerts.filter(
    (a) => a.deviceId === device.id || a.deviceIp === device.ip
  );

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'PLC':
        return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'CCTV Camera':
        return <Video className="w-6 h-6 text-amber-400" />;
      case 'SCADA Server':
        return <Server className="w-6 h-6 text-cyan-400" />;
      case 'HMI Panel':
        return <Monitor className="w-6 h-6 text-blue-400" />;
      case 'IoT Gateway':
        return <Radio className="w-6 h-6 text-violet-400" />;
      case 'Industrial Switch':
        return <Layers className="w-6 h-6 text-slate-300" />;
      case 'External Remote Host':
        return <Globe className="w-6 h-6 text-rose-400" />;
      default:
        return <Wifi className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">{device.name}</h2>
            <div className="text-xs font-mono text-cyan-400">
              {device.ip} &bull; {device.mac}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Risk Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            device.status === 'alert'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : device.status === 'warn'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {device.status === 'alert' ? (
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            ) : device.status === 'warn' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {device.status === 'alert'
                  ? 'CRITICAL INCIDENT DETECTED'
                  : device.status === 'warn'
                  ? 'ATTENTION REQUIRED'
                  : 'NORMAL OPERATION'}
              </div>
              <div className="text-[11px] opacity-80">
                {deviceAlerts.length} Active Anomaly Alerts
              </div>
            </div>
          </div>

          {device.isExternal && (
            <button
              onClick={() => onOpenThreatIntel(device.ip, 'TCP', device.type)}
              className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 text-xs font-semibold border border-blue-500/40"
            >
              Search Threat Intel
            </button>
          )}
        </div>

        {/* Auto-Classification Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Auto-Classification Engine</span>
            <span className="text-emerald-400 text-[10px] font-bold">95% CONFIDENCE</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Classified Role:</span>
              <span className="font-semibold text-slate-100">{device.type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Identified Vendor:</span>
              <span className="font-semibold text-slate-100">{device.vendor}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Estimated Model:</span>
              <span className="font-mono text-cyan-300">
                {device.modelEstimated || 'Industrial Embedded Controller'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Subnet Zone:</span>
              <span className="font-mono text-slate-300">{device.zone}</span>
            </div>
          </div>
        </div>

        {/* Protocols & Ports */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Observed Protocols & Open Ports
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {device.protocols.map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold"
              >
                {p}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Listening Ports: </span>
            <span className="font-mono text-slate-200">
              {device.openPorts.length > 0
                ? device.openPorts.join(', ')
                : 'Standard ephemeral sockets'}
            </span>
          </div>
        </div>

        {/* Traffic Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Total Inbound</div>
            <div className="text-base font-bold font-mono text-slate-100">
              {formatBytes(device.bytesIn)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1">Total Outbound</div>
            <div className="text-base font-bold font-mono text-cyan-400">
              {formatBytes(device.bytesOut)}
            </div>
          </div>
        </div>

        {/* 1-Hour Behavior Story */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            1-Hour Behavior Story
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {device.status === 'alert'
              ? `In the last hour, ${device.name} experienced an abnormal behavioral shift: unexpected communication flows were initiated outside normal baseline schedules. Investigate active alerts below immediately.`
              : `During the current shift, ${device.name} communicated consistently with authorized supervisory nodes on local subnet ${device.ip.split('.').slice(0, 3).join('.')}.0/24 without protocol deviations.`}
          </p>
        </div>

        {/* Device Active Alerts */}
        {deviceAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Associated Incident Alerts ({deviceAlerts.length})
            </div>
            {deviceAlerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs space-y-1.5"
              >
                <div className="font-semibold text-red-300">
                  {alt.title[language] || alt.title.en}
                </div>
                <div className="text-slate-300 text-[11px]">
                  {alt.story[language] || alt.story.en}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawer Action Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex flex-col gap-2">
        <button
          onClick={onOpenVisualAudit}
          className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-950/50"
        >
          <Camera className="w-4 h-4" />
          <span>Inspect Physical Hardware Photo (Gemini 4 Argon)</span>
        </button>

        {device.isExternal ? (
          <button
            onClick={() => onOpenThreatIntel(device.ip, 'TCP', device.type)}
            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-950/50"
          >
            <Search className="w-4 h-4" />
            <span>Search Threat Intel & CVEs (Google Search)</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenThreatIntel(device.ip, device.protocols[0] || 'MODBUS', device.type)}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Search className="w-4 h-4" />
            <span>Check Industrial Vulnerabilities for {device.vendor}</span>
          </button>
        )}
      </div>
    </div>
  );
};
