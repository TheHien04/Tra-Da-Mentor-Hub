import React from 'react';

interface SkeletonProps {
  count?: number;
  height?: number;
  width?: string;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  count = 1,
  height = 20,
  width = '100%',
  circle = false
}) => {
  const items = Array(count).fill(0);

  return (
    <div>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            width: circle ? height : width,
            height: `${height}px`,
            backgroundColor: '#e9ecef',
            borderRadius: circle ? '50%' : '6px',
            marginBottom: count > 1 && i < count - 1 ? '12px' : '0',
            animation: 'shimmer 2s infinite',
            backgroundImage:
              'linear-gradient(90deg, #e9ecef 0%, #f5f7fa 50%, #e9ecef 100%)',
            backgroundSize: '200% 100%',
            backgroundPosition: '0 0'
          }}
        />
      ))}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default Skeleton;
