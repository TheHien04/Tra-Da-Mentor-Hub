interface BadgeProps {
  status: 'active' | 'on-hold' | 'completed' | 'full';
  label?: string;
}

const variants: Record<BadgeProps['status'], string> = {
  active: 'badge-pill badge-success',
  'on-hold': 'badge-pill badge-warning',
  completed: 'badge-pill badge-accent',
  full: 'badge-pill badge-full',
};

const Badge = ({ status, label }: BadgeProps) => (
  <span className={`inline-flex items-center ${variants[status]}`}>
    {label || status.replace('-', ' ')}
  </span>
);

export default Badge;
