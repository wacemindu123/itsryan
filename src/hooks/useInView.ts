'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Returns `true` once the referenced element scrolls into view.
 * Fires only once (does not toggle back to false).
 */
export function useInView(
  ref: RefObject<Element | null>,
  opts?: IntersectionObserverInit,
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, opts);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return isVisible;
}
