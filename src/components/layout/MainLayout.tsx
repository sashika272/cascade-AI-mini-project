import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Sparkles, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Outlet, useNavigate } from '../../router';
import { CookieConsentBanner } from '../common/CookieConsentBanner';

export const MainLayout: React.FC = () => {
  const [copilotOpen, setCopilotOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#070A0F] dark:text-gray-100 flex flex-col font-sans transition-colors duration-150">
      <Header onOpenCopilot={() => setCopilotOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F1F5F9] text-slate-900 dark:bg-gradient-to-b dark:from-[#090D14] dark:to-[#0B0F17] dark:text-gray-100">
          <Outlet />
        </main>
      </div>

      {/* AI Copilot Quick Assistant Modal */}
      {copilotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-cyan-500/30 dark:bg-[#0F172A] dark:shadow-cyan-500/10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">CASCADE AI Incident Copilot</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Autonomous Causal Inference & SRE Advisory</p>
                </div>
              </div>
              <button
                onClick={() => setCopilotOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs">
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 space-y-2 dark:border-red-500/30 dark:bg-red-950/20">
                <div className="flex items-center justify-between font-semibold text-red-600 dark:text-red-400">
                  <span>Active SEV-1 Outage Verdict</span>
                  <span className="font-mono bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-2 py-0.5 rounded text-[11px]">Confidence: 98.6%</span>
                </div>
                <p className="text-slate-700 dark:text-gray-300">
                  Primary root cause identified: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">cfg-1003</span> applied to <span className="text-slate-900 dark:text-white font-semibold">network-gateway</span> at T+42 (10:41:18 AM).
                </p>
                <div className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300/90 pt-1 border-t border-red-200 dark:border-red-900/40">
                  <span className="font-bold">DECOY REJECTED:</span>
                  <span>cfg-2001 at payments-service occurred 47s AFTER onset (T+95) at chain terminus.</span>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3.5 space-y-2 dark:border-blue-500/20 dark:bg-blue-950/20">
                <div className="flex items-center justify-between font-semibold text-blue-600 dark:text-blue-400">
                  <span>Recommended Remediation</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Est. Recovery: 45s</span>
                </div>
                <p className="text-slate-700 dark:text-gray-300">
                  Execute Quick Recovery: Rollback <span className="font-mono text-slate-900 dark:text-white font-semibold">proxy_read_timeout_ms</span> from 250ms back to 5000ms on ingress.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
              <button
                onClick={() => setCopilotOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setCopilotOpen(false);
                  navigate('/recovery-advisor');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20"
              >
                <span>Proceed to Recovery Advisor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SRE Telemetry & Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
};
