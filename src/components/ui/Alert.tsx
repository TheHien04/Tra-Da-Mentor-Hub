import type { ReactNode } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineCheckCircle, HiOutlineInformationCircle } from 'react-icons/hi2';

type AlertVariant = 'error' | 'success' | 'info';

const icons: Record<AlertVariant, ReactNode> = {
  error: <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0" />,
  success: <HiOutlineCheckCircle className="h-5 w-5 shrink-0" />,
  info: <HiOutlineInformationCircle className="h-5 w-5 shrink-0" />,
};

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const tone =
    variant === 'error'
      ? 'error-message'
      : variant === 'success'
        ? 'alert-success'
        : 'alert-info';

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${tone} ${className}`}>
      {icons[variant]}
      <div>
        {title && <p className="font-medium mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}
