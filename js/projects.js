/**
 * projects.js
 * ---------------------------------------------------------------------------
 * Single source of truth for the project showcase (Chapter 04) and the
 * optional "recent on GitHub" list.
 *
 * HOW IT WORKS
 * - index.html already contains the four projects as static HTML, so search
 *   engines and visitors without JavaScript see the full descriptions.
 * - On load, this file renders the same markup from the PROJECTS array below.
 *   If you edit PROJECTS, the page updates. To keep the static HTML in sync
 *   for SEO, copy the changes into the matching <article> in index.html
 *   (or run: node js/projects.js  to print fresh HTML you can paste in).
 *
 * FACT RULES
 * - Every field below comes from the live sites or the GitHub repositories.
 * - `repo: null` means no matching repository has been confirmed. Do not
 *   guess a URL: add it only after checking the repository yourself.
 */
(function (root) {
  'use strict';

  var OWNER = 'iamdeveloperuday';

  /** layout: 'wide' | 'offset' | 'stack' | 'compact' (controls composition in CSS)
   *  mock:   'directory' | 'store' | 'quick' | 'folio' (abstract layout sketch)
   *  image:  optional screenshot path. When set, it replaces the sketch.        */
  var PROJECTS = [
    {
      id: 'studora',
      title: 'Studora',
      kind: 'Student directory',
      layout: 'wide',
      mock: 'directory',
      host: 'studora-uday.netlify.app',
      summary:
        'A student directory for browsing, searching and adding student profiles. ' +
        'It was built to practise HTML, CSS and JavaScript on something that behaves like a real application.',
      features: [
        'Profile cards with a search box and a Load More button',
        'An Add Student form with fields for class, stream, status and contact details',
        'A detailed student profile view',
        'A light and dark theme control'
      ],
      purpose: 'Practising HTML, CSS and JavaScript through an application-style project.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      live: 'https://studora-uday.netlify.app/',
      repo: "https://github.com/' + OWNER + '/studentmanagement'", // No matching repository confirmed yet.
      image: "assets/images/pro1.png", // e.g. 'assets/images/studora-student-directory-preview.webp'
      imageAlt: 'studora-uday'
    },
    {
      id: 'everest-reserve',
      title: 'Everest Reserve',
      kind: 'Online store concept',
      layout: 'wide',
      mock: 'store',
      host: 'everestreserve.netlify.app',
      summary:
        'A responsive storefront concept for a Nepal-based online shop. ' +
        'The page lays out a hero banner, a product grid with prices and stock counts, a special-offers section with discount badges, service highlights, contact details and a newsletter sign-up.',
      features: [
        'Product grid and a separate special-offers row',
        'Service highlights and contact section',
        'Layout that adapts from phone to desktop'
      ],
      purpose: 'Practising storefront layout and responsive design. Product data on the page is sample content.',
      tech: ['HTML', 'CSS', 'JavaScript'],
      live: 'https://everestreserve.netlify.app/',
      repo: 'https://github.com/' + OWNER + '/alcoholshop', // Matches the live site structure (img/, product/, script.js). Confirm it is the right repo.
      image: "assets/images/pro2.png",
      imageAlt: 'e-commerse'
    },
    {
      id: 'blinkit-clone',
      title: 'Blinkit Clone',
      kind: 'Quick-commerce homepage clone',
      layout: 'wide',
      mock: 'quick',
      host: 'blinkitclonee.netlify.app',
      summary:
        'A front-end recreation of a quick-delivery grocery homepage, made for layout practice. ' +
        'It includes a delivery-time header with a location bar, a hero slider, product rows grouped by category with prices and add buttons, and a long footer directory of categories. It is an independent learning project, not affiliated with the real brand.',
      features: [
        'Category rows of product tiles with prices',
        'Hero slider area and delivery-time header',
        'Footer with a full category directory'
      ],
      purpose: 'Learning to recreate a dense, real-world interface with HTML and CSS.',
      tech: ['HTML', 'CSS'],
      live: 'https://blinkitclonee.netlify.app/',
      repo: 'https://github.com/' + OWNER + '/blinkitclone',
      image:"assets/images/pro3.png",
      imageAlt: 'blinkit clone'
    },
   
  ];

  /** Optional GitHub feed ("Recent on GitHub"). Failure never breaks the page. */
  var GITHUB = {
    enabled: true,
    max: 3,
    ttlMs: 60 * 60 * 1000, // cache for one hour in sessionStorage
    languages: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
    // Repositories that should never appear in the feed.
    exclude: ['amanbaniyaportfolio', 'udaygupta001']
  };

  /* ------------------------------------------------------------------ */
  /* Template helpers                                                    */
  /* ------------------------------------------------------------------ */

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function repeat(count, html) {
    return new Array(count + 1).join(html);
  }

  /** Abstract layout sketches. They are decorative, so they are hidden from
   *  assistive technology. Replace with real screenshots via the `image` field. */
  function sketch(project) {
    var inner = '';
    switch (project.mock) {
      case 'directory':
        inner =
          '<b class="m-search"></b><div class="m-grid">' +
          repeat(6, '<span class="m-card"><i></i><u></u><u></u></span>') +
          '</div>';
        break;
      case 'store':
        inner =
          '<b class="m-hero"></b><div class="m-grid m-grid--4">' +
          repeat(4, '<span class="m-card m-card--tall"><i></i><u></u></span>') +
          '</div>';
        break;
      case 'quick':
        inner =
          '<b class="m-top"></b><b class="m-slider"></b><div class="m-row">' +
          repeat(6, '<span class="m-tile"></span>') +
          '</div>';
        break;
      default:
        inner = '<b class="m-type"></b><b class="m-type m-type--2"></b><span class="m-orb"></span>';
    }
    return (
      '<div class="mock mock--' + esc(project.mock) + '" aria-hidden="true">' +
      '<div class="mock__bar"><i></i><i></i><i></i><span>' + esc(project.host) + '</span></div>' +
      '<div class="mock__screen">' + inner + '</div></div>'
    );
  }

  function media(project) {
    if (project.image) {
      return (
        '<img class="project__img" src="' + esc(project.image) + '" alt="' + esc(project.imageAlt) +
        '" width="1280" height="800" loading="lazy" decoding="async">'
      );
    }
    return sketch(project);
  }

  function link(href, cls, label, hidden) {
    return (
      '<a class="btn ' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(label) + ' <span class="sr-only">' + esc(hidden) + '</span></a>'
    );
  }

  function projectHTML(p) {
    var titleId = 'project-' + p.id + '-title';
    var tags = p.tech
      .map(function (t) { return '<li>' + esc(t) + '</li>'; })
      .join('');
    var features = p.features
      .map(function (f) { return '<li>' + esc(f) + '</li>'; })
      .join('');
    var links = '';
    if (p.live) {
      links += link(p.live, 'btn--primary', 'Open live demo', 'of ' + p.title + ' (opens in a new tab)');
    }
    if (p.repo) {
      links += link(p.repo, 'btn--ghost', 'View source', 'for ' + p.title + ' on GitHub (opens in a new tab)');
    }
    if (!p.live && !p.repo) {
      links = '<span class="project__note">Links coming soon.</span>';
    }
    return (
      '<article class="project project--' + esc(p.layout) + '" id="project-' + esc(p.id) +
      '" aria-labelledby="' + titleId + '" data-reveal>' +
      '<div class="project__media" data-parallax>' + media(p) + '</div>' +
      '<div class="project__body">' +
      '<p class="project__kind">' + esc(p.kind) + '</p>' +
      '<h3 class="project__title" id="' + titleId + '">' + esc(p.title) + '</h3>' +
      '<p class="project__summary">' + esc(p.summary) + '</p>' +
      '<ul class="project__features">' + features + '</ul>' +
      '<dl class="project__facts">' +
      '<div><dt>Why I built it</dt><dd>' + esc(p.purpose) + '</dd></div>' +
      '<div><dt>Built with</dt><dd><ul class="tags">' + tags + '</ul></dd></div>' +
      '</dl>' +
      '<p class="project__links">' + links + '</p>' +
      '</div></article>'
    );
  }

  function allProjectsHTML(list) {
    return list.map(projectHTML).join('\n');
  }

  /* ------------------------------------------------------------------ */
  /* Node usage: `node js/projects.js` prints the static HTML            */
  /* ------------------------------------------------------------------ */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROJECTS: PROJECTS, projectHTML: projectHTML, allProjectsHTML: allProjectsHTML };
    if (require.main === module) {
      process.stdout.write(allProjectsHTML(PROJECTS) + '\n');
    }
    return;
  }

  /* ------------------------------------------------------------------ */
  /* Browser: render projects                                            */
  /* ------------------------------------------------------------------ */
  root.PORTFOLIO_PROJECTS = PROJECTS;

  var list = document.getElementById('project-list');
  if (list) {
    list.innerHTML = allProjectsHTML(PROJECTS);
  }

  /* ------------------------------------------------------------------ */
  /* Browser: optional GitHub feed                                       */
  /* ------------------------------------------------------------------ */
  var feed = document.getElementById('github-feed');
  var status = document.getElementById('github-feed-status');
  if (!GITHUB.enabled || !feed) { return; }

  var CACHE_KEY = 'ub:gh-repos:v1';

  function setStatus(text) {
    if (status) { status.textContent = text; }
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) { return null; }
      var parsed = JSON.parse(raw);
      if (Date.now() - parsed.t > GITHUB.ttlMs) { return null; }
      return parsed.data;
    } catch (err) {
      return null; // Storage can be unavailable (private mode, blocked cookies).
    }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data }));
    } catch (err) { /* ignore */ }
  }

  function featuredNames() {
    return PROJECTS
      .filter(function (p) { return p.repo; })
      .map(function (p) { return p.repo.split('/').pop().toLowerCase(); });
  }

  /** Relevance, not popularity: own, non-fork, front-end languages, newest push first. */
  function pick(repos) {
    var skip = featuredNames().concat(GITHUB.exclude.map(function (n) { return n.toLowerCase(); }));
    return repos
      .filter(function (r) {
        return r && !r.fork && !r.archived &&
          skip.indexOf(String(r.name).toLowerCase()) === -1 &&
          GITHUB.languages.indexOf(r.language) !== -1;
      })
      .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
      .slice(0, GITHUB.max);
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) { return ''; }
    return d.toLocaleDateString('en', { year: 'numeric', month: 'short' });
  }

  function render(repos) {
    if (!repos.length) {
      setStatus('No additional public repositories to show right now. Everything is on my GitHub profile.');
      return;
    }
    feed.innerHTML = repos.map(function (r) {
      var desc = r.description ? esc(r.description) : 'No description yet.';
      var updated = formatDate(r.pushed_at);
      return (
        '<li class="repo"><a class="repo__name" href="' + esc(r.html_url) +
        '" target="_blank" rel="noopener noreferrer">' + esc(r.name) +
        ' <span class="sr-only">(opens in a new tab)</span></a>' +
        '<p class="repo__desc">' + desc + '</p>' +
        '<p class="repo__meta">' + esc(r.language) + (updated ? ' · Updated ' + esc(updated) : '') + '</p></li>'
      );
    }).join('');
    setStatus('');
  }

  var cached = readCache();
  if (cached) {
    render(pick(cached));
    return;
  }

  if (typeof fetch !== 'function') { return; }

  fetch('https://api.github.com/users/' + OWNER + '/repos?type=owner&sort=pushed&per_page=100', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then(function (res) {
      if (res.status === 403 || res.status === 429) {
        throw new Error('rate-limited');
      }
      if (!res.ok) { throw new Error('http-' + res.status); }
      return res.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) { throw new Error('unexpected-response'); }
      writeCache(data);
      render(pick(data));
    })
    .catch(function () {
      // Keep the static fallback link visible; never show a broken widget.
      setStatus('Recent repositories could not be loaded. The full list is on my GitHub profile.');
    });
})(typeof window !== 'undefined' ? window : globalThis);
