import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi2';

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
    <div className="wow-empty">
      <div className="wow-empty__icon" aria-hidden>
        {icon ?? <HiOutlineSparkles className="h-8 w-8" />}
      </div>
      <h2 className="wow-empty__title">{title}</h2>
      <p className="wow-empty__desc">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
