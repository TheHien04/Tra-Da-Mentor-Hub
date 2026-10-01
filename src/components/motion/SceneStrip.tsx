import { useAppTranslation } from '../../hooks/useAppTranslation';
import { StudioObject } from './StudioObject';

const STILLS = [
  { src: '/media/glass-3d.jpg', kicker: 'dashboard.sceneTalkKicker', title: 'dashboard.sceneTalk' },
  { src: '/media/circle-3d.jpg', kicker: 'dashboard.sceneCircleKicker', title: 'dashboard.sceneCircle' },
  { src: '/media/table-3d.jpg', kicker: 'dashboard.sceneQuietKicker', title: 'dashboard.sceneQuiet' },
] as const;

export function SceneStrip() {
  const { t } = useAppTranslation();

  return (
    <section className="scene-row" aria-label={t('dashboard.sceneEyebrow')}>
      {STILLS.map((scene) => (
        <figure key={scene.src} className="scene-card">
          <div className="scene-card__media">
            <StudioObject src={scene.src} />
          </div>
          <figcaption>
            <span>{t(scene.kicker)}</span>
            {t(scene.title)}
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
