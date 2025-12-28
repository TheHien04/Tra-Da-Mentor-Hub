import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  url?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', url }) => {
  const sizes = {
    sm: '32px',
    md: '48px',
    lg: '64px'
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Generate a consistent color based on name
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
  ];
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  const bgColor = colors[hash % colors.length];

  return (
    <div
      style={{
        width: sizes[size],
        height: sizes[size],
        borderRadius: '50%',
        backgroundColor: url ? '#f0f0f0' : bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.5rem' : '1rem',
        fontWeight: 'bold',
        color: '#fff',
        overflow: 'hidden',
        flexShrink: 0
      }}
      title={name}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;
