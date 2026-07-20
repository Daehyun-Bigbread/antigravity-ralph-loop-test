/* main.js
   Task 9 additions: hamburger nav toggle + header scroll shadow.
   Task 10 additions: IntersectionObserver entrance reveal.
   ----------------------------------------------------------------- */

'use strict';

/* ------------------------------------------------------------------
   1. HEADER SCROLL SHADOW
   Adds .is-scrolled to the <header> when the page scrolls down.
   ------------------------------------------------------------------ */
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}());


/* ------------------------------------------------------------------
   2. MOBILE NAV TOGGLE
   Toggles .nav--open on the <nav> element and updates aria-expanded
   on the toggle button. Only active when the button is visible
   (CSS hides it at ≥ 640 px), so no viewport check needed here.
   ------------------------------------------------------------------ */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  function openNav() {
    nav.classList.add('nav--open');
    toggle.classList.add('nav--open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    nav.classList.remove('nav--open');
    toggle.classList.remove('nav--open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function toggleNav() {
    if (nav.classList.contains('nav--open')) {
      closeNav();
    } else {
      openNav();
    }
  }

  // Button click
  toggle.addEventListener('click', toggleNav);

  // Close when any nav link is clicked
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      closeNav();
      toggle.focus(); // return focus to the trigger
    }
  });

  // Close when clicking outside the header
  document.addEventListener('click', function (e) {
    if (
      nav.classList.contains('nav--open') &&
      !toggle.contains(e.target) &&
      !nav.contains(e.target)
    ) {
      closeNav();
    }
  });
}());


/* ------------------------------------------------------------------
   3. FOOTER YEAR
   Keep the copyright year current without hardcoding.
   ------------------------------------------------------------------ */
(function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}());


/* ------------------------------------------------------------------
   4. ENTRANCE REVEAL  (Task 10)
   Observes every [data-reveal] element and adds .is-visible when
   it crosses into the viewport.  Under prefers-reduced-motion the
   elements are shown immediately — no JS animation fires.
   ------------------------------------------------------------------ */
(function initReveal() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Select all elements tagged for reveal
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  // If motion is unwanted, skip the observer entirely — just reveal all
  if (prefersReduced) {
    targets.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  // Build a single shared observer — efficient for many targets
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');

        // Reveal once only — disconnect from this element after firing
        observer.unobserve(entry.target);
      });
    },
    {
      // Fire when 12 % of the element is in view — feels natural
      threshold: 0.12,
      // Slightly negative rootMargin so element is well into viewport before firing
      rootMargin: '0px 0px -3% 0px',
    }
  );

  targets.forEach(function (el) {
    observer.observe(el);
  });
}());
