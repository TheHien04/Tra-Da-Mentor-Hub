import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft } from 'react-icons/hi2';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface FormShellProps {
  title: string;
  description?: string;
  backHref?: string;
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void;
}

export function FormShell({ title, description, backHref, children, onSubmit }: FormShellProps) {
  const { t } = useAppTranslation();
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {backHref && (
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-secondary mb-6 transition-colors"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
      )}
      <header className="mb-8">
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle mt-1">{description}</p>}
      </header>
      <form onSubmit={onSubmit} className="card p-6 sm:p-8 space-y-5">
        {children}
      </form>
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
  required,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  const generatedId = useId();
  const isSingleControl = Children.count(children) === 1 && isValidElement<{
    id?: string;
    'aria-describedby'?: string;
  }>(children);
  const control = isSingleControl ? children : null;
  const controlId = control?.props.id || `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const describedBy = [control?.props['aria-describedby'], hintId].filter(Boolean).join(' ') || undefined;
  const labelledControl = control
    ? cloneElement(control, { id: controlId, 'aria-describedby': describedBy })
    : children;

  return (
    <div>
      <label htmlFor={control ? controlId : undefined} className="block text-sm font-medium text-secondary mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {labelledControl}
      {hint && <p id={hintId} className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col sm:flex-row gap-2 pt-2">{children}</div>;
}
