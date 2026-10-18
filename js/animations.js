/**
 * animations.js
 * ---------------------------------------------------------------------------
 * Coordinates the page's motion.
 *
 * PATHS
 * 1. Reduced motion  -> everything is shown immediately, nothing moves.
 * 2. GSAP available  -> one hero timeline, a subtle project parallax on large
 *                       screens, and a scroll-linked "still loading" bar.
 * 3. GSAP missing    -> the same reveals run with CSS transitions, triggered
 *                       by IntersectionObserver. (This is also what happens if
 *                       the CDN is blocked or offline.)
 *
 * Content is never hidden by this file. The hidden states live in
 * animations.css behind the `js` class and have a CSS failsafe.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';

  var heroParts = Array.prototype.slice.call(document.querySelectorAll('[data-hero]'));
  var hero = document.getElementById('opening');
  var heroTitle = hero ? hero.querySelector('[data-lines]') : null;
  var lineGroups = Array.prototype.slice.call(document.querySelectorAll('[data-lines]'));
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var loading = document.querySelector('.loading');

  /* Small helper: mark an element as revealed (CSS takes over from here). */
  function show(el) { el.classList.add('is-in'); }

  /* 1. Reduced motion ---------------------------------------------------- */
  if (reduceMotion) {
    heroParts.concat(lineGroups, revealItems).forEach(show);
    if (loading) { show(loading); }
    return;
  }

  /* Reveal on scroll with IntersectionObserver (used by both paths for the
     lightweight items; GSAP is reserved for the hero and scroll-linked effects). */
  function observe(items, margin) {
    if (!('IntersectionObserver' in window)) {
      items.forEach(show);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  var belowFold = revealItems.concat(
    lineGroups.filter(function (el) { return el !== heroTitle; })
  );
  observe(belowFold);
  if (loading && !hasScrollTrigger) { observe([loading], '0px 0px -5% 0px'); }

  /* 2/3. Hero entrance --------------------------------------------------- */
  function heroWithCss() {
    // Stagger via inline delays; CSS transitions do the movement.
    if (heroTitle) { show(heroTitle); }
    heroParts.forEach(function (el, i) {
      el.style.transitionDelay = (0.25 + i * 0.1) + 's';
      show(el);
    });
  }

  function heroWithGsap() {
    var gsap = window.gsap;
    var lines = heroTitle ? heroTitle.querySelectorAll('.line__inner') : [];
    var portrait = hero.querySelector('[data-hero="portrait"]');
    var others = heroParts.filter(function (el) { return el !== portrait; });

    // Hand control back to CSS once a tween has finished.
    function finish(targets) {
      return function () {
        Array.prototype.forEach.call(targets, function (el) {
          el.style.transform = '';
          el.style.opacity = '';
          el.classList.add('is-in');
        });
      };
    }

    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    if (lines.length) {
      tl.fromTo(lines, { yPercent: 105 }, {
        yPercent: 0, duration: 1.1, stagger: 0.12,
        onComplete: function () {
          if (heroTitle) { heroTitle.classList.add('is-in'); }
          Array.prototype.forEach.call(lines, function (l) { l.style.transform = ''; });
        }
      }, 0.1);
    }
    if (portrait) {
      tl.fromTo(portrait, { opacity: 0, x: 40 }, {
        opacity: 1, x: 0, duration: 1.2, onComplete: finish([portrait])
      }, 0.2);
    }
    if (others.length) {
      tl.fromTo(others, { opacity: 0, y: 18 }, {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.1, onComplete: finish(others)
      }, 0.55);
    }
  }

  function startHero() {
    if (!hero) { return; }
    if (hasGsap) {
      try { heroWithGsap(); } catch (err) { heroWithCss(); }
    } else {
      heroWithCss();
    }
  }

  // Start once layout is ready; requestAnimationFrame avoids a first-paint jank.
  window.requestAnimationFrame(startHero);

  /* GSAP-only enhancements ---------------------------------------------- */
  if (!hasScrollTrigger) { return; }

  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  // Project media drifts slightly against the scroll. Large screens only, and
  // only while the project is on screen (ScrollTrigger handles that cleanup).
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    document.querySelectorAll('.project').forEach(function (project) {
      var media = project.querySelector('[data-parallax]');
      if (!media) { return; }
      gsap.fromTo(media, { yPercent: 3 }, {
        yPercent: -3,
        ease: 'none',
        scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });

  // The "still loading" bar fills as chapter 06 scrolls into view, then rests at 72%.
  if (loading) {
    var fill = loading.querySelector('.loading__fill');
    // is-scrubbed turns off the CSS transition/failsafe so GSAP alone drives the bar.
    loading.classList.add('is-scrubbed');
    gsap.fromTo(fill, { scaleX: 0.04 }, {
      scaleX: 0.72,
      ease: 'none',
      transformOrigin: 'left center',
      scrollTrigger: { trigger: loading, start: 'top 92%', end: 'top 45%', scrub: true }
    });
  }

  // Images and fonts can shift layout after load; recalculate once.
  window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
})();
