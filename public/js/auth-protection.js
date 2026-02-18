// Prevent back navigation after logout and ensure session is valid
(function() {
  'use strict';
  
  const currentPath = window.location.pathname;
  const isProtectedPage =
    currentPath === '/dashboard' ||
    currentPath === '/profile' ||
    currentPath.startsWith('/profile/');

  async function ensureSession() {
    try {
      const resp = await fetch('/auth/session', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) {
        // Not authenticated anymore (e.g., after logout)
        window.location.replace('/login');
      }
    } catch (_e) {
      // If the check fails, fail closed.
      window.location.replace('/login');
    }
  }

  if (isProtectedPage) {
    // bfcache restore can show the previous DOM without hitting the server.
    // This check ensures logged-out users cannot see cached protected pages.
    window.addEventListener('pageshow', function(event) {
      if (event.persisted) ensureSession();
    });

    // Also re-check when tab becomes visible (covers some back/forward cases).
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') ensureSession();
    });
  }
})();
