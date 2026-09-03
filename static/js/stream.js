// =============================================================================
// REAL-TIME STATE STREAMING & EVENT HANDLING
// =============================================================================
function connectStateStream() {
    if (State.sseSource) {
        State.sseSource.close();
    }

    State.sseSource = new EventSource('/api/stream');

    State.sseSource.addEventListener('state', e => {
        try {
            const data = JSON.parse(e.data);
            handleStateUpdate(data);
        } catch (err) {
            console.error('Failed to parse SSE state event', err);
        }
    });

    State.sseSource.onopen = () => {
        State.connected = true;
        DOM.socketDot.className = 'socket-dot connected';
    };

    State.sseSource.onerror = () => {
        State.connected = false;
        DOM.socketDot.className = 'socket-dot';
    };
}

function handleStateUpdate(data) {
    State.connected = !!data.connected;
    DOM.socketDot.className = State.connected ? 'socket-dot connected' : 'socket-dot';

    if (data.version) {
        State.version = data.version;
        if (DOM.sheetDaemonVersion) DOM.sheetDaemonVersion.textContent = `v${data.version}`;
    }
    if (data.socket_path) {
        State.socketPath = data.socket_path;
        if (DOM.sheetSocketPath) DOM.sheetSocketPath.textContent = data.socket_path;
    }

    State.workspaces = data.workspaces || [];
    if (State.workspaces.length === 0) return;

    // Active workspace
    let activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId) ||
                    State.workspaces.find(w => w.focused) ||
                    State.workspaces[0];

    State.activeWorkspaceId = activeWs.id;
    if (DOM.currentWsName) DOM.currentWsName.textContent = activeWs.name || `Workspace ${activeWs.id}`;

    // Tabs for active workspace
    State.tabs = activeWs.tabs || [];
    renderTabs(State.tabs);

    // Active tab
    let activeTab = State.tabs.find(t => t.tab_id === State.activeTabId) ||
                    State.tabs.find(t => t.focused) ||
                    State.tabs[0];

    if (activeTab) {
        State.activeTabId = activeTab.tab_id;
        State.panes = activeTab.panes || [];
    } else {
        State.panes = [];
    }

    // Active pane
    let activePane = State.panes.find(p => p.pane_id === State.activePaneId) ||
                     State.panes.find(p => p.focused) ||
                     State.panes[0];

    if (activePane) {
        const paneChanged = (State.activePaneId !== activePane.pane_id);
        State.activePaneId = activePane.pane_id;

        updateHeaderInfo(activePane);
        updateTerminalContent(activePane, paneChanged);
        updateChatContent(activePane, paneChanged);
        updateConfirmationBanner(activePane);
    }

    if (DOM.bottomSheet.classList.contains('active')) {
        renderSheetWorkspaces();
        renderSheetPanes();
    }

    // Real-time update for home chats list and active agents counter
    if (State.currentScreen === 'chats-list' && State.chatsFilter !== 'settings') {
        renderChatsList();
    } else {
        updateActiveAgentsBadge();
    }

    // Monitor for automated Web Push notifications (agent completed / needs confirmation)
    if (window.monitorAgentStateForNotifications) {
        window.monitorAgentStateForNotifications(State.workspaces);
    }
}

function updateActiveAgentsBadge() {
    if (!DOM.badgeAgentCount || !State.workspaces) return;
    let runningAgentsCount = 0;
    const seenPaneIds = new Set();
    State.workspaces.forEach(ws => {
        const checkPane = p => {
            if (!p || seenPaneIds.has(p.pane_id)) return;
            seenPaneIds.add(p.pane_id);
            const isAgent = (p.is_agent === true) || (p.is_agent !== false && (p.agent || p.status === 'working' || p.status === 'blocked' || p.waiting_confirm || ['agy', 'claude', 'codex', 'gemini', 'cursor', 'aider', 'openhands'].some(kw => (p.command || p.title || '').toLowerCase().includes(kw))));
            if (isAgent && (p.is_running || p.status === 'working')) {
                runningAgentsCount++;
            }
        };
        if (ws.panes) ws.panes.forEach(checkPane);
        if (ws.tabs) ws.tabs.forEach(t => { if (t.panes) t.panes.forEach(checkPane); });
    });

    if (runningAgentsCount > 0) {
        DOM.badgeAgentCount.textContent = runningAgentsCount;
        DOM.badgeAgentCount.style.display = 'flex';
    } else {
        DOM.badgeAgentCount.style.display = 'none';
    }
}

function updateHeaderInfo(pane) {
    const title = pane.agent || pane.title || 'Herdr Agent';
    DOM.chatHeaderTitle.textContent = title;

    const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId);
    const wsName = (activeWs && (activeWs.name || activeWs.label)) || `Workspace ${State.activeWorkspaceId || ''}`;

    const status = (pane.status || 'idle').toLowerCase();
    if (status === 'working') {
        DOM.agentStatusText.textContent = `${wsName} • ⚡ lavora...`;
        DOM.agentStatusText.style.color = 'var(--cyan)';
    } else if (status === 'blocked' || pane.waiting_confirm) {
        DOM.agentStatusText.textContent = `${wsName} • ⚠️ conferma`;
        DOM.agentStatusText.style.color = 'var(--warning)';
    } else {
        DOM.agentStatusText.textContent = wsName;
        DOM.agentStatusText.style.color = 'var(--text-secondary)';
    }
}

function updateConfirmationBanner(pane) {
    const isWaiting = !!pane.waiting_confirm || (pane.status === 'blocked');
    if (isWaiting) {
        DOM.agentConfirmBanner.style.display = 'flex';
    } else {
        DOM.agentConfirmBanner.style.display = 'none';
    }
}

function updateTerminalContent(pane, paneChanged) {
    if (!State.term) return;
    const rawText = pane.raw_text || '';
    const revision = pane.revision || 0;

    if (paneChanged) {
        State.term.reset();
        State.term.write(rawText);
        State.lastText = rawText;
        State.lastRevision = revision;
        return;
    }

    if (rawText !== State.lastText || revision !== State.lastRevision) {
        if (rawText.startsWith(State.lastText)) {
            const delta = rawText.slice(State.lastText.length);
            State.term.write(delta);
        } else {
            State.term.reset();
            State.term.write(rawText);
        }
        State.lastText = rawText;
        State.lastRevision = revision;
    }
}

// =============================================================================
// CHAT RENDERING ENGINE (WHATSAPP BUBBLES)
// =============================================================================
