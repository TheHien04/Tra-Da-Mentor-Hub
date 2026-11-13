import { Link } from 'react-router-dom';
import { HiOutlineAcademicCap, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { AuthPageFooter } from '../components/AuthPageFooter';
import { ProgramPackageCard } from '../components/program/ProgramPackageCard';
import {
  getProgramContent,
  OFFICIAL_APPLICATION_URL,
  OFFICIAL_SERVICES_URL,
} from '../content/officialProgram';
import { useAppTranslation } from '../hooks/useAppTranslation';
import './AuthPage.css';

export const PricingPage = () => {
  const { i18n } = useAppTranslation();
  const content = getProgramContent(i18n.language);

  return (
    <div className="auth-page auth-page--pricing">
      <main className="auth-shell auth-shell-pricing">
        <header className="pricing-header">
          <div className="auth-icon mx-auto mb-4">
            <HiOutlineAcademicCap className="h-7 w-7" aria-hidden />
          </div>
          <p className="program-eyebrow">{content.eyebrow}</p>
          <h1 className="auth-title">{content.title}</h1>
          <p className="auth-subtitle program-lead">{content.subtitle}</p>
          <a className="program-source-link" href={OFFICIAL_SERVICES_URL} target="_blank" rel="noreferrer">
            {content.sourceLabel} <HiOutlineArrowTopRightOnSquare aria-hidden />
          </a>
        </header>

        <section className="program-section" aria-labelledby="programs-title">
          <div className="program-section-heading">
            <h2 id="programs-title">{content.programsHeading}</h2>
            <p>{content.programsDescription}</p>
          </div>
          <div className="pricing-grid pricing-grid--programs">
            {content.packages.map((program) => (
              <ProgramPackageCard
                key={program.id}
                program={program}
                perPerson={content.perPerson}
                applyLabel={content.apply}
                featuredLabel={content.featured}
                applicationUrl={OFFICIAL_APPLICATION_URL}
              />
            ))}
          </div>
        </section>

        <section className="program-section program-panel" aria-labelledby="journey-title">
          <div className="program-section-heading">
            <h2 id="journey-title">{content.journeyHeading}</h2>
            <p>{content.journeyDescription}</p>
          </div>
          <ol className="program-timeline">
            {content.journey.map((step) => (
              <li key={step.week}><span>{step.week}</span><strong>{step.title}</strong></li>
            ))}
          </ol>
        </section>

        <section className="program-section" aria-labelledby="process-title">
          <div className="program-section-heading">
            <h2 id="process-title">{content.processHeading}</h2>
            <p>{content.processDescription}</p>
          </div>
          <ol className="program-process-grid">
            {content.process.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span><h3>{step.title}</h3><p>{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="program-section program-panel" aria-labelledby="scholarships-title">
          <div className="program-section-heading">
            <h2 id="scholarships-title">{content.scholarshipsHeading}</h2>
            <p>{content.scholarshipsDescription}</p>
          </div>
          <div className="program-scholarships">
            {content.scholarships.map((item) => (
              <div key={item.discount}>
                <strong>{item.count}</strong><span>{content.scholarshipUnit} {item.discount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="program-contact" aria-labelledby="contact-title">
          <div><h2 id="contact-title">{content.contactHeading}</h2><p>{content.contactDescription}</p></div>
          <address>
            <a href="mailto:tradamentor@gmail.com">tradamentor@gmail.com</a>
            <a href="tel:+84916631571">(+84) 916 631 571</a>
            <span>456 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh, TP.HCM</span>
          </address>
        </section>

        <footer className="pricing-footer-block">
          <a className="btn btn-primary" href={OFFICIAL_APPLICATION_URL} target="_blank" rel="noreferrer">
            {content.apply} <span aria-hidden>↗</span>
          </a>
          <Link to="/login" className="pricing-back">← {content.back}</Link>
          <AuthPageFooter />
        </footer>
      </main>
    </div>
  );
};
