import type { ServicePackage } from '../../content/officialProgram';

type ProgramPackageCardProps = {
  program: ServicePackage;
  perPerson: string;
  applyLabel: string;
  featuredLabel: string;
  applicationUrl: string;
};

export function ProgramPackageCard({ program, perPerson, applyLabel, featuredLabel, applicationUrl }: ProgramPackageCardProps) {
  return (
    <article className={`pricing-card ${program.featured ? 'pricing-card--featured' : ''}`}>
      {program.featured ? <span className="pricing-badge">{featuredLabel}</span> : null}
      <h3 className="pricing-plan-name">{program.name}</h3>
      <div className="pricing-price">
        {program.price}<span className="pricing-period"> {perPerson}</span>
      </div>
      <p className="pricing-desc">{program.description}</p>
      <div className="program-meta" aria-label={`${program.duration}; ${program.format}`}>
        <span>{program.duration}</span><span>{program.format}</span>
      </div>
      <ul className="pricing-features">
        {program.features.map((feature) => (
          <li key={feature}><span className="pricing-check" aria-hidden>✓</span>{feature}</li>
        ))}
      </ul>
      <a className={`btn w-full ${program.featured ? 'btn-primary' : 'btn-secondary'}`} href={applicationUrl} target="_blank" rel="noreferrer">
        {applyLabel}<span aria-hidden> ↗</span>
      </a>
    </article>
  );
}
