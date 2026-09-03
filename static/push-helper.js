// Herdr Web Push & Notification Helper
let swRegistration = null;

// Initialize Service Worker
async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            swRegistration = reg;
            console.log('[Herdr SW] Service worker registered successfully:', reg.scope);

            // Listen for messages from SW (e.g. click on notification to open pane)
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'NAVIGATE_TO_PANE') {
                    if (window.switchWorkspaceAndPane) {
                        window.switchWorkspaceAndPane(event.data.workspaceId, event.data.paneId);
                    }
                }
            });
        } catch (err) {
            console.warn('[Herdr SW] Registration failed:', err);
        }
    }
}

// Request permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// Show notification via SW or fallback
async function showPushNotification(title, options = {}) {
    const isPushEnabled = localStorage.getItem('herdr_push_enabled') === 'true';
    if (!isPushEnabled && !options.force) return;

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const defaultOptions = {
        icon: '/icon-192.png',
        badge: '/icon-180.png',
        vibrate: [150, 50, 150],
        ...options
    };

    if (swRegistration && 'showNotification' in swRegistration) {
        try {
            await swRegistration.showNotification(title, defaultOptions);
            return;
        } catch (e) {
            console.warn('[Herdr Push] SW notification failed, falling back to Notification constructor', e);
        }
    }

    try {
        new Notification(title, defaultOptions);
    } catch (e) {
        console.warn('[Herdr Push] Notification display failed:', e);
    }
}

// Track agent state changes for automated notifications
const PreviousPaneStates = new Map(); // pane_id -> { status, is_running, waiting_confirm }

function monitorAgentStateForNotifications(workspaces) {
    const isPushEnabled = localStorage.getItem('herdr_push_enabled') === 'true';
    if (!isPushEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    if (!workspaces || !Array.isArray(workspaces)) return;

    const currentPanes = [];
    workspaces.forEach(ws => {
        const addPane = (p, tab) => {
            if (!p || !p.pane_id) return;
            currentPanes.push({
                pane_id: p.pane_id,
                workspace_id: ws.id,
                workspace_name: ws.name || `Workspace ${ws.id}`,
                tab_id: tab ? tab.tab_id : null,
                title: p.agent || p.title || p.command || `Agente ${p.pane_id}`,
                status: (p.status || 'idle').toLowerCase(),
                is_running: !!(p.is_running || p.status === 'working'),
                waiting_confirm: !!(p.waiting_confirm || p.status === 'waiting_confirm' || p.status === 'confirm' || p.status === 'blocked')
            });
        };
        if (ws.panes) ws.panes.forEach(p => addPane(p, null));
        if (ws.tabs) ws.tabs.forEach(t => { if (t.panes) t.panes.forEach(p => addPane(p, t)); });
    });

    currentPanes.forEach(current => {
        const prev = PreviousPaneStates.get(current.pane_id);
        if (prev) {
            // Case 1: Agent requires confirmation
            if (!prev.waiting_confirm && current.waiting_confirm) {
                showPushNotification(`⚠️ Richiesta Conferma: ${current.title}`, {
                    body: `L'agente in "${current.workspace_name}" richiede la tua autorizzazione per procedere.`,
                    icon: '/icon-192.png',
                    tag: `confirm-${current.pane_id}`,
                    data: {
                        paneId: current.pane_id,
                        workspaceId: current.workspace_id,
                        url: '/'
                    }
                });
            }
            // Case 2: Agent finished task (was running/working, now idle/finished)
            else if (prev.is_running && !current.is_running && !current.waiting_confirm) {
                showPushNotification(`✅ Task Completato: ${current.title}`, {
                    body: `L'agente in "${current.workspace_name}" ha terminato l'esecuzione con successo!`,
                    icon: '/icon-192.png',
                    tag: `completed-${current.pane_id}`,
                    data: {
                        paneId: current.pane_id,
                        workspaceId: current.workspace_id,
                        url: '/'
                    }
                });
            }
        }

        PreviousPaneStates.set(current.pane_id, {
            status: current.status,
            is_running: current.is_running,
            waiting_confirm: current.waiting_confirm
        });
    });
}

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    initServiceWorker();
});

// Export globals
window.initServiceWorker = initServiceWorker;
window.requestNotificationPermission = requestNotificationPermission;
window.showPushNotification = showPushNotification;
window.monitorAgentStateForNotifications = monitorAgentStateForNotifications;
