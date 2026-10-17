/* Pure logic shared by the browser and the tests. No DOM in here. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MMCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var TYPE_LABELS = {
    home: 'Home moves',
    apartment: 'Apartment moves',
    office: 'Office moves',
    'long-distance': 'Long-distance moves',
    unsure: 'Not sure',
  };

  function digitCount(s) { return String(s || '').replace(/\D/g, '').length; }
  function phoneOk(s) {
    var d = digitCount(s);
    return d >= 10 && d <= 15 && /^[0-9\s().+\-]+$/.test(String(s).trim());
  }
  function emailOk(s) {
    if (!s) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());
  }

  function parseType(search) {
    var p = new URLSearchParams(search || '');
    var type = p.get('type');
    return Object.prototype.hasOwnProperty.call(TYPE_LABELS, type) ? type : '';
  }

  function validate(v) {
    var errs = {};
    if (!v.name || !String(v.name).trim()) errs.name = 'Add your name.';
    if (!phoneOk(v.phone)) errs.phone = 'Add a phone number Kyle can call or text.';
    if (!emailOk(v.email)) errs.email = 'That email does not look right.';
    return errs;
  }

  function message(v) {
    var lines = ['Free estimate request from the website'];
    lines.push('Name: ' + String(v.name || '').trim());
    lines.push('Phone: ' + String(v.phone || '').trim());
    if (v.email) lines.push('Email: ' + String(v.email).trim());
    if (v.date) lines.push('Move date: ' + v.date);
    if (v.movingFrom) lines.push('From: ' + String(v.movingFrom).trim());
    if (v.movingTo) lines.push('To: ' + String(v.movingTo).trim());
    if (v.type) lines.push('Type: ' + (TYPE_LABELS[v.type] || v.type));
    if (v.details) lines.push('Details: ' + String(v.details).trim());
    return lines.join('\n');
  }

  function smsHref(e164, body) { return 'sms:' + e164 + '?&body=' + encodeURIComponent(body); }

  return {
    TYPE_LABELS: TYPE_LABELS,
    phoneOk: phoneOk, emailOk: emailOk,
    parseType: parseType, validate: validate, message: message, smsHref: smsHref,
  };
});
