import { useEffect, useState } from 'react';

/**
 * True hanya di layar ≥1024px DAN user tidak meminta reduced-motion.
 * Dipakai untuk men-skip efek berat (3D, smooth-scroll) di mobile / aksesibilitas.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsDesktop(mq.matches && !reduce.matches);
    update();
    mq.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  return isDesktop;
}
