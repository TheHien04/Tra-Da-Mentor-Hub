interface EditorialBannerProps {
  image: string;
  kicker: string;
  title: string;
  body: string;
}

/** Work photograph plus the same editorial type used on the dashboard. */
export function EditorialBanner({ image, kicker, title, body }: EditorialBannerProps) {
  return (
    <section className="editorial-banner">
      <div className="editorial-banner__media">
        <img src={image} alt="" />
      </div>
      <div className="editorial-banner__copy">
        <p className="editorial-banner__kicker">{kicker}</p>
        <h2 className="editorial-banner__title">{title}</h2>
        <p className="editorial-banner__body">{body}</p>
      </div>
    </section>
  );
}
