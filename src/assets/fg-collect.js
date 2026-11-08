// Counts page loads, nav clicks, service tabs, form submits, and call-button taps.
// Sends no name, phone, email, or page text beyond the link label. The id stays in this browser.
(function () {
  var tag = document.currentScript;
  if (!tag) return;
  var business = tag.getAttribute('data-business');
  var endpoint = tag.getAttribute('data-endpoint') || 'https://forever-gold-crm.forevergoldai.workers.dev/api/collect';
  if (!business) return;
  var key = 'fg_visitor';
  var id = '';
  try { id = localStorage.getItem(key) || ''; } catch (error) { id = ''; }
  if (!/^[A-Za-z0-9-]{8,80}$/.test(id)) {
    id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
    try { localStorage.setItem(key, id); } catch (error) { /* a private browser still counts the hit */ }
  }
  function pathOf(url) {
    try {
      var parsed = new URL(url, location.href);
      if (parsed.origin !== location.origin) return '';
      var path = parsed.pathname || '/';
      if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
      if (path.endsWith('/index.html')) path = path.slice(0, -11) || '/';
      if (path === '/index.html') path = '/';
      return path || '/';
    } catch (error) {
      return '';
    }
  }
  function send(kind, path, label) {
    var body = JSON.stringify({
      business: business,
      kind: kind,
      path: path || '/',
      label: String(label || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      visitor: id,
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }))) return;
    } catch (error) { /* fall through to fetch */ }
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: body,
      keepalive: true,
      mode: 'cors',
    }).catch(function () {});
  }
  function here() { return pathOf(location.href); }
  function words(node) { return (node && node.textContent ? node.textContent : '').replace(/\s+/g, ' ').trim(); }
  send('visit', here(), document.title);
  document.addEventListener('click', function (event) {
    var node = event.target && event.target.closest ? event.target : null;
    if (!node || !node.closest) return;
    var link = node.closest('a');
    if (link && link.href && link.href.indexOf('tel:') === 0) {
      send('call', here(), 'Call');
      return;
    }
    var tab = node.closest('.picker-tab, [role="tab"]');
    if (tab) {
      var name = words(tab).slice(0, 40) || 'Tab';
      send('click', here() + '#' + name, name);
      return;
    }
    if (link && link.closest('header nav, header .nav, header .nav-links')) {
      var dest = pathOf(link.href);
      if (dest) send('click', dest, words(link));
    }
  }, true);
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form || !form.tagName || form.tagName !== 'FORM') return;
    send('form', here(), 'Form');
  }, true);
}());
