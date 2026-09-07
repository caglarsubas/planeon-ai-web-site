'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Progressive enhancement: server-rendered content is visible without JS. */
export function PageMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    const elements = document.querySelectorAll<HTMLElement>(
      'main > section:not(.scenario-workbench), .page-intro, .workspace-heading, .harness-hero, .whitepaper-cover, .research-section',
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.setAttribute('data-reveal', 'visible');
          observer.unobserve(target);
        });
      },
      { threshold: 0, rootMargin: '0px 0px -24px 0px' },
    );
    elements.forEach((element) => {
      // Never hide the current view, focus, hash target, or a sticky workbench.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.dataset.reveal = 'pending';
      observer.observe(element);
    });
    const revealAll = () =>
      elements.forEach((element) => element.removeAttribute('data-reveal'));
    preference.addEventListener('change', revealAll);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', revealAll);
      revealAll();
    };
  }, [pathname]);
  return null;
}
