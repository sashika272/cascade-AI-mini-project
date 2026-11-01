import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from '../router';

export const TermsPage: React.FC = () => {
  const [accepted, setAccepted] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold uppercase font-mono tracking-tight text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <span>Terms of Service & SRE Operating Agreement</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          MachineMind AI Feature 3: Legal, operational, and algorithmic liability standards for autonomous recovery
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-[#0F172A] p-6 space-y-5">
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            1. Scope of Observability & Autonomous Intervention
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            CASCADE // AI provides real-time service dependency analysis, configuration anomaly detection,
            and root-cause identification for cascading failure prevention across distributed microservice topologies.
            The system is intended to assist Site Reliability Engineers (SREs), Incident Commanders, and DevOps teams.
          </p>
        </section>

        <section className="space-y-2 border-t border-gray-800/80 pt-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            2. AI Recovery Recommendations & Human-in-the-Loop Principle
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            All AI-recommended recovery actions (Quick Rollback, Safe Rate-Limit, Optimized Pod Scale) provide
            simulated blast radius and confidence scores based on Monte Carlo physics decay models.
            Unless explicitly configured in Autonomous Self-Healing mode by an authorized Admin, all remediation
            actions require human verification and authorization before execution in production environments.
          </p>
        </section>

        <section className="space-y-2 border-t border-gray-800/80 pt-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            3. Service Level Objectives (SLO) & MTTR Guarantees
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            CASCADE // AI targets an operational mean-time-to-acknowledge (MTTA) under 2 minutes and mean-time-to-recover
            (MTTR) reduction of at least 65% through rapid identification and rejection of downstream decoy configuration changes.
          </p>
        </section>

        <section className="space-y-2 border-t border-gray-800/80 pt-4">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            4. Academic & Research Acknowledgement
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            This platform implements methodologies established in academic literature, specifically the IEEE survey on
            cascading failure propagation in microservice systems (Soldani & Brogi, 2022). Developed at V.S.B. Engineering
            College under the authorship of K.N. Sashika and S. Vikashini, supervised by Mr. C. Kavin Prakash, M.E.
          </p>
        </section>

        {/* User Acceptance Box */}
        <div className="rounded-xl border border-gray-800 bg-gray-950/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">SRE Agreement Status: Active & Accepted</div>
              <div className="text-[11px] text-gray-400">Digital signature logged for active session</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white shadow hover:from-cyan-500 hover:to-blue-500 transition"
          >
            <span>Return to Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
