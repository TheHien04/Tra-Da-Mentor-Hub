interface FilterChipOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterChipsProps<T>) {
  return (
    <div className="analytics-period flex-wrap" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`analytics-period__btn ${value === opt.value ? 'analytics-period__btn--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
