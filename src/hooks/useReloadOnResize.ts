import { useEffect, useRef } from 'react';

export const useReloadOnResize = () => {
  const prevWidth = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'development') return;

    prevWidth.current = window.innerWidth;

    const handleResize = () => {
      if (prevWidth.current === null) return;

      const widthDiff = Math.abs(window.innerWidth - prevWidth.current);

      if (widthDiff > 300) {
        window.location.reload();
      }

      prevWidth.current = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
};