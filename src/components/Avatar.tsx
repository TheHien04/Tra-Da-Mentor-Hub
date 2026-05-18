import { avatarClassName } from '../lib/trackTheme';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  url?: string;
  track?: string;
}

const sizeClass = {
  sm: 'avatar--sm',
  md: 'avatar--md',
  lg: 'avatar--lg',
} as const;

const Avatar = ({ name, size = 'md', url, track }: AvatarProps) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  const classes = ['avatar', sizeClass[size], avatarClassName(name, track)].join(' ');

  return (
    <div className={classes} title={name}>
      {url ? <img src={url} alt={name} className="avatar__img" /> : initials}
    </div>
  );
};

export default Avatar;
