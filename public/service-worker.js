self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PhysioApp';
  const options = {
    body: data.body || '',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    data: { url: '/notifications' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate('/notifications');
          return client.focus();
        }
      }
      return clients.openWindow('/notifications');
    })
  );
});
