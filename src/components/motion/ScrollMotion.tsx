import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Ties scroll position to CSS variables on the main scroller.
 * Sections with data-reveal ease in while entering from below and ease back
 * if the user scrolls them down out of view. data-parallax shifts photographs
 * a few pixels with the scroll, in either direction.
 */
export function ScrollMotion() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;

    const root = document.documentElement;
    let frame = 0;

    const tick = () => {
      frame = 0;
      const mainScrollable = main.scrollHeight - main.clientHeight;
      const doc = document.documentElement;
      const windowScrollable = doc.scrollHeight - window.innerHeight;
      const progress = mainScrollable > 8
        ? main.scrollTop / mainScrollable
        : windowScrollable > 8
          ? window.scrollY / windowScrollable
          : 0;
      main.style.setProperty('--scroll-p', progress.toFixed(4));

      const reduced = prefersReducedMotion();
      const viewH = window.innerHeight || 1;
      const enter = viewH * 0.92;
      const settle = viewH * 0.55;

      main.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (reduced) {
          el.style.setProperty('--reveal', '1');
          return;
        }
        const top = el.getBoundingClientRect().top;
        const raw = (enter - top) / (enter - settle);
        const reveal = Math.min(1, Math.max(0, raw));
        el.style.setProperty('--reveal', reveal.toFixed(3));
      });

      main.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        if (reduced) {
          el.style.setProperty('--parallax', '0px');
          return;
        }
        const top = el.getBoundingClientRect().top;
        const shift = Math.max(-28, Math.min(28, (top - viewH * 0.35) * -0.06));
        el.style.setProperty('--parallax', `${shift.toFixed(1)}px`);
      });
    };

    const requestTick = () => {
      if (frame) return;
      frame = requestAnimationFrame(tick);
    };

    root.classList.add('motion-on');
    const observer = new MutationObserver(requestTick);
    observer.observe(main, { childList: true, subtree: true });
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('.people-card');
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - box.left}px`);
      card.style.setProperty('--my', `${event.clientY - box.top}px`);
    };

    main.addEventListener('pointermove', onPointer, { passive: true });
    main.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      main.removeEventListener('pointermove', onPointer);
      main.removeEventListener('scroll', requestTick);
      window.removeEventListener('scroll', requestTick);
      window.removeEventListener('resize', requestTick);
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true" />;
}
