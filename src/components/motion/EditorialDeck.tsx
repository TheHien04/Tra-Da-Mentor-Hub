import { Link } from 'react-router-dom';
import { HiOutlineArrowUpRight } from 'react-icons/hi2';

export interface EditorialCard {
  n: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  image: string;
  action: string;
}

export function EditorialDeck({ items }: { items: EditorialCard[] }) {
  return (
    <div className="editorial-grid">
      {items.map((item) => (
        <Link key={item.n} to={item.href} className="editorial-card">
          <div className="editorial-card__media">
            <img src={item.image} alt="" />
          </div>
          <div className="editorial-card__body">
            <p className="editorial-card__kicker">
              {item.n} · {item.kicker}
            </p>
            <h2 className="editorial-card__title">{item.title}</h2>
            <p className="editorial-card__text">{item.body}</p>
            <span className="editorial-card__go" aria-hidden>
              <HiOutlineArrowUpRight className="h-4 w-4" />
            </span>
            <span className="sr-only">{item.action}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
