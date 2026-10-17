/* Page behaviour. Motion sells on the way in; the estimate form never animates. */
(function () {
  'use strict';
  window.__mmReady = true;
  var CFG = window.MM_CONFIG || {};
  var Core = window.MMCore;
  var motionOK = window.matchMedia && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  }
  var onScrollHeader = function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Home hero: Bridger/GMM scrubber. Scroll is the play head. Never autoplays.
  var hero = document.querySelector('[data-hero-slot]');
  var heroVideo = hero && hero.querySelector('[data-hero-video]');
  var heroCanvas = hero && hero.querySelector('[data-hero-canvas]');
  var heroCtx = heroCanvas && heroCanvas.getContext && heroCanvas.getContext('2d', { alpha: false });
  var saveData = typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData;
  var canMotion = document.documentElement.classList.contains('js-motion') && motionOK && !saveData;
  if (hero) applyBeats(0, !canMotion);
  if (heroVideo && heroCtx && canMotion) bootHeroScrub();

  function applyBeats(p, forceReveal) {
    if (!hero) return;
    hero.style.setProperty('--hero-p', String(p));
    var b1 = hero.querySelector('[data-beat="1"]');
    var b2 = hero.querySelector('[data-beat="2"]');
    var b3 = hero.querySelector('[data-beat="3"]');
    if (b1) b1.classList.toggle('is-on', forceReveal ? false : (p >= 0 && p <= 0.28));
    if (b2) b2.classList.toggle('is-on', forceReveal ? false : (p >= 0.32 && p <= 0.58));
    if (b3) b3.classList.toggle('is-on', forceReveal ? true : p >= 0.62);
  }

  function pickSrc() {
    var portrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
    var src9 = heroVideo.getAttribute('data-src-9x16');
    var src16 = heroVideo.getAttribute('data-src-16x9');
    if (portrait && src9) return src9;
    return src16 || src9 || '';
  }

  function bootHeroScrub() {
    if (!heroVideo.getAttribute('data-src-16x9') && !heroVideo.getAttribute('data-src-9x16')) {
      hero.classList.add('is-static');
      applyBeats(1, true);
      return;
    }
    var media = hero.querySelector('.hero-media');
    var inner = hero.querySelector('.hero-inner');
    var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
    var holdFrom = (CFG.hero && CFG.hero.holdFrom) || 0.88;
    var targetProgress = 0, displayedProgress = 0, frame = 0, ready = false, primed = false, seekPending = false;

    var drawFrame = function () {
      if (rmq.matches || heroVideo.readyState < 2 || !heroVideo.videoWidth) return;
      var density = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(heroCanvas.clientWidth * density));
      var h = Math.max(1, Math.round(heroCanvas.clientHeight * density));
      if (heroCanvas.width !== w) heroCanvas.width = w;
      if (heroCanvas.height !== h) heroCanvas.height = h;
      var scale = Math.max(w / heroVideo.videoWidth, h / heroVideo.videoHeight);
      var vw = heroVideo.videoWidth * scale, vh = heroVideo.videoHeight * scale;
      heroCtx.drawImage(heroVideo, (w - vw) * 0.5, (h - vh) * 0.5, vw, vh);
      heroCanvas.classList.add('is-ready');
    };

    var videoProgress = function (p) {
      if (p >= holdFrom) return 1;
      return holdFrom > 0 ? p / holdFrom : p;
    };

    var seek = function () {
      frame = 0;
      var duration = heroVideo.duration;
      if (!ready || rmq.matches || !isFinite(duration) || duration <= 0) return;
      displayedProgress += (targetProgress - displayedProgress) * 0.22;
      if (Math.abs(targetProgress - displayedProgress) < 0.0005) displayedProgress = targetProgress;
      var safeEnd = Math.max(0, duration - 0.04);
      var wantedTime = videoProgress(displayedProgress) * safeEnd;
      if (!seekPending && !heroVideo.seeking && Math.abs(heroVideo.currentTime - wantedTime) > 0.018) {
        seekPending = true;
        heroVideo.currentTime = wantedTime;
        window.setTimeout(function () { seekPending = false; }, 280);
      }
      applyBeats(displayedProgress, false);
      var caughtUp = displayedProgress === targetProgress && !heroVideo.seeking &&
        Math.abs(heroVideo.currentTime - videoProgress(targetProgress) * safeEnd) <= 0.024;
      if (!caughtUp) frame = requestAnimationFrame(seek);
    };

    var readScroll = function () {
      if (!ready) return;
      var rect = hero.getBoundingClientRect();
      var top = parseFloat(window.getComputedStyle(media).top) || 0;
      var scrollable = hero.offsetHeight - media.offsetHeight;
      targetProgress = scrollable > 0 ? Math.min(1, Math.max(0, (top - rect.top) / scrollable)) : 0;
      if (!frame) frame = requestAnimationFrame(seek);
    };

    var fitCopy = function () {
      inner.classList.toggle('is-pinned', inner.offsetHeight <= media.offsetHeight + 1);
    };

    var giveUp = function () {
      if (ready || !hero.classList.contains('is-scrub')) return;
      var top = parseFloat(window.getComputedStyle(media).top) || 0;
      if (hero.getBoundingClientRect().top >= top - 1) {
        hero.classList.remove('is-scrub');
        hero.classList.add('is-static');
        applyBeats(1, true);
      }
    };

    var markReady = function () {
      if (primed) return;
      primed = true;
      var finished = false;
      var finish = function () {
        if (finished) return;
        finished = true;
        heroVideo.pause();
        ready = true;
        if (!hero.classList.contains('is-scrub') && hero.getBoundingClientRect().top >= (parseFloat(window.getComputedStyle(media).top) || 0) - 1) {
          hero.classList.add('is-scrub');
          hero.classList.remove('is-static');
        }
        fitCopy();
        drawFrame();
        readScroll();
      };
      var finishAfterFirstFrame = function () {
        if (typeof heroVideo.requestVideoFrameCallback === 'function') heroVideo.requestVideoFrameCallback(finish);
        else requestAnimationFrame(function () { requestAnimationFrame(finish); });
        window.setTimeout(finish, 800);
      };
      var playback = heroVideo.play();
      if (playback && typeof playback.then === 'function') playback.then(finishAfterFirstFrame, finish);
      else finishAfterFirstFrame();
      window.setTimeout(finish, 1500);
    };

    heroVideo.addEventListener('loadeddata', markReady, { once: true });
    heroVideo.addEventListener('seeked', function () { seekPending = false; drawFrame(); });
    heroVideo.addEventListener('error', giveUp);
    window.addEventListener('scroll', readScroll, { passive: true });
    window.addEventListener('resize', function () {
      fitCopy();
      if (!ready) return;
      drawFrame();
      readScroll();
    }, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCopy);

    hero.classList.add('is-scrub');
    fitCopy();
    if (rmq.addEventListener) {
      rmq.addEventListener('change', function () {
        if (rmq.matches) {
          heroCanvas.classList.remove('is-ready');
          applyBeats(1, true);
        } else { drawFrame(); readScroll(); }
      });
    }

    heroVideo.muted = true;
    heroVideo.preload = 'auto';
    var src = pickSrc();
    if (!src) { giveUp(); return; }
    heroVideo.setAttribute('src', src);
    var request = heroVideo.play();
    if (request && request.catch) request.catch(function () {});
    window.setTimeout(function () { if (!primed) giveUp(); }, 6000);
    if (heroVideo.readyState >= 2) markReady();

    var orient = window.matchMedia && window.matchMedia('(orientation: portrait)');
    if (orient && orient.addEventListener) {
      orient.addEventListener('change', function () {
        var next = pickSrc();
        if (!next || heroVideo.getAttribute('src') === next) return;
        primed = false; ready = false;
        heroVideo.setAttribute('src', next);
        heroVideo.load();
      });
    }
  }

  var form = document.getElementById('estimate-form');
  if (form && Core) initForm(form);

  function initForm(form) {
    var thanks = document.getElementById('form-thanks');
    var handoff = document.getElementById('form-handoff');
    var oops = document.getElementById('form-error');
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.innerHTML;
    var endpoint = form.getAttribute('data-endpoint') || '';
    var sending = false;
    var f = function (n) { return form.elements.namedItem(n); };

    var preType = Core.parseType(window.location.search);
    if (preType && !f('type').value) f('type').value = preType;

    var d = new Date();
    if (f('date')) f('date').min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    var values = function () {
      return {
        name: f('name').value, phone: f('phone').value, email: f('email').value,
        date: f('date') ? f('date').value : '',
        movingFrom: f('movingFrom') ? f('movingFrom').value : '',
        movingTo: f('movingTo') ? f('movingTo').value : '',
        type: f('type') ? f('type').value : '',
        details: f('details') ? f('details').value : '',
      };
    };

    var clearErrors = function () {
      form.querySelectorAll('.field.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
      form.querySelectorAll('.field-err').forEach(function (n) { n.remove(); });
      form.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
    };
    var showErrors = function (errs) {
      var first = null;
      Object.keys(errs).forEach(function (k) {
        var input = f(k);
        if (!input) return;
        var field = input.closest('.field');
        field.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        var msg = document.createElement('span');
        msg.className = 'field-err';
        msg.id = 'err-' + k;
        msg.textContent = errs[k];
        field.appendChild(msg);
        input.setAttribute('aria-describedby', msg.id);
        if (!first) first = input;
      });
      if (first) first.focus();
    };
    var hideAll = function () { [thanks, handoff, oops].forEach(function (p) { if (p) p.hidden = true; }); };
    var show = function (panel) { hideAll(); panel.hidden = false; panel.focus({ preventScroll: true }); panel.scrollIntoView({ block: 'center' }); };
    var reset = function () { sending = false; btn.disabled = false; btn.innerHTML = btnLabel; };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (sending) return;
      clearErrors();
      hideAll();
      var v = values();
      var errs = Core.validate(v);
      if (Object.keys(errs).length) { showErrors(errs); return; }
      if (f('company') && f('company').value) { show(thanks); form.hidden = true; return; }

      var text = Core.message(v);
      var smsLink = Core.smsHref(CFG.phoneE164, text);
      var errSms = document.getElementById('error-sms');
      if (errSms) errSms.setAttribute('href', smsLink);

      if (!endpoint) {
        document.getElementById('handoff-sms').setAttribute('href', smsLink);
        show(handoff);
        return;
      }

      sending = true;
      btn.disabled = true;
      btn.textContent = 'Sending...';
      var payload = Object.assign({}, v, { message: text, page: window.location.href, submittedAt: new Date().toISOString() });
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          form.hidden = true;
          show(thanks);
        })
        .catch(function () {
          reset();
          if (document.getElementById('handoff-sms')) document.getElementById('handoff-sms').setAttribute('href', smsLink);
          show(oops);
        });
    });
  }
})();
