'use client';

import { useState } from 'react';
import LineBadge from '@/components/LineBadge';
import { ALERTS } from '@/lib/data';
import { AlertSeverity } from '@/lib/types';

const FILTERS: { key: AlertSeverity | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Disruptions' },
  { key: 'warning', label: 'Delays' },
  { key: 'info', label: 'Advisories' },
];

const SEVERITY_META: Record<
  AlertSeverity,
  { label: string; border: string; dot: string }
> = {
  critical: {
    label: 'Service disrupted',
    border: 'border-l-severity-critical',
    dot: 'bg-severity-critical',
  },
  warning: {
    label: 'Delays expected',
    border: 'border-l-severity-warning',
    dot: 'bg-severity-warning',
  },
  info: {
    label: 'Advisory',
    border: 'border-l-severity-info',
    dot: 'bg-severity-info',
  },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertSeverity | 'all'>('all');
  const visible =
    filter === 'all' ? ALERTS : ALERTS.filter((a) => a.severity === filter);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 hidden md:block">
        <h1 className="font-display text-2xl font-semibold text-ink-primary">
          Alerts
        </h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Service disruptions, delays, and advisories across all lines.
        </p>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filter === f.key
                ? 'border-accent bg-accent/10 text-ink-primary'
                : 'border-hairline text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((alert) => {
          const meta = SEVERITY_META[alert.severity];
          return (
            <div
              key={alert.id}
              className={`rounded-lg border border-hairline border-l-4 ${meta.border} bg-surface p-4`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LineBadge lineId={alert.lineId} />
                  <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs text-ink-tertiary">
                  {alert.timestamp}
                </span>
              </div>
              <p className="mt-2.5 text-sm font-medium text-ink-primary">
                {alert.title}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">
                {alert.description}
              </p>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-tertiary">
            No alerts in this category right now.
          </p>
        )}
      </div>
    </div>
  );
}
