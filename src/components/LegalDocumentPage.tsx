import { Link } from 'react-router-dom';
import '../pages/AuthPage.css';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { AuthPageFooter } from './AuthPageFooter';

type LegalDoc = 'privacy' | 'terms';

export function LegalDocumentPage({ doc }: { doc: LegalDoc }) {
  const { t } = useAppTranslation();
  const sections = t(`legal.${doc}.sections`, { returnObjects: true }) as Array<{
    title: string;
    body: string;
    list?: string[];
  }>;

  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>{t(`legal.${doc}.title`)}</h1>
        <p className="legal-last-updated">
          {t('legal.lastUpdated')}: {new Date().toLocaleDateString()}
        </p>
        {Array.isArray(sections) &&
          sections.map((section, i) => (
            <section key={i}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {section.list && (
                <ul>
                  {section.list.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        <section>
          <h2>{t('legal.contactTitle')}</h2>
          <p>{t('legal.contactBody')}</p>
          <p>
            <strong>{t('legal.emailLabel')}:</strong> privacy@tradamentor.com
          </p>
        </section>
      </div>
      <div className="legal-page-footer">
        <Link to="/login" className="pricing-back">
          ← {t('auth.backToLogin')}
        </Link>
        <AuthPageFooter />
      </div>
    </div>
  );
}
