/**
 * Herdr Mobile WebGUI — Client Controller & Semantic Engine
 * High-performance Fullscreen PWA for mobile AI agent & terminal orchestration.
 */

// =============================================================================
// STATE & CONFIGURATION
// =============================================================================
const State = {
    connected: false,
    version: '0.8.2',
    socketPath: '~/.config/herdr/herdr.sock',
    activeWorkspaceId: null,
    activeTabId: null,
    activePaneId: null,
    workspaces: [],
    agents: [],
    lastRawText: '',
    parsedMessages: [],
    currentView: 'view-chat',
    autoScroll: true,
    hapticEnabled: true,
    voiceLanguage: 'it-IT',
    isRecordingVoice: false,
    speechRecognition: null,
    currentAttachment: null,
    lastUpdateHash: null,
    sseSource: null,
    pollTimer: null
};

// =============================================================================
// DOM ELEMENTS
// =============================================================================
const DOM = {
    appLayout: document.getElementById('app-layout'),
    // Header
    btnOpenDrawer: document.getElementById('btn-open-drawer'),
    drawerTriggerBadge: document.getElementById('drawer-trigger-badge'),
    headerWsName: document.getElementById('header-ws-name'),
    headerTabName: document.getElementById('header-tab-name'),
    headerStatusDot: document.getElementById('header-status-dot'),
    headerStatusText: document.getElementById('header-status-text'),
    btnToggleRaw: document.getElementById('btn-toggle-raw'),
    labelModeIcon: document.getElementById('label-mode-icon'),
    btnContextPicker: document.getElementById('btn-context-picker'),
    btnRefresh: document.getElementById('btn-refresh'),
    // Drawer
    appDrawer: document.getElementById('app-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    btnCloseDrawer: document.getElementById('btn-close-drawer'),
    drawerVersion: document.getElementById('drawer-version'),
    drawerNavItems: document.querySelectorAll('.drawer-nav-item'),
    drawerWsBadge: document.getElementById('drawer-ws-badge'),
    drawerAgentsBadge: document.getElementById('drawer-agents-badge'),
    drawerWsQuickList: document.getElementById('drawer-ws-quick-list'),
    btnDrawerAddWs: document.getElementById('btn-drawer-add-ws'),
    btnDrawerLogout: document.getElementById('btn-drawer-logout'),
    // Views
    mainViewport: document.getElementById('main-viewport'),
    viewPanels: document.querySelectorAll('.view-panel'),
    viewChat: document.getElementById('view-chat'),
    viewWorkspaces: document.getElementById('view-workspaces'),
    viewAgents: document.getElementById('view-agents'),
    viewTerminal: document.getElementById('view-terminal'),
    viewSettings: document.getElementById('view-settings'),
    alertOffline: document.getElementById('alert-offline'),
    // Chat View
    chatMessages: document.getElementById('chat-messages'),
    chatWelcomeCard: document.getElementById('chat-welcome-card'),
    btnScrollBottom: document.getElementById('btn-scroll-bottom'),
    actionChipsList: document.getElementById('action-chips-list'),
    btnClearChat: document.getElementById('btn-clear-chat'),
    attachmentPreviewBar: document.getElementById('attachment-preview-bar'),
    attachmentThumb: document.getElementById('attachment-thumb'),
    attachmentName: document.getElementById('attachment-name'),
    btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
    fileInput: document.getElementById('file-input'),
    btnVoiceMic: document.getElementById('btn-voice-mic'),
    promptInput: document.getElementById('prompt-input'),
    btnSendPrompt: document.getElementById('btn-send-prompt'),
    // Workspaces View
    wsTotalCount: document.getElementById('ws-total-count'),
    workspacesGrid: document.getElementById('workspaces-grid'),
    btnOpenNewWsModal: document.getElementById('btn-open-new-ws-modal'),
    // Agents View
    agentsTotalCount: document.getElementById('agents-total-count'),
    agentsGrid: document.getElementById('agents-grid'),
    // Terminal View
    terminalPaneLabel: document.getElementById('terminal-pane-label'),
    terminalRawText: document.getElementById('terminal-raw-text'),
    btnCopyTerminal: document.getElementById('btn-copy-terminal'),
    btnToggleAutoscroll: document.getElementById('btn-toggle-autoscroll'),
    termKeyBtns: document.querySelectorAll('.term-key-btn'),
    // Settings View
    themeSelectorGroup: document.getElementById('theme-selector-group'),
    voiceLangSelect: document.getElementById('voice-lang-select'),
    settingHaptic: document.getElementById('setting-haptic'),
    settingAutoscroll: document.getElementById('setting-autoscroll'),
    infoSocketPath: document.getElementById('info-socket-path'),
    infoDaemonVersion: document.getElementById('info-daemon-version'),
    infoConnStatus: document.getElementById('info-conn-status'),
    btnLogoutAction: document.getElementById('btn-logout-action'),
    // Modals
    modalContextPicker: document.getElementById('modal-context-picker'),
    contextPickerList: document.getElementById('context-picker-list'),
    btnCloseContextModal: document.getElementById('btn-close-context-modal'),
    modalNewWs: document.getElementById('modal-new-ws'),
    newWsPath: document.getElementById('new-ws-path'),
    newWsLabel: document.getElementById('new-ws-label'),
    btnCloseNewWsModal: document.getElementById('btn-close-new-ws-modal'),
    btnCancelNewWs: document.getElementById('btn-cancel-new-ws'),
    btnConfirmNewWs: document.getElementById('btn-confirm-new-ws'),
    // Lightbox & Toast
    lightboxOverlay: document.getElementById('lightbox-overlay'),
    lightboxImg: document.getElementById('lightbox-img'),
    btnCloseLightbox: document.getElementById('btn-close-lightbox'),
    toastContainer: document.getElementById('toast-container')
};

// =============================================================================
// UTILITIES: HAPTIC, TOASTS, ESCAPE
// =============================================================================
function triggerHaptic(type = 'light') {
    if (!State.hapticEnabled || !navigator.vibrate) return;
    try {
        if (type === 'light') navigator.vibrate(12);
        else if (type === 'medium') navigator.vibrate(25);
        else if (type === 'success') navigator.vibrate([15, 30, 15]);
        else if (type === 'alert') navigator.vibrate([40, 40, 80]);
    } catch (e) {}
}

function showToast(msg, duration = 2200) {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>💬</span> <span>${escapeHtml(msg)}</span>`;
    DOM.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    
    // Code blocks ```code```
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold **bold**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *italic*
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Lists - item
    html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.+<\/li>)/s, '<ul>$1</ul>');

    // Paragraph breaks
    html = html.replace(/\n\n+/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    return html;
}

// =============================================================================
// ADVANCED SEMANTIC PARSER FOR ANTIGRAVITY, CLAUDE & SHELL OUTPUTS
// =============================================================================
class SemanticParser {
    static parseScrollback(rawText) {
        if (!rawText || !rawText.trim()) return [];

        const lines = rawText.split('\n');
        const items = [];
        let current = null;

        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();

            if (!line && !current) continue;

            // 1. Skip terminal decorative lines, shortcut hints and ASCII banners
            if (/^[─━═\-_]{5,}$/.test(line)) continue;
            if (/^\?[ ]+for shortcuts/i.test(line)) continue;
            if (/[▄▀]{3,}/.test(line)) continue;
            if (/Antigravity CLI|Gemini 3\.|Google AI Pro/i.test(line)) continue;

            // 2. User Prompt (e.g. "> prompt" or "❯ prompt" or "$ cmd")
            if (/^(>|❯|\$)\s*(.+)/.test(line)) {
                const userContent = line.replace(/^(>|❯|\$)\s*/, '').trim();
                if (userContent) {
                    if (current) items.push(current);
                    current = { type: 'user', content: userContent, timestamp: new Date() };
                    items.push(current);
                    current = null;
                }
                continue;
            }

            // 3. Thinking / Reasoning Block (e.g., "▸ Thought for 4s...", "Thinking...", "*Thinking*")
            if (/^[▸▶]\s*Thought\b/i.test(line) || /^\*Thinking\*/i.test(line) || /^Thinking\.\.\./i.test(line)) {
                if (current) items.push(current);
                current = {
                    type: 'thought',
                    header: line,
                    lines: [],
                    timestamp: new Date()
                };
                continue;
            }

            // 4. Tool Call (e.g., "● Read(...)", "● Run(...)", "● Edit(...)", "🛠️ View file")
            if (/^[●•]\s*([A-Za-z0-9_]+)\((.*)\)/i.test(line) || /^[●•🛠️⚙️]\s*(Tool|Calling|Running|Read|Write|Edit|Run|Grep|View)/i.test(line)) {
                if (current) items.push(current);
                current = {
                    type: 'tool',
                    header: line,
                    lines: [],
                    timestamp: new Date()
                };
                continue;
            }

            // 5. Diff Block
            if (line.startsWith('diff --git') || line.startsWith('--- a/') || line.startsWith('+++ b/')) {
                if (!current || current.type !== 'diff') {
                    if (current) items.push(current);
                    current = { type: 'diff', lines: [rawLine], timestamp: new Date() };
                } else {
                    current.lines.push(rawLine);
                }
                continue;
            }

            // 6. Interactive Confirmation Prompt
            if (/(\[y\/n\]|\(y\/n\)|\(Y\/n\)|\(yes\/no\)|Proceed\?|Approve\?|Continue\?)/i.test(line)) {
                if (current) items.push(current);
                current = {
                    type: 'prompt_interactive',
                    text: line,
                    timestamp: new Date()
                };
                items.push(current);
                current = null;
                continue;
            }

            // Append lines to current item
            if (current) {
                if (current.type === 'thought') {
                    // Indented lines belong to thought reasoning
                    if (rawLine.startsWith('  ') && !line.startsWith('>')) {
                        current.lines.push(line);
                    } else {
                        items.push(current);
                        current = { type: 'agent', content: line, timestamp: new Date() };
                    }
                } else if (current.type === 'tool') {
                    if (rawLine.startsWith('  ') || line.startsWith('(') || line.startsWith('{')) {
                        current.lines.push(line);
                    } else {
                        items.push(current);
                        current = { type: 'agent', content: line, timestamp: new Date() };
                    }
                } else if (current.type === 'diff') {
                    if (/^[+\-@\s]/.test(rawLine)) {
                        current.lines.push(rawLine);
                    } else {
                        items.push(current);
                        current = { type: 'agent', content: line, timestamp: new Date() };
                    }
                } else if (current.type === 'agent') {
                    current.content += '\n' + line;
                }
            } else {
                if (line) {
                    current = { type: 'agent', content: line, timestamp: new Date() };
                }
            }
        }

        if (current) items.push(current);
        return items;
    }
}

// =============================================================================
// UI RENDERING: CHAT, WORKSPACES, AGENTS, TERMINAL
// =============================================================================
function renderChatStream(blocks) {
    if (!blocks || blocks.length === 0) {
        DOM.chatWelcomeCard.style.display = 'flex';
        return;
    }
    DOM.chatWelcomeCard.style.display = 'none';

    // Clear and re-render
    DOM.chatMessages.innerHTML = '';

    blocks.forEach((b) => {
        const row = document.createElement('div');
        row.className = 'msg-row';

        if (b.type === 'user') {
            row.classList.add('msg-user');
            row.innerHTML = `<div class="msg-bubble">${formatMarkdown(b.content)}</div>`;
        } else if (b.type === 'thought') {
            row.classList.add('msg-agent');
            const thoughtText = (b.lines.join('\n') || 'Ragionamento in corso...').trim();
            row.innerHTML = `
                <div class="msg-bubble">
                    <details class="thinking-accordion" open>
                        <summary class="accordion-summary">
                            <div class="accordion-title-group">
                                <span>🧠</span>
                                <span>${escapeHtml(b.header || 'Ragionamento Agente')}</span>
                            </div>
                            <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </summary>
                        <div class="accordion-body">${escapeHtml(thoughtText)}</div>
                    </details>
                </div>
            `;
        } else if (b.type === 'tool') {
            row.classList.add('msg-agent');
            const outText = (b.lines.join('\n') || 'Esecuzione completata').trim();
            row.innerHTML = `
                <div class="msg-bubble">
                    <details class="tool-call-accordion">
                        <summary class="accordion-summary tool-summary">
                            <div class="accordion-title-group">
                                <span>⚙️</span>
                                <span><strong>${escapeHtml(b.header || 'Tool Call')}</strong></span>
                            </div>
                            <svg class="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </summary>
                        <div class="tool-body">${escapeHtml(outText)}</div>
                    </details>
                </div>
            `;
        } else if (b.type === 'diff') {
            row.classList.add('msg-agent');
            let diffHtml = '<div class="diff-box"><div class="diff-header">Modifiche Codice</div>';
            b.lines.forEach((dl) => {
                let cls = '';
                if (dl.startsWith('+')) cls = 'diff-add';
                else if (dl.startsWith('-')) cls = 'diff-del';
                diffHtml += `<div class="diff-line ${cls}">${escapeHtml(dl)}</div>`;
            });
            diffHtml += '</div>';
            row.innerHTML = `<div class="msg-bubble">${diffHtml}</div>`;
        } else if (b.type === 'prompt_interactive') {
            row.classList.add('msg-agent');
            row.innerHTML = `
                <div class="msg-bubble">
                    <div class="interactive-prompt-card">
                        <div class="prompt-card-header">
                            <span>⚡ Richiesta Conferma</span>
                        </div>
                        <div class="prompt-card-text">${escapeHtml(b.text)}</div>
                        <div class="prompt-actions-row">
                            <button class="btn-prompt-action btn-approve" onclick="sendQuickKey('y')">✓ Approva (Y)</button>
                            <button class="btn-prompt-action btn-reject" onclick="sendQuickKey('n')">✗ Rifiuta (N)</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Standard Agent message
            row.classList.add('msg-agent');
            row.innerHTML = `
                <div class="msg-bubble">
                    <div class="msg-header">
                        <div class="msg-agent-avatar">🤖</div>
                        <span class="msg-agent-name">Agente</span>
                    </div>
                    <div class="msg-content">${formatMarkdown(b.content)}</div>
                </div>
            `;
        }

        DOM.chatMessages.appendChild(row);
    });

    if (State.autoScroll) {
        scrollToBottom();
    }
}

function scrollToBottom() {
    setTimeout(() => {
        DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
    }, 40);
}

function renderWorkspaces() {
    DOM.wsTotalCount.textContent = State.workspaces.length;
    DOM.drawerWsBadge.textContent = State.workspaces.length;
    DOM.workspacesGrid.innerHTML = '';
    DOM.drawerWsQuickList.innerHTML = '';

    if (State.workspaces.length === 0) {
        DOM.workspacesGrid.innerHTML = `<div class="chat-welcome-card"><p>Nessun workspace attivo. Crea uno nuovo spazio!</p></div>`;
        return;
    }

    State.workspaces.forEach((ws) => {
        const isFocused = ws.id === State.activeWorkspaceId;
        
        // Drawer quick list item
        const drawerItem = document.createElement('div');
        drawerItem.className = `drawer-ws-item ${isFocused ? 'active' : ''}`;
        drawerItem.innerHTML = `<span>${escapeHtml(ws.name)}</span> ${isFocused ? '✓' : ''}`;
        drawerItem.onclick = () => {
            focusWorkspace(ws.id);
            closeDrawer();
            switchView('view-chat');
        };
        DOM.drawerWsQuickList.appendChild(drawerItem);

        // Full grid card
        const card = document.createElement('div');
        card.className = `ws-card ${isFocused ? 'focused' : ''}`;

        let tabsHtml = '';
        if (ws.tabs && ws.tabs.length > 0) {
            tabsHtml = '<div class="card-tabs-row">';
            ws.tabs.forEach((t) => {
                const isTabActive = t.tab_id === State.activeTabId;
                tabsHtml += `<button class="tab-pill ${isTabActive ? 'active' : ''}" onclick="focusTab('${t.tab_id}', '${ws.id}'); switchView('view-chat');">${escapeHtml(t.label || 'Tab')}</button>`;
            });
            tabsHtml += `<button class="tab-pill" onclick="createNewTab('${ws.id}')">+ tab</button>`;
            tabsHtml += '</div>';
        }

        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-title-group">
                    <span>🗂️</span>
                    <h3 class="card-title">${escapeHtml(ws.name || 'Workspace')}</h3>
                </div>
                <div>
                    <button class="btn-primary-action" onclick="focusWorkspace('${ws.id}'); switchView('view-chat');">${isFocused ? 'Attivo' : 'Seleziona'}</button>
                </div>
            </div>
            <div class="card-cwd">${escapeHtml(ws.cwd || '~')}</div>
            ${tabsHtml}
        `;
        DOM.workspacesGrid.appendChild(card);
    });
}

function renderAgents() {
    DOM.agentsTotalCount.textContent = State.agents.length;
    DOM.agentsGrid.innerHTML = '';

    let waitingCount = 0;

    if (State.agents.length === 0) {
        DOM.agentsGrid.innerHTML = `<div class="chat-welcome-card"><p>Nessun agente autonomo attivo rilevato nei terminali.</p></div>`;
        DOM.drawerAgentsBadge.style.display = 'none';
        DOM.drawerTriggerBadge.style.display = 'none';
        return;
    }

    State.agents.forEach((ag) => {
        const isWaiting = ag.status === 'blocked' || ag.status === 'waiting';
        if (isWaiting) waitingCount++;

        const card = document.createElement('div');
        card.className = `agent-card ${isWaiting ? 'focused' : ''}`;

        let statusBadgeClass = 'idle';
        let statusLabel = 'Pronto';
        if (ag.status === 'working') {
            statusBadgeClass = 'working';
            statusLabel = 'In Esecuzione';
        } else if (isWaiting) {
            statusBadgeClass = 'blocked';
            statusLabel = 'In Attesa di Input';
        }

        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-title-group">
                    <span>🤖</span>
                    <h3 class="card-title">${escapeHtml(ag.name || ag.title || 'Agente')}</h3>
                </div>
                <div class="agent-status-pill">
                    <span class="status-pulse-dot ${statusBadgeClass}"></span>
                    <span>${statusLabel}</span>
                </div>
            </div>
            <div class="card-cwd">Spazio: <strong>${escapeHtml(ag.ws_name || 'Generale')}</strong> • Pane #${ag.pane_id}</div>
            <div>
                <button class="btn-primary-action" style="width: 100%;" onclick="focusTab('${ag.tab_id}', '${ag.workspace_id}'); switchView('view-chat');">
                    💬 Apri Conversazione
                </button>
            </div>
        `;
        DOM.agentsGrid.appendChild(card);
    });

    if (waitingCount > 0) {
        DOM.drawerAgentsBadge.textContent = waitingCount;
        DOM.drawerAgentsBadge.style.display = 'inline-block';
        DOM.drawerTriggerBadge.style.display = 'block';
        triggerHaptic('alert');
    } else {
        DOM.drawerAgentsBadge.style.display = 'none';
        DOM.drawerTriggerBadge.style.display = 'none';
    }
}

function renderTerminalRaw(rawText) {
    DOM.terminalPaneLabel.textContent = `Pane #${State.activePaneId || '1'}`;
    DOM.terminalRawText.textContent = rawText || 'Nessun output registrato nel buffer.';
    if (State.autoScroll && State.currentView === 'view-terminal') {
        const container = DOM.terminalRawText.parentElement;
        container.scrollTop = container.scrollHeight;
    }
}

function renderContextPicker() {
    DOM.contextPickerList.innerHTML = '';
    State.workspaces.forEach((ws) => {
        const isFocused = ws.id === State.activeWorkspaceId;
        const item = document.createElement('div');
        item.className = 'context-sheet-ws-item';

        let tabsBtns = '';
        (ws.tabs || []).forEach((t) => {
            const isTabActive = t.tab_id === State.activeTabId;
            tabsBtns += `
                <button class="tab-pill ${isTabActive ? 'active' : ''}" onclick="focusTab('${t.tab_id}', '${ws.id}'); closeModal('modal-context-picker'); switchView('view-chat');">
                    ${escapeHtml(t.label || 'Tab')}
                </button>
            `;
        });

        item.innerHTML = `
            <div class="context-sheet-ws-header">
                <strong>${escapeHtml(ws.name)}</strong>
                <button class="btn-secondary-action" onclick="focusWorkspace('${ws.id}'); closeModal('modal-context-picker'); switchView('view-chat');">${isFocused ? '✓ Selezionato' : 'Seleziona'}</button>
            </div>
            <div class="card-cwd">${escapeHtml(ws.cwd || '~')}</div>
            <div class="card-tabs-row" style="margin-top: 6px;">
                ${tabsBtns}
            </div>
        `;
        DOM.contextPickerList.appendChild(item);
    });
}

// =============================================================================
// REAL-TIME SYNC ENGINE (SSE + ADAPTIVE POLLING)
// =============================================================================
function handleStateUpdate(data) {
    if (!data) return;

    State.connected = data.connected || false;
    State.version = data.version || '0.8.2';
    State.socketPath = data.socket_path || '~/.config/herdr/herdr.sock';
    State.workspaces = data.workspaces || [];
    State.agents = data.agents || [];

    // Update Header
    if (!State.connected) {
        DOM.alertOffline.style.display = 'flex';
        DOM.headerStatusDot.className = 'status-pulse-dot offline';
        DOM.headerStatusText.textContent = 'offline';
        DOM.infoConnStatus.textContent = 'Disconnesso';
        DOM.infoConnStatus.className = 'info-value'
        DOM.infoConnStatus.style.color = 'var(--accent-red)';
    } else {
        DOM.alertOffline.style.display = 'none';
        DOM.infoConnStatus.textContent = 'Attiva';
        DOM.infoConnStatus.style.color = 'var(--accent-green)';
    }

    DOM.infoSocketPath.textContent = State.socketPath;
    DOM.infoDaemonVersion.textContent = `v${State.version}`;
    DOM.drawerVersion.textContent = `Daemon v${State.version}`;

    // Auto-select focused workspace
    let focusedWs = null;
    if (State.activeWorkspaceId) {
        focusedWs = State.workspaces.find((w) => w.id === State.activeWorkspaceId);
    }
    if (!focusedWs) {
        focusedWs = State.workspaces.find((w) => w.focused) || State.workspaces[0];
    }

    if (focusedWs) {
        State.activeWorkspaceId = focusedWs.id;
        DOM.headerWsName.textContent = focusedWs.name || 'workspace';

        // Auto-select focused tab (prefer active agent tab if available)
        let focusedTab = null;
        if (State.activeTabId) {
            focusedTab = (focusedWs.tabs || []).find((t) => t.tab_id === State.activeTabId);
        }
        if (!focusedTab) {
            // Find tab with agent first
            focusedTab = (focusedWs.tabs || []).find((t) => (t.panes || []).some((p) => p.agent || p.status === 'working' || p.status === 'blocked')) ||
                         (focusedWs.tabs || []).find((t) => t.focused) ||
                         (focusedWs.tabs && focusedWs.tabs[0]);
        }

        if (focusedTab) {
            State.activeTabId = focusedTab.tab_id;
            DOM.headerTabName.textContent = focusedTab.label || 'tab 1';

            // Find focused pane
            let focusedPane = null;
            if (State.activePaneId) {
                focusedPane = (focusedTab.panes || []).find((p) => p.pane_id === State.activePaneId);
            }
            if (!focusedPane) {
                focusedPane = (focusedTab.panes || []).find((p) => p.agent || p.status === 'working') ||
                              (focusedTab.panes || []).find((p) => p.focused) ||
                              (focusedTab.panes && focusedTab.panes[0]);
            }

            if (focusedPane) {
                State.activePaneId = focusedPane.pane_id;

                // Normalize Status dot in header
                let rawStatus = (focusedPane.status || 'idle').toLowerCase();
                let statusClass = 'idle';
                let statusLabel = 'Pronto';

                if (rawStatus === 'working') {
                    statusClass = 'working';
                    statusLabel = 'In Esecuzione';
                } else if (rawStatus === 'blocked' || rawStatus === 'waiting') {
                    statusClass = 'blocked';
                    statusLabel = 'In Attesa';
                }

                DOM.headerStatusDot.className = `status-pulse-dot ${statusClass}`;
                DOM.headerStatusText.textContent = statusLabel;

                // Parse and update chat if text changed
                const rawContent = focusedPane.raw_text || '';
                if (rawContent !== State.lastRawText) {
                    State.lastRawText = rawContent;
                    const blocks = SemanticParser.parseScrollback(rawContent);
                    renderChatStream(blocks);
                    renderTerminalRaw(rawContent);
                }
            }
        }
    }

    renderWorkspaces();
    renderAgents();
}

// Universal API Request Wrapper with Session Token Auth
function apiFetch(url, options = {}) {
    const token = localStorage.getItem('herdr_token') || '';
    const headers = Object.assign({}, options.headers || {});
    if (token) {
        headers['X-Session-Token'] = token;
        headers['Authorization'] = `Bearer ${token}`;
    }
    options.headers = headers;
    return fetch(url, options);
}

function startSync() {
    const token = localStorage.getItem('herdr_token') || '';
    const streamUrl = token ? `/api/stream?token=${encodeURIComponent(token)}` : '/api/stream';
    if (window.EventSource) {
        try {
            if (State.sseSource) State.sseSource.close();
            State.sseSource = new EventSource(streamUrl);
            State.sseSource.addEventListener('state', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    handleStateUpdate(data);
                } catch (err) {}
            });
            State.sseSource.onerror = () => {
                startPollingFallback();
            };
        } catch (err) {
            startPollingFallback();
        }
    } else {
        startPollingFallback();
    }
}

function startPollingFallback() {
    if (State.pollTimer) clearInterval(State.pollTimer);
    fetchState();
    State.pollTimer = setInterval(fetchState, 1200);
}

async function fetchState() {
    try {
        const token = localStorage.getItem('herdr_token') || '';
        const url = token ? `/api/state?token=${encodeURIComponent(token)}` : '/api/state';
        const res = await apiFetch(url);
        if (res.status === 401) {
            window.location.href = '/login';
            return;
        }
        if (res.ok) {
            const data = await res.json();
            handleStateUpdate(data);
        }
    } catch (e) {}
}

// =============================================================================
// USER ACTIONS: SEND PROMPT, KEYS, UPLOAD, SPEECH
// =============================================================================
async function sendPrompt() {
    const input = DOM.promptInput.value.trim();
    if (!input && !State.currentAttachment) return;

    let finalPrompt = input;
    if (State.currentAttachment) {
        finalPrompt = `[Allegato: ${State.currentAttachment.file_path}]\n` + finalPrompt;
    }

    triggerHaptic('medium');

    DOM.promptInput.value = '';
    DOM.promptInput.style.height = 'auto';
    clearAttachment();

    try {
        const res = await apiFetch('/api/pane/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pane_id: State.activePaneId,
                text: finalPrompt,
                auto_enter: true
            })
        });

        if (res.ok) {
            showToast('Prompt inviato!');
            fetchState();
        }
    } catch (err) {
        showToast('Errore di invio prompt');
    }
}

async function sendQuickKey(keyName) {
    triggerHaptic('light');
    try {
        const res = await apiFetch('/api/pane/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pane_id: State.activePaneId,
                keys: [keyName]
            })
        });
        if (res.ok) {
            showToast(`Tasto inviato: ${keyName.toUpperCase()}`);
            fetchState();
        }
    } catch (e) {}
}

window.sendQuickKey = sendQuickKey;

// Focus Actions
async function focusWorkspace(wsId) {
    triggerHaptic('light');
    State.activeWorkspaceId = wsId;
    try {
        await apiFetch('/api/workspace/focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspace_id: wsId })
        });
        fetchState();
    } catch (e) {}
}
window.focusWorkspace = focusWorkspace;

async function focusTab(tabId, wsId) {
    triggerHaptic('light');
    State.activeTabId = tabId;
    if (wsId) State.activeWorkspaceId = wsId;
    try {
        await apiFetch('/api/tab/focus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tab_id: tabId })
        });
        fetchState();
    } catch (e) {}
}
window.focusTab = focusTab;

async function createNewTab(wsId) {
    triggerHaptic('medium');
    try {
        await apiFetch('/api/tab/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workspace_id: wsId, label: 'tab' })
        });
        showToast('Nuova scheda creata');
        fetchState();
    } catch (e) {}
}
window.createNewTab = createNewTab;

// =============================================================================
// MOBILE FEATURES: SPEECH-TO-TEXT & CAMERA ATTACHMENTS
// =============================================================================
function initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        DOM.btnVoiceMic.style.display = 'none';
        return;
    }

    State.speechRecognition = new SpeechRec();
    State.speechRecognition.continuous = false;
    State.speechRecognition.interimResults = true;
    State.speechRecognition.lang = State.voiceLanguage;

    State.speechRecognition.onstart = () => {
        State.isRecordingVoice = true;
        DOM.btnVoiceMic.classList.add('recording');
        triggerHaptic('success');
    };

    State.speechRecognition.onresult = (e) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
        }
        DOM.promptInput.value = transcript;
        autoResizeTextarea(DOM.promptInput);
    };

    State.speechRecognition.onerror = () => {
        stopVoiceRecording();
    };

    State.speechRecognition.onend = () => {
        stopVoiceRecording();
    };
}

function toggleVoiceRecording() {
    if (!State.speechRecognition) return;
    if (State.isRecordingVoice) {
        State.speechRecognition.stop();
        stopVoiceRecording();
    } else {
        State.speechRecognition.lang = State.voiceLanguage;
        State.speechRecognition.start();
    }
}

function stopVoiceRecording() {
    State.isRecordingVoice = false;
    DOM.btnVoiceMic.classList.remove('recording');
}

// Camera / Image Upload
function handleFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Data = e.target.result;

        DOM.attachmentThumb.src = base64Data;
        DOM.attachmentName.textContent = file.name;
        DOM.attachmentPreviewBar.style.display = 'flex';

        triggerHaptic('light');

        try {
            const res = await apiFetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64Data,
                    filename: file.name
                })
            });

            if (res.ok) {
                const data = await res.json();
                State.currentAttachment = {
                    file_path: data.file_path,
                    url: data.url,
                    filename: data.filename
                };
                showToast('Foto pronta per l\'invio');
            }
        } catch (err) {
            showToast('Errore nel caricamento immagine');
        }
    };
    reader.readAsDataURL(file);
}

function clearAttachment() {
    State.currentAttachment = null;
    DOM.attachmentPreviewBar.style.display = 'none';
    DOM.fileInput.value = '';
}

function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';
}

// =============================================================================
// NAVIGATION, DRAWER & VIEW SWITCHER
// =============================================================================
function openDrawer() {
    triggerHaptic('light');
    DOM.appDrawer.classList.add('open');
    DOM.drawerBackdrop.classList.add('open');
}

function closeDrawer() {
    DOM.appDrawer.classList.remove('open');
    DOM.drawerBackdrop.classList.remove('open');
}

function switchView(targetViewId) {
    triggerHaptic('light');
    State.currentView = targetViewId;

    DOM.viewPanels.forEach((panel) => {
        if (panel.id === targetViewId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    DOM.drawerNavItems.forEach((item) => {
        if (item.getAttribute('data-target') === targetViewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Header Mode Icon
    if (targetViewId === 'view-terminal') {
        DOM.labelModeIcon.textContent = '💻';
    } else {
        DOM.labelModeIcon.textContent = '💬';
    }

    closeDrawer();

    if (targetViewId === 'view-chat') {
        scrollToBottom();
    }
}

window.switchView = switchView;

function openModal(modalId) {
    triggerHaptic('light');
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
}

// =============================================================================
// EVENT LISTENERS INITIALIZATION
// =============================================================================
function initEventListeners() {
    // Drawer
    DOM.btnOpenDrawer.addEventListener('click', openDrawer);
    DOM.btnCloseDrawer.addEventListener('click', closeDrawer);
    DOM.drawerBackdrop.addEventListener('click', closeDrawer);

    DOM.drawerNavItems.forEach((item) => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    DOM.btnDrawerAddWs.addEventListener('click', () => {
        closeDrawer();
        openModal('modal-new-ws');
    });

    DOM.btnDrawerLogout.addEventListener('click', async () => {
        triggerHaptic('medium');
        try {
            await apiFetch('/api/logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('herdr_token');
        window.location.href = '/login';
    });

    // Mode Toggle (Chat <-> Raw Terminal)
    DOM.btnToggleRaw.addEventListener('click', () => {
        if (State.currentView === 'view-chat') {
            switchView('view-terminal');
            showToast('Vista: Console Terminale');
        } else {
            switchView('view-chat');
            showToast('Vista: Smart Chat');
        }
    });

    // Context Picker Sheet
    DOM.btnContextPicker.addEventListener('click', () => {
        renderContextPicker();
        openModal('modal-context-picker');
    });
    DOM.btnCloseContextModal.addEventListener('click', () => closeModal('modal-context-picker'));
    DOM.modalContextPicker.addEventListener('click', (e) => {
        if (e.target === DOM.modalContextPicker) closeModal('modal-context-picker');
    });

    // Refresh
    DOM.btnRefresh.addEventListener('click', () => {
        triggerHaptic('light');
        fetchState();
        showToast('Aggiornamento...');
    });

    // Prompt Send
    DOM.btnSendPrompt.addEventListener('click', sendPrompt);
    DOM.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    });
    DOM.promptInput.addEventListener('input', () => autoResizeTextarea(DOM.promptInput));

    // Voice Mic
    DOM.btnVoiceMic.addEventListener('click', toggleVoiceRecording);

    // Camera Upload
    DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });
    DOM.btnRemoveAttachment.addEventListener('click', clearAttachment);

    // Action Chips
    DOM.actionChipsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.action-chip');
        if (!btn) return;

        const key = btn.getAttribute('data-key');
        const text = btn.getAttribute('data-text');

        if (key) {
            sendQuickKey(key);
        } else if (text) {
            DOM.promptInput.value += text;
            DOM.promptInput.focus();
            autoResizeTextarea(DOM.promptInput);
        }
    });

    // Welcome Chips
    DOM.chatWelcomeCard.addEventListener('click', (e) => {
        const chip = e.target.closest('.welcome-chip');
        if (chip) {
            const cmd = chip.getAttribute('data-command');
            DOM.promptInput.value = cmd;
            DOM.promptInput.focus();
            autoResizeTextarea(DOM.promptInput);
        }
    });

    // Clean Chat
    DOM.btnClearChat.addEventListener('click', () => {
        triggerHaptic('light');
        DOM.chatMessages.innerHTML = '';
        DOM.chatWelcomeCard.style.display = 'flex';
        showToast('Vista chat pulita');
    });

    // Scroll Bottom Floating Button
    DOM.chatMessages.addEventListener('scroll', () => {
        const distFromBottom = DOM.chatMessages.scrollHeight - DOM.chatMessages.scrollTop - DOM.chatMessages.clientHeight;
        if (distFromBottom > 150) {
            DOM.btnScrollBottom.style.display = 'flex';
        } else {
            DOM.btnScrollBottom.style.display = 'none';
        }
    });
    DOM.btnScrollBottom.addEventListener('click', () => {
        triggerHaptic('light');
        scrollToBottom();
    });

    // Workspaces Modal
    DOM.btnOpenNewWsModal.addEventListener('click', () => openModal('modal-new-ws'));
    DOM.btnCloseNewWsModal.addEventListener('click', () => closeModal('modal-new-ws'));
    DOM.btnCancelNewWs.addEventListener('click', () => closeModal('modal-new-ws'));
    DOM.btnConfirmNewWs.addEventListener('click', async () => {
        const cwd = DOM.newWsPath.value.trim();
        const label = DOM.newWsLabel.value.trim();
        if (!cwd) {
            showToast('Inserisci il percorso della cartella');
            return;
        }
        try {
            const res = await apiFetch('/api/workspace/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cwd, label })
            });
            if (res.ok) {
                showToast('Nuovo spazio creato!');
                closeModal('modal-new-ws');
                DOM.newWsPath.value = '';
                DOM.newWsLabel.value = '';
                fetchState();
            }
        } catch (e) {}
    });

    // Terminal Virtual Keys
    DOM.termKeyBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            if (key) sendQuickKey(key);
        });
    });

    // Terminal Copy
    DOM.btnCopyTerminal.addEventListener('click', () => {
        navigator.clipboard.writeText(DOM.terminalRawText.textContent).then(() => {
            showToast('Scrollback copiato negli appunti!');
        });
    });

    // Terminal Autoscroll Toggle
    DOM.btnToggleAutoscroll.addEventListener('click', () => {
        State.autoScroll = !State.autoScroll;
        DOM.btnToggleAutoscroll.textContent = State.autoScroll ? '⬇️ Auto-scroll ON' : '⏸️ Auto-scroll OFF';
        showToast(`Auto-scroll: ${State.autoScroll ? 'Attivo' : 'Disattivato'}`);
    });

    // Settings Theme Selector
    DOM.themeSelectorGroup.addEventListener('click', (e) => {
        const chip = e.target.closest('.theme-chip');
        if (!chip) return;

        const themeName = chip.getAttribute('data-set-theme');
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('herdr_theme', themeName);

        DOM.themeSelectorGroup.querySelectorAll('.theme-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        triggerHaptic('medium');
    });

    // Settings Voice Language
    DOM.voiceLangSelect.addEventListener('change', (e) => {
        State.voiceLanguage = e.target.value;
        localStorage.setItem('herdr_voice_lang', State.voiceLanguage);
        if (State.speechRecognition) State.speechRecognition.lang = State.voiceLanguage;
    });

    // Settings Toggles
    DOM.settingHaptic.addEventListener('change', (e) => {
        State.hapticEnabled = e.target.checked;
        localStorage.setItem('herdr_haptic', State.hapticEnabled);
    });
    DOM.settingAutoscroll.addEventListener('change', (e) => {
        State.autoScroll = e.target.checked;
        localStorage.setItem('herdr_autoscroll', State.autoScroll);
    });

    // Settings Logout
    DOM.btnLogoutAction.addEventListener('click', async () => {
        triggerHaptic('medium');
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (e) {}
        localStorage.removeItem('herdr_token');
        window.location.href = '/login';
    });

    // Global Desktop & Tablet Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd+K or Ctrl+K -> Context Picker
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            renderContextPicker();
            openModal('modal-context-picker');
            return;
        }

        // Cmd+1..5 or Ctrl+1..5 -> Switch Views
        if ((e.metaKey || e.ctrlKey) && ['1', '2', '3', '4', '5'].includes(e.key)) {
            e.preventDefault();
            const viewMap = {
                '1': 'view-chat',
                '2': 'view-workspaces',
                '3': 'view-agents',
                '4': 'view-terminal',
                '5': 'view-settings'
            };
            switchView(viewMap[e.key]);
            return;
        }

        // Escape -> Close Modals, Lightbox & Drawer
        if (e.key === 'Escape') {
            closeDrawer();
            closeModal('modal-context-picker');
            closeModal('modal-new-ws');
            DOM.lightboxOverlay.classList.remove('open');
        }
    });
}

// =============================================================================
// INIT & BOOTSTRAP
// =============================================================================
function bootstrap() {
    // Check if token in URL query (e.g. from iOS Web Clip redirect)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            localStorage.setItem('herdr_token', urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (e) {}

    // Restore settings
    const savedTheme = localStorage.getItem('herdr_theme') || 'cyber-dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = DOM.themeSelectorGroup.querySelector(`[data-set-theme="${savedTheme}"]`);
    if (themeBtn) {
        DOM.themeSelectorGroup.querySelectorAll('.theme-chip').forEach((c) => c.classList.remove('active'));
        themeBtn.classList.add('active');
    }

    const savedVoiceLang = localStorage.getItem('herdr_voice_lang') || 'it-IT';
    State.voiceLanguage = savedVoiceLang;
    DOM.voiceLangSelect.value = savedVoiceLang;

    if (localStorage.getItem('herdr_haptic') !== null) {
        State.hapticEnabled = localStorage.getItem('herdr_haptic') === 'true';
        DOM.settingHaptic.checked = State.hapticEnabled;
    }

    if (localStorage.getItem('herdr_autoscroll') !== null) {
        State.autoScroll = localStorage.getItem('herdr_autoscroll') === 'true';
        DOM.settingAutoscroll.checked = State.autoScroll;
    }

    initEventListeners();
    initSpeechRecognition();
    startSync();
}

document.addEventListener('DOMContentLoaded', bootstrap);
