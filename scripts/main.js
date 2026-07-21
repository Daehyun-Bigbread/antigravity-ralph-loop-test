/**
 * main.js — Editorial / Swiss Landing Page
 * Implements a tasteful entrance reveal (opacity & transform) via IntersectionObserver.
 * Fully disabled when prefers-reduced-motion is enabled.
 */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = reducedMotionQuery && reducedMotionQuery.matches;

  // Target sections and footer for entrance reveal
  const revealTargets = document.querySelectorAll('section, .site-footer');

  // If user prefers reduced motion or IntersectionObserver is unsupported, show elements instantly
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(target => {
      target.classList.add('is-revealed');
    });
    return;
  }

  // Handle dynamic changes to reduced motion preference while viewing
  if (reducedMotionQuery && typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', (event) => {
      if (event.matches) {
        revealTargets.forEach(target => target.classList.add('is-revealed'));
      }
    });
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Unobserve immediately after triggering so sections reveal only once
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealTargets.forEach(target => {
    target.classList.add('reveal-target');
    revealObserver.observe(target);

    // Ensure keyboard navigation immediately reveals hidden target sections when focused
    target.addEventListener('focusin', () => {
      if (!target.classList.contains('is-revealed')) {
        target.classList.add('is-revealed');
        revealObserver.unobserve(target);
      }
    });
  });
});
