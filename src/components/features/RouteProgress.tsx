import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteProgress() {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const done = window.setTimeout(() => setActive(false), 450);
    return () => clearTimeout(done);
  }, [location.pathname]);

  return (
    <div
      className={`route-progress ${active ? 'route-progress--active' : ''}`}
      role="progressbar"
      aria-hidden
    />
  );
}
