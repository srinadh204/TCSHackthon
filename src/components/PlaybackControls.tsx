import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Gauge,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentIndex: number;
  totalFlows: number;
  currentSimulatedTime: string;
  onTriggerScenario: (scenario: 'exfil' | 'ssh' | 'scan') => void;
  language: Language;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  currentIndex,
  totalFlows,
  currentSimulatedTime,
  onTriggerScenario,
  language,
}) => {
  const speeds = [1, 2, 5, 10];
  const progressPercent = totalFlows > 0 ? (currentIndex / totalFlows) * 100 : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Playback Transport Buttons */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>{getTranslation(language, 'pauseDemo')}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>{getTranslation(language, 'startDemo')}</span>
            </>
          )}
        </button>

        {/* Step Forward Button */}
        <button
          onClick={onStepForward}
          disabled={isPlaying}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors border border-slate-700"
          title={getTranslation(language, 'stepForward')}
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title={getTranslation(language, 'resetDemo')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-1">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Simulated Clock */}
      <div className="flex-1 w-full md:max-w-md flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5" />
          <span>{currentSimulatedTime}</span>
        </div>

        <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
          {currentIndex}/{totalFlows}
        </span>
      </div>

      {/* Quick Incident Scenario Triggers */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-mono text-slate-400 uppercase hidden lg:inline mr-1">
          {getTranslation(language, 'triggerScenario')}:
        </span>
        <button
          onClick={() => onTriggerScenario('exfil')}
          className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          title="Simulate CCTV 42MB exfiltration to foreign IP"
        >
          <Zap className="w-3 h-3 text-red-400" />
          <span>Camera Exfil</span>
        </button>
        <button
          onClick={() => onTriggerScenario('ssh')}
          className="px-2 py-1 rounded-lg bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/30 text-orange-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          title="Simulate unauthorized SSH session on PLC-1"
        >
          <Zap className="w-3 h-3 text-orange-400" />
          <span>PLC SSH Hijack</span>
        </button>
        <button
          onClick={() => onTriggerScenario('scan')}
          className="px-2 py-1 rounded-lg bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/30 text-yellow-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
          title="Simulate rogue internal workstation scanning Modbus"
        >
          <Zap className="w-3 h-3 text-yellow-400" />
          <span>Rogue Scan</span>
        </button>
      </div>
    </div>
  );
};
