import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) => {
  const action =
    actionLabel && actionHref ? (
      <Link to={actionHref} className="btn btn-primary mt-6">
        {actionLabel}
      </Link>
    ) : actionLabel && onAction ? (
      <button type="button" onClick={onAction} className="btn btn-primary mt-6">
        {actionLabel}
      </button>
    ) : null;

  return (
    <div className="card flex flex-col items-center justify-center py-16 px-6 text-center border-dashed">
      {icon && (
        <div className="mb-4 text-4xl text-muted opacity-40" aria-hidden>
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted max-w-sm">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
