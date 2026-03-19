// === LANGSKOMEN BIJ BART - SERVICE WORKER ===
const CACHE_NAME = 'bart-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install: cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
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
