// === LANGSKOMEN BIJ BART - SERVICE WORKER ===
// v4

// Install: skip waiting immediately, no caching
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activate: delete all existing caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Fetch: bypass HTTP cache for navigation requests so HTML is always fresh
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, { cache: 'no-store' }));
  }
});

// === PUSH NOTIFICATIONS ===
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data.json(); } catch { data = { title: '🚪 Iemand wil langskomen!', body: e.data?.text() || '' }; }

  const options = {
    body: data.body || 'Iemand wil bij je langskomen!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'bart-visit-' + (data.visitId || Date.now()),
    renotify: true,
    requireInteraction: true,
    data: { visitId: data.visitId, url: '/#bart' },
    actions: [
      { action: 'yes', title: '✅ Ja, kom maar!' },
      { action: 'no',  title: '❌ Geen zin' }
    ]
  };

  e.waitUntil(self.registration.showNotification(data.title || '🚪 Langskomen bij Bart', options));
});

// Handle notification click
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const visitId = e.notification.data?.visitId;
  const action = e.action;

  if (action === 'yes' || action === 'no') {
    // Direct respond from notification — update localStorage via client
    e.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        // Try to post message to existing open window
        for (const client of clients) {
          client.postMessage({ type: 'RESPOND_VISIT', visitId, response: action });
          client.focus();
          return;
        }
        // No open window — open app and pass action in URL
        return self.clients.openWindow(`/#bart?respond=${action}&visit=${visitId}`);
      })
    );
  } else {
    // Just open the app
    e.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        for (const c of clients) { c.focus(); return; }
        return self.clients.openWindow('/#bart');
      })
    );
  }
});

// Handle background sync (fallback for offline responses)
self.addEventListener('sync', e => {
  if (e.tag === 'sync-visits') {
    e.waitUntil(syncPendingResponses());
  }
});

async function syncPendingResponses() {
  // Placeholder for future backend sync
  console.log('[SW] Syncing pending responses...');
}
