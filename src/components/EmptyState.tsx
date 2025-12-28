import React from 'react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px dashed #dee2e6'
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{typeof icon === 'string' ? icon : icon}</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#333' }}>
        {title}
      </h2>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '1rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            backgroundColor: '#0a4b39',
            color: '#fff',
            padding: '10px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#086642';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#0a4b39';
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
