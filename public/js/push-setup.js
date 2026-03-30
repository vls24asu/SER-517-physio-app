function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function subscribeUserToPush(registration, vapidKey) {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey)
  });
  await fetch('/notifications/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}

function showEnableBanner(registration, vapidKey) {
  if (document.getElementById('push-banner')) return;
  if (localStorage.getItem('push_banner_dismissed')) return;

  const banner = document.createElement('div');
  banner.id = 'push-banner';
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">
      <i class="bi bi-bell-fill" style="color:#F7B32B;font-size:1.1rem;flex-shrink:0;"></i>
      <span style="font-size:13px;font-weight:500;color:#1a1a1a;line-height:1.3;">
        Enable notifications to get workout reminders and achievement alerts
      </span>
    </div>
    <div style="display:flex;gap:8px;flex-shrink:0;">
      <button id="push-enable-btn" style="background:#F7B32B;color:#000;border:none;
        border-radius:8px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;">
        Enable
      </button>
      <button id="push-dismiss-btn" style="background:none;border:none;color:#999;
        font-size:1.1rem;cursor:pointer;padding:4px;">
        <i class="bi bi-x"></i>
      </button>
    </div>
  `;
  banner.style.cssText = [
    'position:fixed', 'bottom:80px', 'left:12px', 'right:12px',
    'background:#fff', 'border-radius:14px',
    'box-shadow:0 4px 20px rgba(0,0,0,0.13)',
    'padding:12px 14px', 'display:flex',
    'align-items:center', 'gap:12px',
    'z-index:8000', 'animation:toastIn 0.25s ease'
  ].join(';');

  document.body.appendChild(banner);

  document.getElementById('push-enable-btn').addEventListener('click', async () => {
    banner.remove();
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      await subscribeUserToPush(registration, vapidKey);
    } catch (err) {
      console.warn('Push subscription failed:', err);
    }
  });

  document.getElementById('push-dismiss-btn').addEventListener('click', () => {
    localStorage.setItem('push_banner_dismissed', '1');
    banner.remove();
  });
}

async function setupPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const vapidMeta = document.querySelector('meta[name="vapid-public-key"]');
  if (!vapidMeta || !vapidMeta.content) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();

    if (existing) {
      // Sync existing subscription to server (handles DB wipes / migrations)
      await fetch('/notifications/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(existing)
      });
      return;
    }

    // Already denied — don't prompt or show banner
    if (Notification.permission === 'denied') return;

    // Permission already granted but no subscription yet (e.g. subscription expired)
    if (Notification.permission === 'granted') {
      await subscribeUserToPush(registration, vapidMeta.content);
      return;
    }

    // Default (not yet asked) — show banner, let user decide
    showEnableBanner(registration, vapidMeta.content);

  } catch (err) {
    console.warn('Push setup failed:', err);
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => setupPushNotifications())
    .catch(err => console.warn('SW registration failed:', err));
}
