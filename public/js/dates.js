/**
 * Global date formatter — runs on every page.
 * Uses the browser's local timezone automatically.
 *
 * Usage in EJS:
 *   data-date="<%= date.toISOString() %>"          → "March 15, 2026 · 9:30 AM"
 *   data-date-short="<%= date.toISOString() %>"    → "March 15, 9:30 AM"
 *   data-date-scheduled="<%= date.toISOString() %>" → "SCHEDULED FOR MON, MAR 15 · 9:30 AM"
 *                                                      or "SCHEDULED FOR 9:30 AM" if today
 */
document.addEventListener('DOMContentLoaded', function () {

  // Full date + time: "March 15, 2026 · 9:30 AM"
  document.querySelectorAll('[data-date]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-date'));
    if (isNaN(d)) return;
    el.textContent =
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  });

  // Short date + time: "March 15, 9:30 AM"
  document.querySelectorAll('[data-date-short]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-date-short'));
    if (isNaN(d)) return;
    el.textContent =
      d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) +
      ', ' +
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  });

  // Scheduled session label: "SCHEDULED FOR 9:30 AM" or "SCHEDULED FOR MON, MAR 15 · 9:30 AM"
  document.querySelectorAll('[data-date-scheduled]').forEach(function (el) {
    var d = new Date(el.getAttribute('data-date-scheduled'));
    if (isNaN(d)) return;
    var today = new Date();
    var isToday = d.toDateString() === today.toDateString();
    var timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    var label = isToday
      ? timeStr
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + timeStr;
    el.textContent = 'SCHEDULED FOR ' + label.toUpperCase();
  });

});
