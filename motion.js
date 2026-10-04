/* HR MOTION KIT · motion.js  (Amicro 스타일 마이크로 인터랙션을 순수 JS로) */
(function () {
  'use strict';
  var d = document.documentElement;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }

  /* 1) 글자 순차 등장: data-split 요소의 단어를 감싼다 */
  function split(el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement('span'); w.className = 'tw';
            var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('tw')) {
          walk(c);
        }
      });
    })(el);
  }

  /* 2) 스크롤 등장 */
  function reveal() {
    if (!d.classList.contains('rv-js')) return;
    d.classList.add('rv-ready');
    $$('[data-split]').forEach(split);
    $$('[data-stagger]').forEach(function (g) {
      var step = parseFloat(g.getAttribute('data-stagger')) || 0.08;
      $$('[data-rv]', g).forEach(function (el, i) { if (el.parentElement === g || el.closest('[data-stagger]') === g) el.style.setProperty('--d', (i * step).toFixed(2) + 's'); });
    });
    var els = $$('[data-rv],[data-split],.fan,[data-count]');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; t.classList.add('is-in'); io.unobserve(t);
        if (t.hasAttribute('data-count')) count(t);
        setTimeout(function () { t.classList.add('rv-done'); }, 1600);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* 3) 숫자 카운트업 */
  function count(el) {
    var target = el.getAttribute('data-count'), n = parseFloat(target.replace(/,/g, ''));
    var dec = (target.split('.')[1] || '').length, t0 = null, dur = 1600;
    if (isNaN(n)) return;
    function fmt(v) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.firstChild.nodeValue = fmt(n * e);
      if (p < 1) requestAnimationFrame(tick); else el.firstChild.nodeValue = target;
    }
    el.firstChild.nodeValue = fmt(0);
    requestAnimationFrame(tick);
  }

  /* 4) 3D 기울기 카드 + 커서 빛 */
  function tilt() {
    if (!fine) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6, raf = 0;
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add('is-tilting');
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * max).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max).toFixed(2) + 'deg) translateY(-4px)';
          el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); el.classList.remove('is-tilting'); el.style.transform = ''; });
    });
    $$('.spot:not([data-tilt])').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* 5) 자석 버튼 */
  function magnet() {
    if (!fine) return;
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect(), x = ev.clientX - r.left - r.width / 2, y = ev.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * 0.22).toFixed(1) + 'px,' + (y * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* 6) 3D 커버플로우 */
  function coverflow() {
    $$('.cflow').forEach(function (root) {
      var cards = $$('.cf-card', root), n = cards.length, cur = 0;
      var dots = root.parentElement.querySelector('.cf-dots');
      if (dots) cards.forEach(function (c, i) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', (i + 1) + '번째 카드');
        b.addEventListener('click', function () { go(i); }); dots.appendChild(b);
      });
      function go(i) {
        cur = (i + n) % n;
        cards.forEach(function (c, k) {
          var o = k - cur; if (o > n / 2) o -= n; if (o < -n / 2) o += n;
          c.style.setProperty('--o', o); c.style.setProperty('--a', Math.abs(o));
          c.classList.toggle('is-on', o === 0); c.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
          c.tabIndex = o === 0 ? 0 : -1;
        });
        if (dots) $$('button', dots).forEach(function (b, k) { b.classList.toggle('is-on', k === cur); });
      }
      cards.forEach(function (c, k) {
        c.addEventListener('click', function (e) {
          if (k !== cur) { e.preventDefault(); go(k); }
        });
      });
      var ui = root.parentElement;
      var prev = ui.querySelector('.cf-prev'), next = ui.querySelector('.cf-next');
      prev && prev.addEventListener('click', function () { go(cur - 1); });
      next && next.addEventListener('click', function () { go(cur + 1); });
      root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1); });
      var sx = null;
      root.addEventListener('pointerdown', function (e) { sx = e.clientX; });
      root.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
      go(0);
    });
  }

  /* 7) 연혁 진행선 */
  function timeline() {
    var tl = document.querySelector('.tl'), bar = tl && tl.querySelector('.tl-prog');
    if (!bar) return;
    var ticking = false;
    function upd() {
      ticking = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height));
      bar.style.setProperty('--p', (p * 100).toFixed(2) + '%');
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* 8) 페이지 전환 (Radial iris) */
  function transitions() {
    if (rm) return;
    function done() { d.classList.add('pt-go'); setTimeout(function () { d.classList.remove('pt-in', 'pt-go'); }, 800); }
    if (d.classList.contains('pt-in')) requestAnimationFrame(function () { requestAnimationFrame(done); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) d.classList.remove('pt-out', 'pt-in', 'pt-go'); });
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || a.hasAttribute('download')) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || u.protocol.indexOf('http') !== 0) return;
      if (u.pathname === location.pathname) return;
      e.preventDefault();
      d.style.setProperty('--px', e.clientX + 'px'); d.style.setProperty('--py', e.clientY + 'px');
      d.classList.add('pt-out');
      try { sessionStorage.setItem('pt', '1'); } catch (x) {}
      setTimeout(function () { location.href = u.href; }, 480);
    });
  }

  function init() { reveal(); tilt(); magnet(); coverflow(); timeline(); transitions(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* 화면 밖 섹션은 반복 애니메이션 정지 (성능) */
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var secs = document.querySelectorAll('main > section, footer');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '120px 0px' });
    for (var i = 0; i < secs.length; i++) io.observe(secs[i]);
  })();
})();
