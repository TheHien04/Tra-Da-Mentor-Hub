import { useAppTranslation } from '../../hooks/useAppTranslation';
import { SceneFrame } from './SceneFrame';

const SCENES = [
  { src: '/media/hero-session.jpg', kicker: 'dashboard.sceneTalkKicker', title: 'dashboard.sceneTalk' },
  { src: '/media/circle-session.jpg', kicker: 'dashboard.sceneCircleKicker', title: 'dashboard.sceneCircle' },
  { src: '/media/quiet-table.jpg', kicker: 'dashboard.sceneQuietKicker', title: 'dashboard.sceneQuiet' },
] as const;

export function SceneStrip() {
  const { t } = useAppTranslation();

  return (
    <section className="scene-row" data-reveal aria-label={t('dashboard.sceneEyebrow')}>
      {SCENES.map((scene) => (
        <figure key={scene.src} className="scene-card">
          <div className="scene-card__media">
            <SceneFrame images={[scene.src]} />
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
