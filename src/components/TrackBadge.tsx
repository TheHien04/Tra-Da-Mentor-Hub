import React from 'react';

interface TrackBadgeProps {
  track?: string;
  size?: 'small' | 'medium' | 'large';
}

const trackConfig: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  tech: { icon: '💻', label: 'Technology', color: '#667eea', bgColor: '#667eea20' },
  economics: { icon: '📊', label: 'Economics', color: '#f39c12', bgColor: '#f39c1220' },
  marketing: { icon: '📢', label: 'Marketing', color: '#e74c3c', bgColor: '#e74c3c20' },
  hr: { icon: '👥', label: 'Human Resources', color: '#16a085', bgColor: '#16a08520' },
  sales: { icon: '💼', label: 'Sales', color: '#2980b9', bgColor: '#2980b920' },
  social: { icon: '🌍', label: 'Social Studies', color: '#8e44ad', bgColor: '#8e44ad20' },
  business: { icon: '🏢', label: 'Business', color: '#27ae60', bgColor: '#27ae6020' },
  education: { icon: '🎓', label: 'Education', color: '#3498db', bgColor: '#3498db20' },
  startup: { icon: '🚀', label: 'Startup', color: '#c0392b', bgColor: '#c0392b20' },
  design: { icon: '🎨', label: 'Design', color: '#d35400', bgColor: '#d3540020' },
};

const TrackBadge: React.FC<TrackBadgeProps> = ({ track = 'tech', size = 'medium' }) => {
  const config = trackConfig[track] || trackConfig.tech;
  
  const sizeConfig = {
    small: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    medium: { padding: '0.4rem 0.8rem', fontSize: '0.85rem' },
    large: { padding: '0.6rem 1rem', fontSize: '0.95rem' },
  };

  const style = sizeConfig[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: style.padding,
        fontSize: style.fontSize,
        fontWeight: '600',
        background: config.bgColor,
        color: config.color,
        borderRadius: '8px',
        border: `1px solid ${config.color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.icon} {config.label}
    </span>
  );
};

export default TrackBadge;
