import type { ComponentType } from 'react';
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineComputerDesktop,
  HiOutlineGlobeAlt,
  HiOutlineMegaphone,
  HiOutlinePaintBrush,
  HiOutlineRocketLaunch,
  HiOutlineUserGroup,
} from 'react-icons/hi2';
import { trackLabel, trackPillClassName, type TrackId } from '../lib/trackTheme';

interface TrackBadgeProps {
  track?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
} as const;

const trackIcons: Record<TrackId, ComponentType<{ className?: string }>> = {
  tech: HiOutlineComputerDesktop,
  economics: HiOutlineChartBar,
  marketing: HiOutlineMegaphone,
  hr: HiOutlineUserGroup,
  sales: HiOutlineBriefcase,
  social: HiOutlineGlobeAlt,
  business: HiOutlineBuildingOffice2,
  education: HiOutlineAcademicCap,
  startup: HiOutlineRocketLaunch,
  design: HiOutlinePaintBrush,
};

const TrackBadge = ({ track = 'tech', size = 'medium' }: TrackBadgeProps) => {
  const id = (track in trackIcons ? track : 'tech') as TrackId;
  const Icon = trackIcons[id];
  const pillSize = sizeMap[size];

  return (
    <span className={trackPillClassName(track, pillSize)}>
      <Icon className="track-pill__icon" aria-hidden />
      {trackLabel(track)}
    </span>
  );
};

export default TrackBadge;
