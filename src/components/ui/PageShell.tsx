import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Standard page container — max width, padding, entrance animation */
export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`page-shell w-full max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}
