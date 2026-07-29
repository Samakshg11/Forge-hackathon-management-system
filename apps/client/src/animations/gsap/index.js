import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Register plugins once globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

/**
 * Animated number counter (Document 3 §3)
 */
export function animateCounter(targetEl, { from = 0, to = 100, duration = 2, suffix = '' }) {
  if (!targetEl) return;
  const obj = { val: from };
  gsap.to(obj, {
    val: to,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      targetEl.textContent = `${Math.round(obj.val).toLocaleString()}${suffix}`;
    },
  });
}

/**
 * Text reveal animation utility wrapper (Document 3 §3)
 */
export function animateTextReveal(elements, options = {}) {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: options.stagger || 0.08,
      ease: 'power3.out',
      ...options,
    }
  );
}
