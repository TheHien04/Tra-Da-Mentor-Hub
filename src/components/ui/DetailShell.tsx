import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { PageShell } from './PageShell';
import Skeleton from '../Skeleton';
import { Alert } from './Alert';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface DetailShellProps {
  backHref: string;
  backLabel?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hero?: ReactNode;
  loading?: boolean;
  error?: string | null;
  notFound?: boolean;
  children: ReactNode;
}

export function DetailShell({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
  hero,
  loading,
  error,
  notFound,
  children,
}: DetailShellProps) {
  const { t } = useAppTranslation();
  const resolvedBackLabel = backLabel ?? t('common.back');

  if (loading) {
    return (
      <PageShell>
        <Skeleton count={5} />
      </PageShell>
    );
  }

  if (error || notFound) {
    return (
      <PageShell>
        <Link to={backHref} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary mb-6">
          <HiOutlineArrowLeft className="h-4 w-4" />
          {resolvedBackLabel}
        </Link>
        <Alert variant="error">{error || t('common.noData')}</Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          {resolvedBackLabel}
        </Link>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {hero ?? (
        <header className="mb-8">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle mt-1 max-w-2xl whitespace-normal">{subtitle}</p>}
        </header>
      )}

      {children}
    </PageShell>
  );
}

export function DetailCard({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card detail-card p-6 mb-6 ${className}`}>
      {title && <h2 className="detail-card__title">{title}</h2>}
      {children}
    </section>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">{children}</dl>;
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-sm text-secondary">{children}</dd>
    </div>
  );
}
