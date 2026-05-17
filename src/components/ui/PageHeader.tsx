import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LaunchBadge, type LaunchBadgeVariant } from './LaunchBadge';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: LaunchBadgeVariant;
  action?: { label: string; href: string };
  children?: ReactNode;
}

export function PageHeader({ title, description, icon, badge, action, children }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-[min(100%,16rem)] flex-1">
          <h1 className="page-title flex items-center gap-2.5 flex-wrap">
            {icon && <span className="text-muted shrink-0">{icon}</span>}
            <span className="truncate">{title}</span>
            {badge && <LaunchBadge variant={badge} />}
          </h1>
          {description && (
            <p className="page-subtitle mt-1.5 max-w-2xl whitespace-normal break-words">{description}</p>
          )}
        </div>
        {action && (
          <Link
            to={action.href}
            className="btn btn-primary shrink-0 inline-flex whitespace-nowrap"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </header>
  );
}
