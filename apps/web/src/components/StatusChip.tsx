import React from 'react';
import { ComplaintStatus } from '@resolvex/shared';
import {
  FileText,
  Clock,
  UserCheck,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Lock,
  RotateCcw,
  XCircle,
  Undo2,
} from 'lucide-react';

interface StatusChipProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const config = {
    [ComplaintStatus.SUBMITTED]: {
      label: 'Submitted',
      icon: FileText,
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-300 dark:border-blue-700',
    },
    [ComplaintStatus.UNDER_REVIEW]: {
      label: 'Under Review',
      icon: Clock,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-700',
    },
    [ComplaintStatus.ASSIGNED]: {
      label: 'Assigned',
      icon: UserCheck,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
    },
    [ComplaintStatus.IN_PROGRESS]: {
      label: 'In Progress',
      icon: PlayCircle,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-700',
    },
    [ComplaintStatus.ON_HOLD]: {
      label: 'On Hold',
      icon: PauseCircle,
      bg: 'bg-yellow-50 dark:bg-yellow-950/60',
      text: 'text-yellow-800 dark:text-yellow-300',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    [ComplaintStatus.RESOLVED]: {
      label: 'Resolved',
      icon: CheckCircle2,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-700',
    },
    [ComplaintStatus.CLOSED]: {
      label: 'Closed',
      icon: Lock,
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-800 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-600',
    },
    [ComplaintStatus.REOPENED]: {
      label: 'Reopened',
      icon: RotateCcw,
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700',
    },
    [ComplaintStatus.REJECTED]: {
      label: 'Rejected',
      icon: XCircle,
      bg: 'bg-red-50 dark:bg-red-950/60',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
    },
    [ComplaintStatus.WITHDRAWN]: {
      label: 'Withdrawn',
      icon: Undo2,
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-300 dark:border-gray-600',
    },
  }[status];

  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${padding}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon size={iconSize} aria-hidden="true" className="flex-shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
