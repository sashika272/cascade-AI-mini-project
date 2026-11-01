import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, Check, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState({
    essential: true, // Always required for JWT & session persistence
    telemetry: true, // Prometheus / OpenTelemetry stream
    aiAnalytics: true // Predictive failure models & RCA logging
  });

  useEffect(() => {
    const saved = localStorage.getItem('cascade_cookie_consent');
    if (!saved) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { essential: true, telemetry: true, aiAnalytics: true, timestamp: new Date().toISOString() };
    localStorage.setItem('cascade_cookie_consent', JSON.stringify(consent));
    setVisible(false);
  };

  const handleRejectAll = () => {
    const consent = { essential: true, telemetry: false, aiAnalytics: false, timestamp: new Date().toISOString() };
    localStorage.setItem('cascade_cookie_consent', JSON.stringify(consent));
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = { ...prefs, essential: true, timestamp: new Date().toISOString() };
    localStorage.setItem('cascade_cookie_consent', JSON.stringify(consent));
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-[#0F172A]">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 rounded-lg bg-cyan-50 p-2 border border-cyan-200 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                SRE Telemetry & Cookie Preferences
              </h4>
              <button
                onClick={() => setVisible(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-gray-300">
              CASCADE // AI stores essential session cookies and ingests microservice observability telemetry
              to compute real-time cascading failure graphs and root-cause predictions.
            </p>

            {showPreferences && (
              <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] dark:border-gray-800 dark:bg-gray-950/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-gray-200">Essential Session & JWT</span>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500">Required for secure authentication & RBAC</p>
                  </div>
                  <span className="rounded bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold dark:bg-gray-800 dark:text-gray-400">Required</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-gray-800/60">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-gray-200">Telemetry Streaming</span>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500">Live CPU, latency, and throughput metrics</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.telemetry}
                    onChange={e => setPrefs({ ...prefs, telemetry: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-gray-800/60">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-gray-200">AI Predictive Modeling</span>
                    <p className="text-[10px] text-slate-500 dark:text-gray-500">Scikit-learn anomaly weights and hazard estimation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.aiAnalytics}
                    onChange={e => setPrefs({ ...prefs, aiAnalytics: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
              {showPreferences ? (
                <button
                  onClick={handleSavePreferences}
                  className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition cursor-pointer"
                >
                  Save Preferences
                </button>
              ) : (
                <>
                  <button
                    onClick={handleAcceptAll}
                    className="rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition cursor-pointer"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowPreferences(!showPreferences)}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 transition ml-auto cursor-pointer"
                  >
                    <Settings className="h-3 w-3" />
                    <span>Customize</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
