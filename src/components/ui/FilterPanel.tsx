import type { ReactNode } from 'react';

interface FilterPanelProps {
  children: ReactNode;
  onClear?: () => void;
  clearLabel?: string;
}

export function FilterPanel({ children, onClear, clearLabel = 'Clear filters' }: FilterPanelProps) {
  return (
    <div className="card p-4 sm:p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {children}
      </div>
      {onClear && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <button type="button" onClick={onClear} className="btn btn-secondary text-sm">
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export const filterSelectClass = 'input py-2 text-sm';
