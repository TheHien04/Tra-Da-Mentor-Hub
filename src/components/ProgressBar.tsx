import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, label, color = '#28a745' }) => {
  return (
    <div>
      {label && (
        <div style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
          {label}: <strong>{percentage}%</strong>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
