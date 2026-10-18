/**
 * main.js
 * ---------------------------------------------------------------------------
 * Everyday interactions. No dependencies.
 *   1. Mobile navigation toggle (keyboard and screen-reader friendly)
 *   2. Header background after scrolling
 *   3. Highlight the nav link for the chapter currently on screen
 *   4. Copy-email button with a clear confirmation message
 *   5. Back-to-top button
 *   6. Footer year
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');
  var desktop = window.matchMedia('(min-width: 900px)');

  /* 1. Mobile navigation ------------------------------------------------- */
  function setMenu(open) {
    if (!toggle || !nav) { return; }
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after choosing a link.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { setMenu(false); }
    });

    // Escape closes the menu and returns focus to the button.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when the layout switches to desktop.
    var onBreakpoint = function () { if (desktop.matches) { setMenu(false); } };
    if (desktop.addEventListener) { desktop.addEventListener('change', onBreakpoint); }
    else if (desktop.addListener) { desktop.addListener(onBreakpoint); }
  }

  /* 2 + 5. Scroll state (one passive listener, throttled with rAF) ------- */
  var toTop = document.getElementById('back-to-top');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle('is-scrolled', y > 24); }
    if (toTop) { toTop.hidden = y < window.innerHeight * 0.9; }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      // Move keyboard focus to the top of the page so the next Tab starts there.
      var start = document.getElementById('opening');
      if (start) {
        start.setAttribute('tabindex', '-1');
        start.focus({ preventScroll: true });
      }
    });
  }

  /* 3. Current chapter in the navigation --------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var targets = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (a) {
          var match = a.getAttribute('href') === '#' + entry.target.id;
          if (match) { a.setAttribute('aria-current', 'location'); }
          else { a.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* 4. Copy email -------------------------------------------------------- */
  var copyButton = document.getElementById('copy-email');
  var copyStatus = document.getElementById('copy-status');
  var resetTimer;

  function announce(message) {
    if (!copyStatus) { return; }
    copyStatus.textContent = message;
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(function () { copyStatus.textContent = ''; }, 3500);
  }

  // Fallback for browsers or contexts where the Clipboard API is unavailable.
  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  if (copyButton) {
    copyButton.addEventListener('click', function () {
      var email = copyButton.getAttribute('data-email');
      if (!email) { return; }

      var done = function (ok) {
        announce(ok ? 'Email address copied.' : 'Could not copy. The address is shown below to copy by hand.');
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(
          function () { done(true); },
          function () { done(legacyCopy(email)); }
        );
      } else {
        done(legacyCopy(email));
      }
    });
  }

  /* 6. Footer year ------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();

/* Futuristic touches: scroll progress bar, cursor light and project tilt. */
(function () {
  'use strict';
  var root = document.documentElement, busy = false;
  function progress() {
    var h = root.scrollHeight - window.innerHeight;
    root.style.setProperty('--p', h > 0 ? Math.min(1, window.scrollY / h) : 0);
    busy = false;
  }
  window.addEventListener('scroll', function () {
    if (!busy) { busy = true; window.requestAnimationFrame(progress); }
  }, { passive: true });
  progress();

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var calm = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || !calm) { return; }

  window.addEventListener('pointermove', function (e) {
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  document.querySelectorAll('.project__media').forEach(function (box) {
    var tile = box.querySelector('.mock, .project__img');
    if (!tile) { return; }
    box.addEventListener('pointermove', function (e) {
      var r = box.getBoundingClientRect();
      tile.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg');
      tile.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5)) * 8 + 'deg');
    });
    box.addEventListener('pointerleave', function () {
      tile.style.setProperty('--rx', '0deg');
      tile.style.setProperty('--ry', '0deg');
    });
  });
})();

/* Contact form: client-side validation with Formspree submission. */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var status = document.getElementById('form-status');
  var button = form.querySelector('button[type="submit"]');

  var rules = {
    name: function (v) {
      return v.trim().length < 2
        ? 'Please enter your name.'
        : '';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
        ? ''
        : 'Please enter a valid email address.';
    },
    message: function (v) {
      return v.trim().length < 10
        ? 'Please write at least 10 characters.'
        : '';
    }
  };

  function check(field) {
    var error = rules[field.name](field.value);
    var errorElement = document.getElementById('e-' + field.name);

    if (errorElement) {
      errorElement.textContent = error;
    }

    if (error) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }

    return !error;
  }

  Object.keys(rules).forEach(function (name) {
    var field = form.elements[name];

    if (!field) { return; }

    field.addEventListener('blur', function () {
      check(field);
    });

    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid')) {
        check(field);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (status) {
      status.className = 'form__status';
      status.textContent = '';
    }

    var bad = Object.keys(rules)
      .map(function (name) {
        return form.elements[name];
      })
      .filter(function (field) {
        return !field || !check(field);
      });

    if (bad.length) {
      if (bad[0]) { bad[0].focus(); }
      return;
    }

    if (!button) { return; }

    button.disabled = true;

    if (status) {
      status.textContent = 'Sending…';
    }

    fetch('https://formspree.io/f/mwlvzkqk', {
      method: 'POST',
      body: new FormData(form),
      headers: {
        Accept: 'application/json'
      }
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('Form submission failed');
        }

        form.reset();

        Object.keys(rules).forEach(function (name) {
          var errorElement = document.getElementById('e-' + name);
          if (errorElement) {
            errorElement.textContent = '';
          }
        });

        if (status) {
          status.textContent = 'Thank you. Your message was sent.';
        }
      })
      .catch(function () {
        if (status) {
          status.className = 'form__status is-error';
          status.textContent =
            'Sorry, the message could not be sent. Please email udaybaniya001@gmail.com instead.';
        }
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();

/* Premium touches: soft light following the pointer on cards, magnetic primary buttons. */
(function () {
  'use strict';
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.stair');
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--sx', e.clientX - r.left + 'px');
      card.style.setProperty('--sy', e.clientY - r.top + 'px');
    }
    var btn = e.target.closest && e.target.closest('.btn--primary');
    if (btn) {
      var b = btn.getBoundingClientRect();
      btn.style.setProperty('--tx', (e.clientX - b.left - b.width / 2) * 0.12 + 'px');
      btn.style.setProperty('--ty', (e.clientY - b.top - b.height / 2) * 0.2 + 'px');
    }
  }, { passive: true });
  document.addEventListener('pointerout', function (e) {
    var btn = e.target.closest && e.target.closest('.btn--primary');
    if (btn) { btn.style.setProperty('--tx', '0px'); btn.style.setProperty('--ty', '0px'); }
  });
})();

/* Mood toggle (light/dark neumorphism), remembered between visits. */
(function () {
  'use strict';
  var btn = document.getElementById('theme-toggle');
  if (!btn) { return; }
  var root = document.documentElement;
  function apply(theme, save) {
    root.dataset.theme = theme;
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.content = theme === 'dark' ? '#1d202b' : '#e6eaf3'; }
    if (save) { try { localStorage.setItem('ub-theme', theme); } catch (err) { /* storage blocked */ } }
  }
  apply(root.dataset.theme === 'dark' ? 'dark' : 'light', false);
  btn.addEventListener('click', function () {
    root.classList.add('theme-anim');
    apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    window.setTimeout(function () { root.classList.remove('theme-anim'); }, 700);
  });
})();

/* Navbar: a raised pill glides to the hovered, focused or current link (desktop). */
(function () {
  'use strict';
  var nav = document.getElementById('site-nav');
  var pill = nav && nav.querySelector('.nav-indicator');
  if (!pill) { return; }
  var links = Array.prototype.slice.call(nav.querySelectorAll('ul a')).filter(function (a) { return !a.classList.contains('nav-github'); });
  function move(a) {
    if (!a || window.innerWidth < 900) { pill.style.opacity = '0'; return; }
    var n = nav.getBoundingClientRect(), r = a.getBoundingClientRect();
    pill.style.width = r.width + 'px';
    pill.style.height = r.height + 'px';
    pill.style.transform = 'translate(' + (r.left - n.left) + 'px,' + (r.top - n.top) + 'px)';
    pill.style.opacity = '1';
  }
  function current() { return nav.querySelector('a[aria-current="location"]'); }
  links.forEach(function (a) {
    a.addEventListener('pointerenter', function () { move(a); });
    a.addEventListener('focus', function () { move(a); });
    a.addEventListener('blur', function () { move(current()); });
  });
  nav.addEventListener('pointerleave', function () { move(current()); });
  new MutationObserver(function () { move(current()); }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['aria-current'] });
  window.addEventListener('resize', function () { move(current()); });
})();
