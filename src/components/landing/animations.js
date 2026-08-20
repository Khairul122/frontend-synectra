/* ─── Framer Motion variants — shared across all landing sections ────── */
// Inline animation helpers — menghindari variants/stagger untuk kompatibilitas Framer Motion v12
// Kurva easing disamakan dengan power3.out milik GSAP Hero reveal supaya scroll-entrance & hero terasa satu sistem
export const EASE = [0.22, 1, 0.36, 1];
export const STAGGER = 0.07;

export const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.55, delay, ease: EASE },
});
export const fadeLeft = (delay = 0) => ({
  initial:     { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.55, delay, ease: EASE },
});
export const scaleUp = (delay = 0) => ({
  initial:     { opacity: 0, scale: 0.88 },
  whileInView: { opacity: 1, scale: 1 },
  viewport:    { once: true },
  transition:  { duration: 0.55, delay, ease: EASE },
});
export const cardAnim = (delay = 0) => ({
  initial:     { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true },
  transition:  { duration: 0.55, delay, ease: EASE },
});
