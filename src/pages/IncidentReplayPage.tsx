import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { ReplayTick } from '../types';
import {
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const IncidentReplayPage: React.FC = () => {
  const [ticks, setTicks] = useState<ReplayTick[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const data = await apiClient.getReplay();
      if (data && data.ticks) {
        setTicks(data.ticks);
        setCurrentIndex(2); // Start at T+48 (Anomaly onset)
      }
    }
    load();
  }, []);

  // Auto playback interval
  useEffect(() => {
    if (!isPlaying || ticks.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev < ticks.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, ticks.length]);

  if (ticks.length === 0) {
    return <div className="text-gray-400 text-xs p-6">Loading Incident Replay Engine...</div>;
  }

  const currentTick = ticks[currentIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
            <span>Incident Replay & Timeline State Reconstruction</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Module 5: Step through the cascade timeline from nominal baseline T+00 to near-total collapse T+330
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-900 p-1.5 rounded-xl border border-slate-200 dark:border-gray-800">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(0);
            }}
            title="Reset to T+00"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0}
            title="Step Backward"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white shadow-sm"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Replay'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(prev => Math.min(ticks.length - 1, prev + 1));
            }}
            disabled={currentIndex === ticks.length - 1}
            title="Step Forward"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interactive Timeline Track / Scrubber */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider font-mono">
            Incident Epoch Timeline
          </span>
          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 dark:text-cyan-400 dark:bg-cyan-950/60 dark:border-cyan-800">
            Selected: {currentTick.tick} ({currentTick.title})
          </span>
        </div>

        {/* Step Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {ticks.map((t, idx) => {
            const isActive = idx === currentIndex;
            const isPassed = idx < currentIndex;

            return (
              <button
                key={t.tick}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/90 ring-2 ring-blue-400 shadow-sm dark:border-cyan-400 dark:bg-cyan-950/60 dark:ring-cyan-500/50 dark:shadow-lg'
                    : isPassed
                    ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400 dark:hover:bg-gray-900'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:border-gray-800/40 dark:bg-gray-950/40 dark:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className={`font-mono text-xs font-black ${isActive ? 'text-blue-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                  {t.tick}
                </div>
                <div className={`text-[10px] font-medium leading-snug line-clamp-2 mt-1 ${isActive ? 'text-blue-800 dark:text-cyan-200' : 'text-slate-600 dark:text-gray-400'}`}>
                  {t.title}
                </div>
                {t.activeChange && (
                  <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800 font-mono font-bold">
                    {t.activeChange}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current State Narrative */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/80 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">{currentTick.title}</h3>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{currentTick.summary.healthy} Healthy</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold">{currentTick.summary.degrading} Degrading</span>
              <span className="text-red-700 dark:text-red-400 font-bold">{currentTick.summary.critical} Critical</span>
            </div>
          </div>
          <p className="text-xs text-slate-700 dark:text-gray-300 leading-relaxed font-sans">{currentTick.description}</p>
        </div>
      </div>

      {/* Services Snapshot at this Timeline Step */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
            Cluster Telemetry Snapshot at {currentTick.tick}
          </h3>
          <span className="text-xs text-slate-500 dark:text-gray-400 font-mono">
            Reconstructed from metrics_stream.csv
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 dark:bg-gray-950/80 text-[10px] uppercase font-bold text-slate-700 dark:text-gray-400 tracking-wider border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3">P99</th>
                <th className="py-3 px-3">Errors</th>
                <th className="py-3 px-3">CPU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
              {currentTick.services.map((svc: any) => (
                <tr key={svc.service_id || svc.id} className="hover:bg-slate-50 dark:hover:bg-gray-900/50">
                  <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{svc.service_id || svc.id}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        svc.status === 'HEALTHY'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : svc.status === 'DEGRADING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-500/20 dark:text-red-300'
                      }`}
                    >
                      {svc.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-blue-700 dark:text-cyan-300 font-bold">{svc.response_time_ms} ms</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">{svc.latency_p99_ms} ms</td>
                  <td className="py-2.5 px-3 text-red-600 dark:text-red-400 font-bold">{svc.error_rate}%</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">{svc.cpu_usage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
