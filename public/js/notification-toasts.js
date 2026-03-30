(function () {
  const STORAGE_KEY = 'notif_last_seen_id';

  const TYPE_META = {
    session_completed:    { icon: 'bi-check-circle-fill',       color: '#22c55e' },
    achievement_unlocked: { icon: 'bi-trophy-fill',             color: '#F7B32B' },
    streak_active:        { icon: 'bi-fire',                    color: '#f97316' },
    streak_broken:        { icon: 'bi-exclamation-circle-fill', color: '#ef4444' },
    progress_milestone:   { icon: 'bi-graph-up-arrow',         color: '#3b82f6' },
    pain_checkin:         { icon: 'bi-heart-pulse-fill',        color: '#a855f7' },
    workout_reminder:     { icon: 'bi-alarm-fill',              color: '#6b7280' },
  };

  function getContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(notification) {
    const meta = TYPE_META[notification.type] || { icon: 'bi-bell-fill', color: '#6b7280' };
    const toast = document.createElement('div');
    toast.style.cssText = [
      'display:flex', 'align-items:flex-start', 'gap:10px',
      'background:#fff', 'border-radius:14px',
      'padding:12px 14px',
      'box-shadow:0 4px 16px rgba(0,0,0,0.12)',
      'border-left:3px solid ' + meta.color,
      '--toast-color:' + meta.color,
      'animation:toastIn 0.25s ease',
      'cursor:pointer'
    ].join(';');

    toast.innerHTML = `
      <div style="width:36px;height:36px;border-radius:9px;background:${meta.color}22;
                  display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="bi ${meta.icon}" style="color:${meta.color};font-size:1rem;"></i>
      </div>
      <div style="flex:1;min-width:0;">
        <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#1a1a1a;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${notification.title}
        </p>
        <p style="margin:0;font-size:12px;color:#666;line-height:1.4;">
          ${notification.message}
        </p>
      </div>
      <button style="background:none;border:none;color:#bbb;font-size:1rem;
                     cursor:pointer;padding:0;line-height:1;flex-shrink:0;"
              aria-label="Dismiss">
        <i class="bi bi-x"></i>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    function dismiss() {
      toast.style.animation = 'toastOut 0.2s ease forwards';
      setTimeout(() => toast.remove(), 200);
    }
    closeBtn.addEventListener('click', e => { e.stopPropagation(); dismiss(); });
    toast.addEventListener('click', () => {
      window.location.href = '/notifications';
    });

    getContainer().appendChild(toast);

    // Mark as read silently
    fetch(`/notifications/${notification.id}/read`, { method: 'POST' }).catch(() => {});

    // Auto-dismiss after 5 seconds
    setTimeout(dismiss, 5000);
  }

  async function checkForNewNotifications() {
    try {
      const res = await fetch('/notifications/latest-unread');
      const { notifications } = await res.json();
      if (!notifications || notifications.length === 0) return;

      const lastSeenId = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      const newOnes = notifications.filter(n => n.id > lastSeenId);

      if (newOnes.length > 0) {
        // Update last seen to the highest id
        const maxId = Math.max(...newOnes.map(n => n.id));
        localStorage.setItem(STORAGE_KEY, maxId);

        // Show toasts with a slight stagger
        newOnes.reverse().forEach((n, i) => {
          setTimeout(() => showToast(n), i * 150);
        });
      }
    } catch {
      // silently fail — toasts are non-critical
    }
  }

  // Inject styles once
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      #toast-container {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 320px;
        width: calc(100% - 32px);
      }
      @media (max-width: 480px) {
        #toast-container {
          right: 0;
          left: 0;
          top: 0;
          max-width: 100%;
          width: 100%;
          gap: 0;
          padding: 0;
        }
        #toast-container > div {
          border-radius: 0 0 14px 14px !important;
          border-left: none !important;
          border-top: 3px solid var(--toast-color, #F7B32B);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15) !important;
        }
      }
      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes toastOut {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(-12px); }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForNewNotifications);
  } else {
    checkForNewNotifications();
  }
})();
