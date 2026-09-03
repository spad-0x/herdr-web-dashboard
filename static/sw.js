// Herdr Web Dashboard Service Worker (Push & Notifications)
const CACHE_NAME = 'herdr-dashboard-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Gestione click notifica: porta l'utente alla chat/pane dell'agente o al focus dell'app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    if (event.notification.data && event.notification.data.paneId) {
                        client.postMessage({
                            type: 'NAVIGATE_TO_PANE',
                            paneId: event.notification.data.paneId,
                            workspaceId: event.notification.data.workspaceId
                        });
                    }
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// Gestione push notification da server (quando inviate via Web Push protocol)
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (e) {
        payload = {
            title: 'Herdr',
            body: event.data ? event.data.text() : 'Nuovo evento agente'
        };
    }

    const title = payload.title || 'Herdr Agent';
    const options = {
        body: payload.body || 'Attività agente completata o richiede conferma',
        icon: payload.icon || '/icon-192.png',
        badge: '/icon-180.png',
        vibrate: [100, 50, 100],
        data: payload.data || {},
        tag: payload.tag || 'herdr-agent-notification',
        renotify: true
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
