/*!
 * BlitzerSafe Landing Page – script.js
 * Handles: lang toggle, theme toggle, iPhone screen cycle,
 *          showcase tabs, reveal animations, navbar scroll,
 *          mobile menu, FAQ accordion, back-to-top, cookie banner.
 */
(function () {
  'use strict';

  // ─── Language Toggle ────────────────────────────────────────
  function initLangToggle() {
    var lang = localStorage.getItem('bs-lang') || 'de';

    function applyLang(l) {
      lang = l;
      localStorage.setItem('bs-lang', l);

      // Toggle button states
      ['lang-de', 'lang-en', 'lang-de-m', 'lang-en-m'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        var isActive = id.indexOf('-' + l) !== -1 && id.indexOf('-m') === (id.endsWith('-m') ? id.length - 2 : -1);
        // simpler: check suffix
        if (id === 'lang-' + l || id === 'lang-' + l + '-m') {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });

      // Translate all data-de / data-en elements
      document.querySelectorAll('[data-de][data-en]').forEach(function (el) {
        var val = l === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-de');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.innerHTML = val;
        }
      });

      // Update html lang attribute
      document.documentElement.lang = l === 'en' ? 'en' : 'de';
    }

    function bindBtn(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var l = id.replace('lang-', '').replace('-m', '');
      el.addEventListener('click', function () { applyLang(l); });
    }

    ['lang-de', 'lang-en', 'lang-de-m', 'lang-en-m'].forEach(bindBtn);
    applyLang(lang);
  }

  // ─── Theme Toggle ────────────────────────────────────────────
  function initThemeToggle() {
    var html = document.documentElement;
    var saved = localStorage.getItem('bs-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');

    function applyTheme(t) {
      theme = t;
      html.setAttribute('data-theme', t);
      localStorage.setItem('bs-theme', t);
      var sun = document.getElementById('icon-sun');
      var moon = document.getElementById('icon-moon');
      if (sun) sun.style.display = t === 'dark' ? 'none' : 'block';
      if (moon) moon.style.display = t === 'dark' ? 'block' : 'none';
    }

    function toggleTheme() {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    }

    var btnD = document.getElementById('theme-toggle');
    var btnM = document.getElementById('theme-toggle-m');
    if (btnD) btnD.addEventListener('click', toggleTheme);
    if (btnM) btnM.addEventListener('click', toggleTheme);
    applyTheme(theme);
  }

  // ─── iPhone Screen Cycle ─────────────────────────────────────
  function initIphoneScreenCycle() {
    var screens = document.querySelectorAll('.app-screen');
    if (!screens.length) return;
    var current = 0;

    function next() {
      screens[current].classList.remove('active');
      current = (current + 1) % screens.length;
      screens[current].classList.add('active');
    }

    setInterval(next, 4200);
  }

  // ─── Showcase Tabs ───────────────────────────────────────────
  function initShowcaseTabs() {
    var btns = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.tab-panel');
    if (!btns.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tab = btn.getAttribute('data-tab');

        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        panels.forEach(function (p) {
          p.classList.remove('active');
          if (p.id === 'tab-' + tab) p.classList.add('active');
        });
      });
    });
  }

  // ─── Scroll Reveal ───────────────────────────────────────────
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('reveal--visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal--visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function (el) { obs.observe(el); });
  }

  // ─── Navbar Scroll ───────────────────────────────────────────
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }, { passive: true });
  }

  // ─── Mobile Menu ─────────────────────────────────────────────
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-nav');
    if (!btn || !menu) return;

    var open = false;

    btn.addEventListener('click', function () {
      open = !open;
      menu.style.display = open ? 'block' : 'none';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (open && !menu.contains(e.target) && !btn.contains(e.target)) {
        open = false;
        menu.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ─── FAQ Accordion ───────────────────────────────────────────
  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        // Close all
        items.forEach(function (i) {
          i.classList.remove('open');
          var q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked if was closed
        if (!isOpen) {
          item.classList.add('open');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ─── Back to Top ─────────────────────────────────────────────
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Cookie Banner ───────────────────────────────────────────
  function initCookieBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    if (localStorage.getItem('bs-cookies')) return;

    // Show after 800ms
    setTimeout(function () {
      banner.classList.add('visible');
    }, 800);

    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');

    function dismiss() {
      banner.classList.remove('visible');
    }

    if (accept) {
      accept.addEventListener('click', function () {
        localStorage.setItem('bs-cookies', 'accepted');
        dismiss();
      });
    }

    if (reject) {
      reject.addEventListener('click', function () {
        localStorage.setItem('bs-cookies', 'rejected');
        dismiss();
      });
    }
  }

  // ─── Smooth Anchor Scroll ────────────────────────────────────
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var navH = (document.getElementById('nav') || {}).offsetHeight || 72;
        var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Close mobile nav if open
        var mobileNav = document.getElementById('mobile-nav');
        if (mobileNav) mobileNav.style.display = 'none';
      });
    });
  }

  // ─── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    initLangToggle();
    initIphoneScreenCycle();
    initShowcaseTabs();
    initReveal();
    initNavScroll();
    initMobileMenu();
    initFAQ();
    initBackToTop();
    initCookieBanner();
    initSmoothAnchors();
  });
}());
