import { Check, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AllergenStatus } from '../types';

interface StatusBadgeProps {
  status: AllergenStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StatusBadge({ status, size = 'md', showLabel = true }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const icons = {
    safe: Check,
    testing: Clock,
    reaction: AlertTriangle,
  };

  const colors = {
    safe: 'bg-status-safe text-white',
    testing: 'bg-status-testing text-white status-pattern-testing',
    reaction: 'bg-status-reaction text-white status-pattern-reaction',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const Icon = icons[status];
  const statusLabel = t(`status.${status}`);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors[status]} ${sizes[size]}`}
      role="status"
      aria-label={`Status: ${statusLabel}`}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
      {showLabel && <span>{statusLabel}</span>}
    </span>
  );
}
