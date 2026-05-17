import { useAppTranslation } from '../../hooks/useAppTranslation';

export type LaunchBadgeVariant = 'comingSoon' | 'beta' | 'new';

const variantClass: Record<LaunchBadgeVariant, string> = {
  comingSoon: 'launch-badge launch-badge--soon',
  beta: 'launch-badge launch-badge--beta',
  new: 'launch-badge launch-badge--new',
};

interface LaunchBadgeProps {
  variant: LaunchBadgeVariant;
  className?: string;
}

export function LaunchBadge({ variant, className = '' }: LaunchBadgeProps) {
  const { t } = useAppTranslation();
  const labelKey = `common.${variant}` as const;
  return (
    <span className={`${variantClass[variant]} ${className}`.trim()} role="status">
      {t(labelKey)}
    </span>
  );
}
