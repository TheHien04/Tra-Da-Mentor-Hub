import { Link } from 'react-router-dom';
import { HiOutlineArrowUpRight } from 'react-icons/hi2';

interface Panel {
  n: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
  action: string;
}

interface EditorialSplitProps {
  image: string;
  light: Panel;
  forest: Panel;
}

export function EditorialSplit({ image, light, forest }: EditorialSplitProps) {
  return (
    <div className="editorial-split">
      <Link to={light.href} className="editorial-panel editorial-panel--light">
        <div className="editorial-panel__media">
          <img src={image} alt="" />
        </div>
        <div className="editorial-panel__copy">
          <div className="editorial-panel__meta">
            <span>{light.n}</span>
            <span>{light.kicker}</span>
          </div>
          <h2>{light.title}</h2>
          <p>{light.body}</p>
          <span className="editorial-panel__link">
            {light.action}
            <HiOutlineArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
      <Link to={forest.href} className="editorial-panel editorial-panel--forest">
        <div className="editorial-panel__copy">
          <div className="editorial-panel__meta">
            <span>{forest.n}</span>
            <span>{forest.kicker}</span>
          </div>
          <h2>{forest.title}</h2>
          <p>{forest.body}</p>
          <span className="editorial-panel__link">
            {forest.action}
            <HiOutlineArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}
