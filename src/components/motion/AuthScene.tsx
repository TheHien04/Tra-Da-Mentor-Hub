import { useAppTranslation } from '../../hooks/useAppTranslation';
import { SceneFrame } from './SceneFrame';

export function AuthScene() {
  const { t } = useAppTranslation();

  return (
    <aside className="auth-scene">
      <div className="auth-scene__media" data-parallax>
        <SceneFrame images={['/media/auth-tea.jpg', '/media/quiet-table.jpg']} priority />
      </div>
      <p className="auth-scene__caption">{t('auth.sceneCaption')}</p>
    </aside>
  );
}
