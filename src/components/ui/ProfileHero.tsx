import type { ReactNode } from 'react';
import Avatar from '../Avatar';
import { resolveAssetUrl } from '../../lib/assetUrl';

interface ProfileHeroProps {
  name: string;
  track?: string;
  subtitle?: string;
  avatarUrl?: string;
  badges?: ReactNode;
  children?: ReactNode;
  avatarSize?: 'md' | 'lg';
}

/** Gradient hero strip for mentor/mentee/group detail pages */
export function ProfileHero({
  name,
  track,
  subtitle,
  avatarUrl,
  badges,
  children,
  avatarSize = 'lg',
}: ProfileHeroProps) {
  return (
    <section className="profile-hero">
      <div className="profile-hero__glow" aria-hidden />
      <div className="profile-hero__inner">
        <div className="profile-hero__avatar-wrap">
          <Avatar name={name} size={avatarSize} track={track} url={resolveAssetUrl(avatarUrl)} />
        </div>
        <div className="profile-hero__content min-w-0 flex-1">
          <h1 className="profile-hero__title">{name}</h1>
          {subtitle && <p className="profile-hero__subtitle">{subtitle}</p>}
          {badges && <div className="profile-hero__badges">{badges}</div>}
          {children && <div className="profile-hero__extra">{children}</div>}
        </div>
      </div>
    </section>
  );
}
