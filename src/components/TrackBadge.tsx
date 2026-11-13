import { trackLabel, trackPillClassName } from '../lib/trackTheme';

interface TrackBadgeProps {
  track?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
} as const;

const TrackBadge = ({ track = 'tech', size = 'medium' }: TrackBadgeProps) => {
  const pillSize = sizeMap[size];

  return (
    <span className={trackPillClassName(track, pillSize)}>
      {trackLabel(track)}
    </span>
  );
};

export default TrackBadge;
