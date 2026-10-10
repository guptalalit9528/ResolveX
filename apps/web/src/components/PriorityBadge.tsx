import React from 'react';
import { Priority } from '@resolvex/shared';
import { ArrowDown, Minus, ArrowUp, AlertOctagon, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  isSafetyHazard?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, isSafetyHazard = false }) => {
  const config = {
    [Priority.LOW]: {
      label: 'Low',
      icon: ArrowDown,
      color: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    },
    [Priority.NORMAL]: {
      label: 'Normal',
      icon: Minus,
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    [Priority.URGENT]: {
      label: 'Urgent',
      icon: ArrowUp,
      color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700',
    },
    [Priority.EMERGENCY]: {
      label: 'Emergency',
      icon: AlertOctagon,
      color: 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-950/80 border-red-400 dark:border-red-600 animate-pulse',
    },
  }[priority];

  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border ${config.color}`}
        aria-label={`Priority: ${config.label}`}
      >
        <Icon size={13} aria-hidden="true" />
        <span>{config.label}</span>
      </span>

      {isSafetyHazard && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-red-600 text-white shadow-sm"
          title="Safety Hazard Flagged - Subject to Emergency Escalation"
        >
          <ShieldAlert size={12} aria-hidden="true" />
          <span>SAFETY HAZARD</span>
        </span>
      )}
    </div>
  );
};
