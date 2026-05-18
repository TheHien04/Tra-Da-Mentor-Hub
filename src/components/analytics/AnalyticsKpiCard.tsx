import type { ComponentType } from 'react';

interface AnalyticsKpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  accent?: 'default' | 'success' | 'warning' | 'info';
}

const accentRing = {
  default: 'analytics-kpi--default',
  success: 'analytics-kpi--success',
  warning: 'analytics-kpi--warning',
  info: 'analytics-kpi--info',
};

export function AnalyticsKpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'default',
}: AnalyticsKpiCardProps) {
  return (
    <div className={`analytics-kpi ${accentRing[accent]}`}>
      <div className="analytics-kpi__icon" aria-hidden>
        <Icon className="h-5 w-5" />
      </div>
      <div className="analytics-kpi__body">
        <p className="analytics-kpi__label">{label}</p>
        <p className="analytics-kpi__value">{value}</p>
        {hint && <p className="analytics-kpi__hint">{hint}</p>}
      </div>
    </div>
  );
}
