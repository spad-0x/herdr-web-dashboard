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

// Notification Settings State
window.HerdrNotificationSettings = {
    enabled: true,
    events: { task_completed: true, waiting_confirm: true },
    disabled_workspaces: [],
    disabled_agents: [],
    disabled_panes: []
};

async function loadNotificationSettings() {
    try {
        const res = await fetch('/api/notifications/settings');
        if (res.ok) {
            const data = await res.json();
            window.HerdrNotificationSettings = data;
            if (typeof State !== 'undefined') {
                State.notificationSettings = data;
            }
            return data;
        }
    } catch (e) {
        console.warn('[Herdr Notif] Errore caricamento impostazioni:', e);
    }
    return window.HerdrNotificationSettings;
}

async function saveNotificationSettings(delta) {
    try {
        const res = await fetch('/api/notifications/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(delta)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.settings) {
                window.HerdrNotificationSettings = data.settings;
                if (typeof State !== 'undefined') {
                    State.notificationSettings = data.settings;
                }
            }
            return data;
        }
    } catch (e) {
        console.error('[Herdr Notif] Errore salvataggio impostazioni:', e);
    }
    return null;
}

async function toggleNotificationTarget(type, id, enabled) {
    try {
        const res = await fetch('/api/notifications/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: type, id: id, enabled: enabled })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.settings) {
                window.HerdrNotificationSettings = data.settings;
                if (typeof State !== 'undefined') {
                    State.notificationSettings = data.settings;
                }
            }
            return data;
        }
    } catch (e) {
        console.error('[Herdr Notif] Errore toggle target:', e);
    }
    return null;
}

function isTargetMuted(type, id) {
    const cfg = (typeof State !== 'undefined' && State.notificationSettings) ? State.notificationSettings : window.HerdrNotificationSettings;
    if (!cfg) return false;
    if (cfg.enabled === false) return true; // everything is muted if global push is off

    const idStr = String(id).trim().toLowerCase();
    if (type === 'workspace') {
        const disabled = (cfg.disabled_workspaces || []).map(w => String(w).trim().toLowerCase());
        return disabled.includes(idStr);
    }
    if (type === 'agent') {
        const disabled = (cfg.disabled_agents || []).map(a => String(a).trim().toLowerCase());
        return disabled.includes(idStr);
    }
    if (type === 'pane') {
        const disabled = (cfg.disabled_panes || []).map(p => String(p).trim().toLowerCase());
        return disabled.includes(idStr);
    }
    return false;
}

// Initialize Service Worker
async function initServiceWorker() {
    // 1. Carica le impostazioni notifiche dal server
    await loadNotificationSettings();

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

            // Se l'utente ha disabilitato le notifiche, assicuriamoci che PushManager sia unsubscribed
            const pushPref = localStorage.getItem('herdr_push_enabled');
            const isGloballyEnabled = window.HerdrNotificationSettings.enabled !== false;

            if (pushPref === 'false' || !isGloballyEnabled) {
                // Ensure unsubscribed
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    await sub.unsubscribe();
                    console.log('[Herdr Push] Subscription PushManager rimossa (impostazione disattivata).');
                }
            } else if (pushPref === 'true' && Notification.permission === 'granted' && isGloballyEnabled) {
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

        // 6. Abilita globalmente nelle impostazioni server e local storage
        await saveNotificationSettings({ enabled: true });
        localStorage.setItem('herdr_push_enabled', 'true');

        console.log('[Herdr Push] Iscrizione Push completata e inviata al server!');
        return true;
    } catch (e) {
        console.error('[Herdr Push] Errore durante la registrazione Push:', e);
        return false;
    }
}

// Completely unsubscribe from push notifications (browser + server)
async function unsubscribeUserFromPush() {
    try {
        let endpoint = null;
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) {
                endpoint = sub.endpoint;
                await sub.unsubscribe();
                console.log('[Herdr Push] Subscription rimossa da browser PushManager');
            }
        }

        // Notify server to remove this subscription
        await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpoint })
        });

        // Mark global notifications as disabled on the server
        await saveNotificationSettings({ enabled: false });
        localStorage.setItem('herdr_push_enabled', 'false');

        console.log('[Herdr Push] Notifiche push disattivate e subscription rimossa ovunque.');
        return true;
    } catch (e) {
        console.error('[Herdr Push] Errore disattivazione push:', e);
        localStorage.setItem('herdr_push_enabled', 'false');
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
window.unsubscribeUserFromPush = unsubscribeUserFromPush;
window.triggerServerPushTest = triggerServerPushTest;
window.loadNotificationSettings = loadNotificationSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.toggleNotificationTarget = toggleNotificationTarget;
window.isTargetMuted = isTargetMuted;
