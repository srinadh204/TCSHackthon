import React, { useState, useRef, useMemo } from 'react';
import { Device, NetworkFlow, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cpu,
  Video,
  Server,
  Layers,
  Radio,
  Monitor,
  Globe,
  Wifi,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DeviceMapProps {
  devices: Device[];
  activeFlows: NetworkFlow[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  language: Language;
}

export const DeviceMap: React.FC<DeviceMapProps> = ({
  devices,
  activeFlows,
  selectedDeviceId,
  onSelectDevice,
  language,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<Device | null>(null);

  // Map coordinates layout for each device in a crisp, aesthetic factory grid
  const nodePositions = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {
      // IT & Control Room (Top Left & Center)
      'dev-switch-core': { x: 480, y: 160 },
      'dev-scada': { x: 320, y: 110 },
      'dev-mgr-laptop': { x: 180, y: 110 },

      // OT Zone - Production PLCs & CNC (Center & Bottom Left)
      'dev-plc-1': { x: 260, y: 310 },
      'dev-plc-2': { x: 440, y: 310 },
      'dev-plc-3': { x: 620, y: 310 },
      'dev-hmi-1': { x: 260, y: 440 },
      'dev-cnc-1': { x: 440, y: 440 },

      // CCTV Cameras (Right side OT)
      'dev-cam-1': { x: 740, y: 260 },
      'dev-cam-2': { x: 880, y: 260 },

      // IoT Zone - Sensors & Gateways (Bottom Center/Right)
      'dev-iot-gw': { x: 640, y: 440 },
      'dev-sensor-vib': { x: 820, y: 440 },

      // External Hosts (Top Right)
      'ext-cloud-backup': { x: 760, y: 90 },
      'ext-suspicious-c2': { x: 920, y: 90 },
    };

    return coords;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking background
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'map-canvas') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const getDeviceIcon = (type: string, isAlert: boolean) => {
    if (isAlert) return <Flame className="w-5 h-5 text-red-400 animate-pulse" />;
    switch (type) {
      case 'PLC':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'CCTV Camera':
        return <Video className="w-5 h-5 text-amber-400" />;
      case 'SCADA Server':
        return <Server className="w-5 h-5 text-cyan-400" />;
      case 'HMI Panel':
        return <Monitor className="w-5 h-5 text-blue-400" />;
      case 'IoT Gateway':
      case 'Vibration Sensor':
        return <Radio className="w-5 h-5 text-violet-400" />;
      case 'Industrial Switch':
        return <Layers className="w-5 h-5 text-slate-300" />;
      case 'External Remote Host':
        return <Globe className="w-5 h-5 text-rose-400" />;
      default:
        return <Wifi className="w-5 h-5 text-slate-400" />;
    }
  };

  const getProtocolColor = (proto: string, isAnomaly?: boolean) => {
    if (isAnomaly) return '#ef4444'; // Red
    switch (proto) {
      case 'MODBUS':
        return '#06b6d4'; // Cyan
      case 'RTSP':
        return '#f59e0b'; // Amber
      case 'OPC_UA':
        return '#10b981'; // Emerald
      case 'MQTT':
        return '#8b5cf6'; // Violet
      case 'SSH':
        return '#f43f5e'; // Rose
      case 'FANUC_FOCAS':
        return '#3b82f6'; // Blue
      default:
        return '#64748b'; // Slate
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden select-none shadow-2xl flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono">
            {getTranslation(language, 'tabTopology')}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <span className="text-xs text-slate-400 font-mono">
          {devices.length} Nodes &bull; {activeFlows.length} Active Conns
        </span>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          title={getTranslation(language, 'zoomIn')}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          title={getTranslation(language, 'zoomOut')}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
          title={getTranslation(language, 'resetZoom')}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas */}
      <div
        id="map-canvas"
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1080 580"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
            </pattern>

            {/* Glowing Drop Shadows */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.7" />
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1080" height="580" fill="url(#grid-dots)" />

          {/* Subnet Boundaries / Zones */}
          {/* IT & Supervisory Zone */}
          <rect
            x="130"
            y="50"
            width="450"
            height="160"
            rx="16"
            fill="#0f172a"
            fillOpacity="0.5"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="145" y="75" fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {getTranslation(language, 'zoneIT')} (192.168.1.0/24)
          </text>

          {/* External Internet DMZ */}
          <rect
            x="700"
            y="50"
            width="320"
            height="160"
            rx="16"
            fill="#1e1b4b"
            fillOpacity="0.25"
            stroke="#4338ca"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="715" y="75" fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {getTranslation(language, 'zoneExternal')} (WAN / Cloud)
          </text>

          {/* OT Production Floor Zone */}
          <rect
            x="180"
            y="235"
            width="530"
            height="295"
            rx="16"
            fill="#022c22"
            fillOpacity="0.2"
            stroke="#065f46"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="195" y="258" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {getTranslation(language, 'zoneOT')} (192.168.10.0/24)
          </text>

          {/* IoT & Sensor Mesh */}
          <rect
            x="725"
            y="235"
            width="295"
            height="295"
            rx="16"
            fill="#2e1065"
            fillOpacity="0.2"
            stroke="#6b21a8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text x="740" y="258" fill="#c084fc" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {getTranslation(language, 'zoneIoT')} (192.168.10.7x)
          </text>

          {/* Permanent Physical Infrastructure Links */}
          <g stroke="#334155" strokeWidth="1.2" opacity="0.4" strokeDasharray="2 3">
            <line x1="480" y1="160" x2="320" y2="110" />
            <line x1="480" y1="160" x2="180" y2="110" />
            <line x1="480" y1="160" x2="260" y2="310" />
            <line x1="480" y1="160" x2="440" y2="310" />
            <line x1="480" y1="160" x2="620" y2="310" />
            <line x1="480" y1="160" x2="740" y2="260" />
            <line x1="480" y1="160" x2="880" y2="260" />
            <line x1="480" y1="160" x2="640" y2="440" />
            <line x1="480" y1="160" x2="760" y2="90" />
          </g>

          {/* Active Flow Communication Lines with Animated Packets */}
          {activeFlows.map((flow) => {
            const srcPos = Object.entries(nodePositions).find(([id]) => {
              const dev = devices.find((d) => d.id === id);
              return dev && dev.ip === flow.srcIp;
            })?.[1];

            const dstPos = Object.entries(nodePositions).find(([id]) => {
              const dev = devices.find((d) => d.id === id);
              return dev && dev.ip === flow.dstIp;
            })?.[1];

            if (!srcPos || !dstPos) return null;

            const strokeColor = getProtocolColor(flow.protocol, flow.isAnomaly);
            const midX = (srcPos.x + dstPos.x) / 2;
            const midY = (srcPos.y + dstPos.y) / 2;

            return (
              <g key={flow.id}>
                {/* Glowing Flow Path */}
                <line
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={dstPos.x}
                  y2={dstPos.y}
                  stroke={strokeColor}
                  strokeWidth={flow.isAnomaly ? 3 : 2}
                  strokeOpacity={flow.isAnomaly ? 0.9 : 0.75}
                  strokeDasharray={flow.isAnomaly ? '6 3' : undefined}
                />

                {/* Animated Packet Dot */}
                <circle r={flow.isAnomaly ? 5 : 3.5} fill={strokeColor}>
                  <animate
                    attributeName="cx"
                    from={srcPos.x}
                    to={dstPos.x}
                    dur={flow.isAnomaly ? '0.7s' : '1.4s'}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    from={srcPos.y}
                    to={dstPos.y}
                    dur={flow.isAnomaly ? '0.7s' : '1.4s'}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Protocol Tag on Wire */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-28"
                    y="-10"
                    width="56"
                    height="18"
                    rx="4"
                    fill="#0f172a"
                    stroke={strokeColor}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={strokeColor}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {flow.protocol}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Device Nodes */}
          {devices.map((device) => {
            const pos = nodePositions[device.id] || { x: 500, y: 300 };
            const isSelected = selectedDeviceId === device.id;
            const isAlert = device.status === 'alert';
            const isWarn = device.status === 'warn';

            let nodeFilter = 'url(#glow-green)';
            let borderColor = '#10b981';
            let bgColor = '#064e3b';

            if (isAlert) {
              nodeFilter = 'url(#glow-red)';
              borderColor = '#ef4444';
              bgColor = '#7f1d1d';
            } else if (isWarn) {
              nodeFilter = 'url(#glow-amber)';
              borderColor = '#f59e0b';
              bgColor = '#78350f';
            }

            return (
              <g
                key={device.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDevice(device.id);
                }}
                onMouseEnter={() => setHoveredNode(device)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle r="34" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 3">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0"
                      to="360"
                      dur="10s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Pulsing ring for alerts */}
                {isAlert && (
                  <circle r="28" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8">
                    <animate attributeName="r" values="24;36;24" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Main Node Circle */}
                <circle
                  r="24"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={nodeFilter}
                />

                {/* Status Indicator Pip */}
                <circle
                  cx="15"
                  cy="-15"
                  r="6"
                  fill={isAlert ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />

                {/* Embedded HTML Icon */}
                <foreignObject x="-12" y="-12" width="24" height="24">
                  <div className="flex items-center justify-center w-full h-full pointer-events-none">
                    {getDeviceIcon(device.type, isAlert)}
                  </div>
                </foreignObject>

                {/* Node Label Below */}
                <text
                  x="0"
                  y="38"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontFamily="sans-serif"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {device.name.split(' (')[0]}
                </text>
                <text
                  x="0"
                  y="51"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="monospace"
                  className="pointer-events-none"
                >
                  {device.ip}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredNode && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl border border-slate-700 shadow-2xl max-w-xs transition-opacity duration-150"
            style={{
              left: Math.min(
                Math.max((nodePositions[hoveredNode.id]?.x || 500) * zoom + pan.x - 70, 20),
                780
              ),
              top: Math.max((nodePositions[hoveredNode.id]?.y || 300) * zoom + pan.y - 120, 20),
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-xs text-white truncate">{hoveredNode.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  hoveredNode.status === 'alert'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : hoveredNode.status === 'warn'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {hoveredNode.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-0.5 font-mono">
              <div>IP: {hoveredNode.ip}</div>
              <div>Type: {hoveredNode.type}</div>
              <div>Vendor: {hoveredNode.vendor}</div>
              <div>Protocols: {hoveredNode.protocols.join(', ')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
            <span>{getTranslation(language, 'legendNormal')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
            <span>{getTranslation(language, 'legendWarning')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse shadow-sm" />
            <span>{getTranslation(language, 'legendAlert')}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Flows: Cyan=Modbus &bull; Orange=RTSP &bull; Purple=MQTT &bull; Red=Anomaly</span>
        </div>
      </div>
    </div>
  );
};
