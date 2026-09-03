// Herdr Web Push & Notification Helper (VAPID + Service Worker)
let swRegistration = null;

// Convert base64 VAPID string to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Initialize Service Worker
async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            swRegistration = reg;
            console.log('[Herdr SW] Service worker registrato con successo:', reg.scope);

            // Listen for messages from SW (e.g. click on notification)
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NAVIGATE_TO_PANE') {
                    if (window.switchWorkspaceAndPane) {
                        window.switchWorkspaceAndPane(event.data.workspaceId, event.data.paneId);
                    }
                }
            });

            // If push was previously enabled, ensure subscription is registered on server
            if (localStorage.getItem('herdr_push_enabled') === 'true' && Notification.permission === 'granted') {
                subscribeUserToPush();
            }
        } catch (err) {
            console.warn('[Herdr SW] Registrazione fallita:', err);
        }
    }
}

// Request permission and subscribe to VAPID Web Push
async function subscribeUserToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[Herdr Push] PushManager non supportato da questo browser.');
        return false;
    }

    try {
        // 1. Chiedi il permesso esplicito
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[Herdr Push] Permesso notifiche non concesso:', permission);
            return false;
        }

        // 2. Assicurati che il SW sia pronto
        const reg = await navigator.serviceWorker.ready;

        // 3. Prendi la chiave pubblica VAPID dal server
        const keyResp = await fetch('/api/push/public-key');
        if (!keyResp.ok) throw new Error('Impossibile recuperare la chiave VAPID dal server');
        const keyData = await keyResp.json();
        const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);

        // 4. Iscrivi il browser
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });
        }

        // 5. Invia la subscription al server Python
        await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub })
        });

        console.log('[Herdr Push] Iscrizione Push completata e inviata al server!');
        return true;
    } catch (e) {
        console.error('[Herdr Push] Errore durante la registrazione Push:', e);
        return false;
    }
}

// Test Push dal server
async function triggerServerPushTest() {
    try {
        const res = await fetch('/api/push/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: '⚡ Herdr Push Standby Test',
                body: 'Funziona! Ricevuto direttamente dai server Apple Push a schermo spento.'
            })
        });
        const data = await res.json();
        return data;
    } catch (e) {
        console.error('[Herdr Push] Errore nel test push:', e);
    }
}

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    initServiceWorker();
});

// Export globals
window.initServiceWorker = initServiceWorker;
window.subscribeUserToPush = subscribeUserToPush;
window.triggerServerPushTest = triggerServerPushTest;
