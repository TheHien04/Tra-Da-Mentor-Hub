import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

/** Standard page container — max width, padding, animation */
export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
