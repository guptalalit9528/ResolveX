import React, { useState, useEffect } from 'react';
import { Role, ComplaintStatus, Priority, TRANSITION_RULES } from '@resolvex/shared';
import { Navbar } from './components/Navbar';
import { StatusChip } from './components/StatusChip';
import { PriorityBadge } from './components/PriorityBadge';
import {
  Smartphone,
  CheckCircle,
  Eye,
  Sliders,
  Database,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<Role>(Role.STUDENT);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 transition-colors">
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-brand-blue rounded-2xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Layers size={360} />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium text-brand-sky">
              <Sparkles size={14} />
              <span>Phase 1: Foundation & Brand Shell Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Every Problem Deserves a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-teal">
                Resolution.
              </span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Welcome to <strong className="text-white">ResolveX</strong> — the multi-organization problem resolution
              platform built for fast mobile triage, auditable workflows, and transparent lifecycle tracking.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle size={14} /> WCAG 2.2 AA Contrast Ready
              </span>
              <span className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Smartphone size={14} /> 360px Mobile-First Layout
              </span>
              <span className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                <Database size={14} /> Multi-Tenant Scoped
              </span>
            </div>
          </div>
        </section>

        {/* Role Perspectives Simulator */}
        <section className="bg-white dark:bg-navy-900 rounded-xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Eye className="text-brand-blue dark:text-brand-sky" size={20} />
                <span>Simulated Perspective: {currentRole.replace('_', ' ')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dynamic UI adapts automatically to user permissions and mobile requirements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Target Viewport:</span>
              <span className="text-xs font-mono bg-slate-100 dark:bg-navy-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                min 360px
              </span>
            </div>
          </div>

          {/* Role specific content card */}
          {currentRole === Role.STUDENT && (
            <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-navy-800/60 border border-blue-100 dark:border-navy-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue dark:text-brand-sky">
                  Student Action Flow
                </span>
                <span className="text-xs text-slate-500">Target Time: &lt; 2 minutes</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Students can report maintenance or safety issues with photo verification in 3 simple steps. Privacy is
                protected: your identity is masked to maintenance staff by default.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="touch-target px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition">
                  + New Complaint
                </button>
                <button className="touch-target px-4 py-2 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-navy-600 rounded-lg text-xs font-medium hover:bg-slate-50">
                  Track My Complaints (3)
                </button>
              </div>
            </div>
          )}

          {currentRole === Role.STAFF && (
            <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-navy-800/60 border border-emerald-100 dark:border-navy-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-brand-teal">
                  Maintenance Staff Action Bar (One-Hand 3-Tap Flow)
                </span>
                <span className="text-xs text-slate-500">Thumb-Zone Optimized</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Staff receive assigned work directly on their mobile devices without seeing private student info. Start work
                or complete tasks with photo proof in 3 taps.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button className="touch-target px-4 py-2.5 bg-brand-blue text-white rounded-lg text-xs font-semibold text-center">
                  1. Start Work (In Progress)
                </button>
                <button className="touch-target px-4 py-2.5 bg-amber-500 text-white rounded-lg text-xs font-semibold text-center">
                  2. Put On Hold (Need Parts)
                </button>
                <button className="touch-target px-4 py-2.5 bg-brand-teal text-white rounded-lg text-xs font-semibold text-center">
                  3. Resolve with Photo Proof
                </button>
              </div>
            </div>
          )}

          {currentRole === Role.FACILITY_MANAGER && (
            <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-navy-800/60 border border-indigo-100 dark:border-navy-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  Facility Manager Triage Center
                </span>
                <span className="text-xs text-slate-500">Auto SLA Monitoring</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Review unrouted complaints, confirm provisional priorities, assign tasks to staff, and monitor SLA breach
                timers before escalations occur.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="touch-target px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
                  Unrouted Queue (2)
                </button>
                <button className="touch-target px-3.5 py-2 bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-navy-600 rounded-lg text-xs font-medium">
                  Review Priorities (5)
                </button>
                <button className="touch-target px-3.5 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-lg text-xs font-semibold">
                  Overdue Acknowledgment (1)
                </button>
              </div>
            </div>
          )}

          {currentRole === Role.ADMINISTRATOR && (
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Administrator Console & Governance
                </span>
                <span className="text-xs text-slate-500">Append-Only Audit</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Manage organization settings, email allowlists, departments, staff accounts, dispute adjudication, and inspect
                tamper-proof append-only audit trails.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="touch-target px-3.5 py-2 bg-navy-900 dark:bg-brand-blue text-white rounded-lg text-xs font-semibold">
                  Organization Settings
                </button>
                <button className="touch-target px-3.5 py-2 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-navy-600 rounded-lg text-xs font-medium">
                  Dispute Adjudication (1)
                </button>
                <button className="touch-target px-3.5 py-2 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-navy-600 rounded-lg text-xs font-medium">
                  Append-Only Audit Logs
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Status Chip Accessible Matrix (NFR-ACC-03) */}
        <section className="bg-white dark:bg-navy-900 rounded-xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Activity className="text-brand-teal" size={20} />
              <span>Accessible Status Matrix (NFR-ACC-03)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strict rule: status is never conveyed by color alone. Every status has a text label, unique Lucide icon,
              and 4.5:1 minimum contrast.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {Object.values(ComplaintStatus).map((status) => (
              <StatusChip key={status} status={status} />
            ))}
          </div>
        </section>

        {/* Priority & Safety Hazard Badges */}
        <section className="bg-white dark:bg-navy-900 rounded-xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              <span>Priority Levels & Safety Hazard Flags</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Safety hazards bypass standard queues and trigger immediate manager notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(Priority).map((priority) => (
              <div
                key={priority}
                className="p-3 rounded-lg border border-slate-200 dark:border-navy-800 flex flex-col gap-2 items-start"
              >
                <PriorityBadge priority={priority} />
                <PriorityBadge priority={priority} isSafetyHazard={true} />
              </div>
            ))}
          </div>
        </section>

        {/* Transition Rules Preview */}
        <section className="bg-white dark:bg-navy-900 rounded-xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Sliders className="text-brand-blue" size={20} />
              <span>Workflow Transition Engine (TR-01 to TR-14)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authoritative state transitions defined in shared package and validated across roles.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-navy-700">
                <tr>
                  <th className="py-2.5 px-3">Rule ID</th>
                  <th className="py-2.5 px-3">From</th>
                  <th className="py-2.5 px-3">To</th>
                  <th className="py-2.5 px-3">Authorized Roles</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {TRANSITION_RULES.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50">
                    <td className="py-2 px-3 font-mono font-bold text-brand-blue dark:text-brand-sky">{tr.id}</td>
                    <td className="py-2 px-3">
                      {Array.isArray(tr.from) ? tr.from.join(' / ') : tr.from}
                    </td>
                    <td className="py-2 px-3 font-semibold">{tr.to}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      {tr.allowedRoles.map((r) => r.replace('_', ' ')).join(', ')}
                    </td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{tr.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-900 dark:text-white">ResolveX</span>
            <span>&bull;</span>
            <span>v1.0.0-dev</span>
            <span>&bull;</span>
            <span className="text-brand-blue dark:text-brand-sky">Phase 1 Foundation Verified</span>
          </div>
          <div>Tagline: &quot;Every Problem Deserves a Resolution.&quot;</div>
        </div>
      </footer>
    </div>
  );
};
