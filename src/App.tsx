import React, { useState, useEffect, useRef } from 'react';
import { Device, NetworkFlow, Alert, Language } from './types';
import {
  INITIAL_DEVICES,
  SIMULATED_FLOW_DATASET,
  INITIAL_ALERTS,
} from './data/mockFactoryData';
import { translations, getTranslation } from './utils/i18n';
import { classifyDeviceByTraffic } from './utils/classifier';
import { generateTrafficStory } from './utils/storyEngine';
import { DeviceMap } from './components/DeviceMap';
import { DeviceList } from './components/DeviceList';
import { AlertFeed } from './components/AlertFeed';
import { DeviceDetailDrawer } from './components/DeviceDetailDrawer';
import { ThreatIntelModal } from './components/ThreatIntelModal';
import { VisualAuditModal } from './components/VisualAuditModal';
import { PlaybackControls } from './components/PlaybackControls';
import {
  Factory,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Globe,
  Radio,
  Layers,
  Camera,
  Search,
  CheckCircle2,
  FileSearch,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'topology' | 'devices' | 'alerts'>('topology');

  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [activeFlows, setActiveFlows] = useState<NetworkFlow[]>([]);
  const [currentIndex, setCurrentIndex] = useState(6);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Modal states
  const [threatIntelData, setThreatIntelData] = useState<{
    ip: string;
    protocol: string;
    deviceType: string;
  } | null>(null);
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  // Playback timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Current simulated timestamp
  const currentSimulatedTime =
    SIMULATED_FLOW_DATASET[Math.min(currentIndex, SIMULATED_FLOW_DATASET.length - 1)]?.timestamp
      ? new Date(
          SIMULATED_FLOW_DATASET[Math.min(currentIndex, SIMULATED_FLOW_DATASET.length - 1)].timestamp
        ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '10:15:00 AM';

  // Advance simulation by 1 flow
  const advanceSimulation = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1 >= SIMULATED_FLOW_DATASET.length ? 0 : prev + 1;
      const flow = SIMULATED_FLOW_DATASET[nextIndex];

      // Update active flows sliding window
      setActiveFlows((curr) => {
        const updated = [...curr.slice(-3), flow];
        return updated;
      });

      // Update bytes and device status
      setDevices((prevDevices) =>
        prevDevices.map((d) => {
          let updated = { ...d };
          if (d.ip === flow.srcIp) {
            updated.bytesOut += flow.bytes;
            updated.lastSeen = flow.timestamp;
            if (!updated.protocols.includes(flow.protocol)) {
              updated.protocols = [...updated.protocols, flow.protocol];
            }
          }
          if (d.ip === flow.dstIp) {
            updated.bytesIn += flow.bytes;
            updated.lastSeen = flow.timestamp;
          }
          if (flow.isAnomaly && (d.ip === flow.srcIp || d.ip === flow.dstIp)) {
            updated.status = 'alert';
            updated.activeAlertsCount += 1;
          }
          return updated;
        })
      );

      // Trigger anomaly alert if flow is marked anomaly and not already generated
      if (flow.isAnomaly) {
        setAlerts((prevAlerts) => {
          const alreadyExists = prevAlerts.some((a) => a.flowId === flow.id);
          if (alreadyExists) return prevAlerts;

          const srcDev = devices.find((d) => d.ip === flow.srcIp);
          const dstDev = devices.find((d) => d.ip === flow.dstIp);

          let ruleType: any = 'NEW_EXTERNAL_CONNECTION';
          if (flow.protocol === 'SSH') ruleType = 'UNUSUAL_PROTOCOL';
          else if (flow.bytes > 1000000) ruleType = 'DATA_EXFILTRATION_SPIKE';
          else if (flow.dstIp.startsWith('192.168.1.')) ruleType = 'UNEXPECTED_PEER_COMM';

          const newAlert: Alert = {
            id: `alt-${Date.now()}-${flow.id}`,
            timestamp: flow.timestamp,
            rule: ruleType,
            severity: 'CRITICAL',
            deviceIp: flow.srcIp,
            deviceId: srcDev?.id || 'dev-unknown',
            deviceName: srcDev?.name || `Device ${flow.srcIp}`,
            deviceType: srcDev?.type || 'IoT Gateway',
            dstIp: flow.dstIp,
            dstCountry: flow.dstIp.startsWith('13.') ? 'Singapore' : 'Foreign IP',
            dstPort: flow.dstPort,
            protocol: flow.protocol,
            bytes: flow.bytes,
            status: 'active',
            flowId: flow.id,
            ...generateTrafficStory({
              rule: ruleType,
              deviceIp: flow.srcIp,
              deviceName: srcDev?.name || `Device ${flow.srcIp}`,
              deviceType: srcDev?.type || 'IoT Gateway',
              dstIp: flow.dstIp,
              dstCountry: flow.dstIp.startsWith('13.') ? 'Singapore' : 'Foreign IP',
              dstPort: flow.dstPort,
              bytes: flow.bytes,
              severity: 'CRITICAL',
            }),
          };

          return [newAlert, ...prevAlerts];
        });
      }

      return nextIndex;
    });
  };

  // Run simulation interval
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(2500 / speed, 300);
      timerRef.current = setInterval(advanceSimulation, intervalMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, devices]);

  // Scenario quick triggers
  const handleTriggerScenario = (scenario: 'exfil' | 'ssh' | 'scan') => {
    if (scenario === 'exfil') {
      const flow = SIMULATED_FLOW_DATASET.find((f) => f.id === 'flow-7');
      if (flow) {
        setActiveFlows((f) => [...f.slice(-2), flow]);
        setDevices((devs) =>
          devs.map((d) => (d.id === 'dev-cam-1' ? { ...d, status: 'alert' } : d))
        );
        setSelectedDeviceId('dev-cam-1');
        setActiveTab('alerts');
      }
    } else if (scenario === 'ssh') {
      const flow = SIMULATED_FLOW_DATASET.find((f) => f.id === 'flow-10');
      if (flow) {
        setActiveFlows((f) => [...f.slice(-2), flow]);
        setDevices((devs) =>
          devs.map((d) => (d.id === 'dev-plc-1' ? { ...d, status: 'alert' } : d))
        );
        setSelectedDeviceId('dev-plc-1');
        setActiveTab('alerts');
      }
    } else if (scenario === 'scan') {
      const flow = SIMULATED_FLOW_DATASET.find((f) => f.id === 'flow-13');
      if (flow) {
        setActiveFlows((f) => [...f.slice(-2), flow]);
        setDevices((devs) =>
          devs.map((d) => (d.id === 'dev-plc-2' ? { ...d, status: 'warn' } : d))
        );
        setSelectedDeviceId('dev-plc-2');
        setActiveTab('alerts');
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setDevices(INITIAL_DEVICES);
    setAlerts(INITIAL_ALERTS);
    setActiveFlows([]);
    setSelectedDeviceId(null);
  };

  const handleOpenThreatIntel = (ip: string, protocol: string, deviceType: string) => {
    setThreatIntelData({ ip, protocol, deviceType });
    setIsThreatModalOpen(true);
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((curr) => curr.filter((a) => a.id !== alertId));
  };

  // Metrics calculation
  const totalDevs = devices.length;
  const criticalCount = devices.filter((d) => d.status === 'alert').length;
  const warnCount = devices.filter((d) => d.status === 'warn').length;
  const normalCount = devices.filter((d) => d.status === 'ok').length;

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Factory className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {getTranslation(language, 'appTitle')}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  OT/IoT Observability
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {getTranslation(language, 'appSubtitle')} &bull; Pune Plant Unit 3
              </p>
            </div>
          </div>

          {/* Quick Actions & Language Switcher */}
          <div className="flex items-center gap-3">
            {/* Visual Hardware Audit Button */}
            <button
              onClick={() => setIsVisualModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Audit physical cabinet or device photo via Gemini 4 Argon"
            >
              <Camera className="w-3.5 h-3.5 text-violet-400" />
              <span>{getTranslation(language, 'visualAuditBtn')}</span>
            </button>

            {/* Threat Intel Search Button */}
            <button
              onClick={() => handleOpenThreatIntel('13.248.118.1', 'TCP', 'CCTV Camera')}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Google Search Threat Intel & CVEs via Gemini 3.8 Flash"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span>Threat Intel</span>
            </button>

            {/* Language Selector Dropdown [EN | HI | TA] */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                  language === 'hi'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors ${
                  language === 'ta'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-5 flex-1 flex flex-col gap-5">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Total Devices */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              {getTranslation(language, 'totalDevices')}
            </div>
            <div className="text-2xl font-bold font-mono text-white flex items-center justify-between">
              <span>{totalDevs}</span>
              <Layers className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">192.168.10.0/24 Subnet</div>
          </div>

          {/* Card 2: Healthy */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
              {getTranslation(language, 'healthyDevices')}
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 flex items-center justify-between">
              <span>{normalCount}</span>
              <ShieldCheck className="w-5 h-5 text-emerald-500/80" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Modbus/OPC-UA Verified</div>
          </div>

          {/* Card 3: Warnings */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-1">
              {getTranslation(language, 'warningDevices')}
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 flex items-center justify-between">
              <span>{warnCount}</span>
              <AlertTriangle className="w-5 h-5 text-amber-500/80" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Uncataloged Peer Traffic</div>
          </div>

          {/* Card 4: Critical Incidents */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-red-500/30 shadow-md shadow-red-950/20">
            <div className="text-[11px] font-mono text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>{getTranslation(language, 'criticalDevices')}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-400 flex items-center justify-between">
              <span>{criticalCount}</span>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Active Stories Generated</div>
          </div>

          {/* Card 5: Traffic Rate */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md col-span-2 sm:col-span-1">
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              {getTranslation(language, 'activeFlowsRate')}
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400 flex items-center justify-between">
              <span>42.8 MB/s</span>
              <Activity className="w-5 h-5 text-cyan-500/80" />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {SIMULATED_FLOW_DATASET.length} Replayable Events
            </div>
          </div>
        </div>

        {/* Playback Simulation Toolbar */}
        <PlaybackControls
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onStepForward={advanceSimulation}
          onReset={handleReset}
          speed={speed}
          onSpeedChange={(s) => setSpeed(s)}
          currentIndex={currentIndex}
          totalFlows={SIMULATED_FLOW_DATASET.length}
          currentSimulatedTime={currentSimulatedTime}
          onTriggerScenario={handleTriggerScenario}
          language={language}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                activeTab === 'topology'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{getTranslation(language, 'tabTopology')}</span>
            </button>

            <button
              onClick={() => setActiveTab('devices')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                activeTab === 'devices'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{getTranslation(language, 'tabDevices')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {devices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                activeTab === 'alerts'
                  ? 'bg-red-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{getTranslation(language, 'tabAlerts')}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-950/80 text-red-300 font-bold">
                {alerts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Viewport Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Main Display: Device Map or Device List */}
          <div className="lg:col-span-8 flex flex-col">
            {activeTab === 'topology' && (
              <DeviceMap
                devices={devices}
                activeFlows={activeFlows}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={(id) => setSelectedDeviceId(id)}
                language={language}
              />
            )}

            {activeTab === 'devices' && (
              <DeviceList
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={(id) => setSelectedDeviceId(id)}
                language={language}
                onOpenVisualAudit={() => setIsVisualModalOpen(true)}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertFeed
                alerts={alerts}
                onSelectDevice={(id) => setSelectedDeviceId(id)}
                onOpenThreatIntel={handleOpenThreatIntel}
                language={language}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            )}
          </div>

          {/* Right Panel: Alert Feed when in map/device view, or Quick Stats */}
          <div className="lg:col-span-4 flex flex-col">
            {activeTab !== 'alerts' ? (
              <AlertFeed
                alerts={alerts}
                onSelectDevice={(id) => setSelectedDeviceId(id)}
                onOpenThreatIntel={handleOpenThreatIntel}
                language={language}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            ) : (
              <DeviceList
                devices={devices}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={(id) => setSelectedDeviceId(id)}
                language={language}
                onOpenVisualAudit={() => setIsVisualModalOpen(true)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Slide-out Device Detail Drawer */}
      {selectedDeviceId && (
        <DeviceDetailDrawer
          device={selectedDevice}
          alerts={alerts}
          onClose={() => setSelectedDeviceId(null)}
          language={language}
          onOpenThreatIntel={handleOpenThreatIntel}
          onOpenVisualAudit={() => setIsVisualModalOpen(true)}
        />
      )}

      {/* Threat Intel Modal (Google Search Grounding via gemini-3.8-flash) */}
      <ThreatIntelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
        targetIp={threatIntelData?.ip || '13.248.118.1'}
        protocol={threatIntelData?.protocol || 'TCP'}
        deviceType={threatIntelData?.deviceType || 'IoT Device'}
        language={language}
      />

      {/* Visual Hardware Audit Modal (Gemini 4 Argon) */}
      <VisualAuditModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        language={language}
      />
    </div>
  );
}
