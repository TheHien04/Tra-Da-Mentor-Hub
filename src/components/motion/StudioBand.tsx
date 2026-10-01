import { StudioObject } from './StudioObject';

interface StudioBandProps {
  kicker: string;
  title: string;
  src: string;
}

/** Same height, type, and 3D object on every list page. */
export function StudioBand({ kicker, title, src }: StudioBandProps) {
  return (
    <section className="studio-band">
      <div className="studio-band__copy">
        <p className="studio-band__kicker">{kicker}</p>
        <p className="studio-band__title">{title}</p>
      </div>
      <StudioObject src={src} />
    </section>
  );
}
