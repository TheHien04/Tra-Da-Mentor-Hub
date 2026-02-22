import React from 'react';

interface BadgeProps {
  status: 'active' | 'on-hold' | 'completed' | 'full';
  label?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
        return { bg: '#28a745', icon: '🟢' };
      case 'on-hold':
        return { bg: '#ffc107', icon: '⏸️' };
      case 'completed':
        return { bg: '#17a2b8', icon: '✅' };
      case 'full':
        return { bg: '#dc3545', icon: '🔴' };
      default:
        return { bg: '#6c757d', icon: '⚪' };
    }
  };

  const style = getStatusStyle();

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: style.bg,
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        marginRight: '8px'
      }}
    >
      {style.icon} {label || status.replace('-', ' ').toUpperCase()}
    </span>
  );
};

export default Badge;
