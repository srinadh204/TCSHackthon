import React, { useState } from 'react';
import { Alert, Language } from '../types';
import { getTranslation } from '../utils/i18n';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Volume2,
  Loader2,
  Search,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Video,
  Radio,
  Server,
  Ban,
} from 'lucide-react';

interface AlertFeedProps {
  alerts: Alert[];
  onSelectDevice: (deviceId: string) => void;
  onOpenThreatIntel: (ip: string, protocol: string, deviceType: string) => void;
  language: Language;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onSelectDevice,
  onOpenThreatIntel,
  language,
  onAcknowledgeAlert,
}) => {
  const [playingAlertId, setPlayingAlertId] = useState<string | null>(null);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(
    alerts.length > 0 ? alerts[0].id : null
  );
  const [ttsError, setTtsError] = useState<string | null>(null);

  const handlePlayTTS = async (alert: Alert) => {
    try {
      setPlayingAlertId(alert.id);
      setTtsError(null);

      const titleText = alert.title[language] || alert.title.en;
      const storyText = alert.story[language] || alert.story.en;
      const actionText = alert.action[language] || alert.action.en;
      const fullSpeechPrompt = `${titleText}. ${storyText}. Immediate action: ${actionText}`;

      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullSpeechPrompt,
          language,
          speaker: 'Puck',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data && data.audioData) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioData}`);
        audio.onended = () => setPlayingAlertId(null);
        audio.onerror = () => {
          setPlayingAlertId(null);
        };
        await audio.play();
      } else {
        // High quality browser voice synthesis fallback
        if ('speechSynthesis' in window) {
          const titleText = alert.title[language] || alert.title.en;
          const storyText = alert.story[language] || alert.story.en;
          const utterance = new SpeechSynthesisUtterance(`${titleText}. ${storyText}`);
          if (language === 'hi') utterance.lang = 'hi-IN';
          else if (language === 'ta') utterance.lang = 'ta-IN';
          else utterance.lang = 'en-US';
          utterance.onend = () => setPlayingAlertId(null);
          utterance.onerror = () => setPlayingAlertId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingAlertId(null);
        }
      }
    } catch {
      setPlayingAlertId(null);
      if ('speechSynthesis' in window) {
        const titleText = alert.title[language] || alert.title.en;
        const storyText = alert.story[language] || alert.story.en;
        const utterance = new SpeechSynthesisUtterance(`${titleText}. ${storyText}`);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            {getTranslation(language, 'severityCritical')}
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            {getTranslation(language, 'severityHigh')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Info className="w-3.5 h-3.5" />
            {getTranslation(language, 'severityMedium')}
          </span>
        );
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'PLC':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'CCTV Camera':
        return <Video className="w-4 h-4 text-amber-400" />;
      case 'SCADA Server':
        return <Server className="w-4 h-4 text-cyan-400" />;
      default:
        return <Radio className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-bold text-slate-100">
              {getTranslation(language, 'alertFeedTitle')}
            </h3>
            <span className="bg-red-500/20 text-red-300 font-mono text-xs px-2 py-0.5 rounded-full border border-red-500/30">
              {alerts.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {getTranslation(language, 'alertFeedSubtitle')}
          </p>
        </div>
      </div>

      {ttsError && (
        <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>{ttsError} (Fallback to browser audio active)</span>
          <button onClick={() => setTtsError(null)} className="hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Alert Cards Container */}
      <div className="mt-3 space-y-3 overflow-y-auto max-h-[540px] pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            {getTranslation(language, 'noAlertsFound')}
          </div>
        ) : (
          alerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const isPlaying = playingAlertId === alert.id;
            const title = alert.title[language] || alert.title.en;
            const story = alert.story[language] || alert.story.en;
            const action = alert.action[language] || alert.action.en;

            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-slate-950/80 border-red-500/40 hover:border-red-500/70 shadow-lg shadow-red-950/20'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Clickable Header */}
                <div
                  className="p-3.5 cursor-pointer flex items-start justify-between gap-3"
                  onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {getSeverityBadge(alert.severity)}
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDevice(alert.deviceId);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                      >
                        {getDeviceIcon(alert.deviceType)}
                        <span>{alert.deviceName.split(' (')[0]}</span>
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                      {title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* TTS Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayTTS(alert);
                      }}
                      disabled={isPlaying}
                      className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
                      title={getTranslation(language, 'playVoiceAlert')}
                    >
                      {isPlaying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span className="hidden sm:inline text-[11px]">TTS...</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          <span className="hidden sm:inline text-[11px]">
                            {language === 'hi' ? 'सुनें' : language === 'ta' ? 'கேட்க' : 'Listen'}
                          </span>
                        </>
                      )}
                    </button>

                    <button className="text-slate-400 hover:text-slate-200 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Story & Guidance */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/70 bg-slate-900/50 space-y-3">
                    {/* What Happened (Plain Language) */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[11px] font-bold text-amber-400 tracking-wide uppercase mb-1">
                        {getTranslation(language, 'whatHappened')}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {story}
                      </p>
                    </div>

                    {/* Immediate Recommended Action */}
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
                      <div className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase mb-1 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {getTranslation(language, 'recommendedStep')}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed">
                        {action}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {alert.dstIp && (
                        <button
                          onClick={() =>
                            onOpenThreatIntel(alert.dstIp!, alert.protocol, alert.deviceType)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Google Search Threat Intel ({alert.dstIp})</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                        >
                          {getTranslation(language, 'markInvestigated')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
