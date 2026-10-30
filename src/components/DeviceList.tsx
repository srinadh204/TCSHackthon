import React, { useState, useMemo } from 'react';
import { Device, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  Search,
  Filter,
  Cpu,
  Video,
  Server,
  Monitor,
  Radio,
  Layers,
  Globe,
  Wifi,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSearch,
} from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  onSelectDevice: (deviceId: string) => void;
  selectedDeviceId: string | null;
  language: Language;
  onOpenVisualAudit?: () => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onSelectDevice,
  selectedDeviceId,
  language,
  onOpenVisualAudit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ALERTS_ONLY'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.ip.includes(searchTerm) ||
        d.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ? true : d.status === 'alert' || d.status === 'warn';

      const matchesType = typeFilter === 'ALL' ? true : d.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchTerm, statusFilter, typeFilter]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'PLC':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'CCTV Camera':
        return <Video className="w-4 h-4 text-amber-400" />;
      case 'SCADA Server':
        return <Server className="w-4 h-4 text-cyan-400" />;
      case 'HMI Panel':
        return <Monitor className="w-4 h-4 text-blue-400" />;
      case 'IoT Gateway':
      case 'Vibration Sensor':
        return <Radio className="w-4 h-4 text-violet-400" />;
      case 'Industrial Switch':
        return <Layers className="w-4 h-4 text-slate-300" />;
      case 'External Remote Host':
        return <Globe className="w-4 h-4 text-rose-400" />;
      default:
        return <Wifi className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={getTranslation(language, 'searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Toggle */}
          <button
            onClick={() =>
              setStatusFilter((prev) => (prev === 'ALL' ? 'ALERTS_ONLY' : 'ALL'))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              statusFilter === 'ALERTS_ONLY'
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {statusFilter === 'ALERTS_ONLY'
                ? getTranslation(language, 'filterAlertsOnly')
                : getTranslation(language, 'filterAll')}
            </span>
          </button>

          {onOpenVisualAudit && (
            <button
              onClick={onOpenVisualAudit}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30 flex items-center gap-1.5 transition-colors"
              title={getTranslation(language, 'visualAuditBtn')}
            >
              <FileSearch className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Photo Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* Device Table */}
      <div className="mt-3 flex-1 overflow-x-auto overflow-y-auto max-h-[540px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider bg-slate-950/60 sticky top-0 z-10">
              <th className="py-2.5 px-3">{getTranslation(language, 'colDevice')}</th>
              <th className="py-2.5 px-3">{getTranslation(language, 'colType')}</th>
              <th className="py-2.5 px-3">{getTranslation(language, 'colProtocols')}</th>
              <th className="py-2.5 px-3">{getTranslation(language, 'colBandwidth')}</th>
              <th className="py-2.5 px-3 text-center">{getTranslation(language, 'colStatus')}</th>
              <th className="py-2.5 px-3 text-right">{getTranslation(language, 'colActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredDevices.map((device) => {
              const isSelected = selectedDeviceId === device.id;
              const hasAlert = device.status === 'alert';
              const hasWarn = device.status === 'warn';

              return (
                <tr
                  key={device.id}
                  onClick={() => onSelectDevice(device.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/30 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  {/* Name and Network info */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          {device.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {device.ip} &bull; {device.mac}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Auto-Classification & Vendor */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-200">{device.type}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {device.vendor}
                    </div>
                  </td>

                  {/* Protocols */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {device.protocols.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Bandwidth */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                    <div>↑ {formatBytes(device.bytesOut)}</div>
                    <div className="text-slate-400">↓ {formatBytes(device.bytesIn)}</div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3 text-center">
                    {hasAlert ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        CRITICAL
                      </span>
                    ) : hasWarn ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <AlertTriangle className="w-3 h-3" />
                        WARNING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3" />
                        NORMAL
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDevice(device.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors border border-slate-700"
                    >
                      {getTranslation(language, 'inspectDevice')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
