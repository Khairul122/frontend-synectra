import { useEffect, useRef, useState } from 'react';

/**
 * Mengembalikan [ref, inView]. `inView` toggle saat elemen masuk/keluar viewport.
 * `rootMargin` besar dipakai agar konten berat bisa di-mount sedikit sebelum terlihat.
 */
export function useInView({ rootMargin = '0px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin, threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView];
}
