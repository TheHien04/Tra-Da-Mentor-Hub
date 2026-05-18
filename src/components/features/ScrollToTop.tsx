import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.querySelector('.content');
    if (main instanceof HTMLElement) {
      main.scrollTo({ top: 0, behavior: 'instant' in window ? ('instant' as ScrollBehavior) : 'auto' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
