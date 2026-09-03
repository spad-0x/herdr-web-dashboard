/**
 * Herdr Mobile Dashboard — Client Controller & Engine
 * Native WhatsApp & Linear Hybrid Architecture
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
    tabs: [],
    panes: [],
    mode: 'chat', // 'chat' or 'terminal'
    lastText: '',
    lastCleanText: '',
    lastRevision: -1,
    fontSize: parseInt(localStorage.getItem('herdr_font_size') || '13', 10),
    theme: localStorage.getItem('herdr_theme') || 'cyber-dark',
    term: null,
    fitAddon: null,
    webLinksAddon: null,
    sseSource: null,
    isRecordingVoice: false,
    speechRecognition: null,
    isAtBottom: true,
    pendingAttachment: null,
    chatMessages: [] // Local user-sent message cache
};

// =============================================================================
// DOM CACHE
// =============================================================================
const DOM = {
    appRoot: document.getElementById('app-root'),
    chatHeader: document.getElementById('chat-header'),
    btnWsPicker: document.getElementById('btn-ws-picker'),
    currentWsName: document.getElementById('current-ws-name'),
    btnHeaderContact: document.getElementById('btn-header-contact'),
    socketDot: document.getElementById('socket-dot'),
    chatHeaderTitle: document.getElementById('chat-header-title'),
    agentStatusText: document.getElementById('agent-status-text'),
    btnModeToggle: document.getElementById('btn-mode-toggle'),
    modeIcon: document.getElementById('mode-icon'),
    modeLabel: document.getElementById('mode-label'),
    btnOpenMenu: document.getElementById('btn-open-menu'),
    // Tab Strip
    tabStrip: document.getElementById('tab-strip'),
    tabsContainer: document.getElementById('tabs-container'),
    btnAddTab: document.getElementById('btn-add-tab'),
    // Viewports
    viewportWrapper: document.getElementById('viewport-wrapper'),
    chatViewport: document.getElementById('chat-viewport'),
    chatScrollContainer: document.getElementById('chat-scroll-container'),
    chatMessages: document.getElementById('chat-messages'),
    btnChatScrollBottom: document.getElementById('btn-chat-scroll-bottom'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalContainer: document.getElementById('terminal-container'),
    btnScrollBottom: document.getElementById('btn-scroll-bottom'),
    // Confirm Banner
    agentConfirmBanner: document.getElementById('agent-confirm-banner'),
    confirmText: document.getElementById('confirm-text'),
    btnConfirmYes: document.getElementById('btn-confirm-yes'),
    btnConfirmNo: document.getElementById('btn-confirm-no'),
    btnConfirmStop: document.getElementById('btn-confirm-stop'),
    // CLI Keys Drawer
    cliKeysDrawer: document.getElementById('cli-keys-drawer'),
    // Attachment Preview Bar
    attachmentPreviewBar: document.getElementById('attachment-preview-bar'),
    attachmentThumbWrap: document.getElementById('attachment-thumb-wrap'),
    attachmentThumb: document.getElementById('attachment-thumb'),
    attachmentName: document.getElementById('attachment-name'),
    attachmentSize: document.getElementById('attachment-size'),
    btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
    fileInput: null, // Dynamically created on demand to keep DOM clean
    // Footer & Input
    chatFooter: document.getElementById('chat-footer'),
    btnToggleActions: document.getElementById('btn-toggle-actions'),
    promptInput: document.getElementById('prompt-input'),
    btnAttachImage: document.getElementById('btn-attach-image'),
    btnActionMicSend: document.getElementById('btn-action-mic-send'),
    iconMic: document.querySelector('.icon-mic'),
    iconSend: document.querySelector('.icon-send'),
    // Lightbox Modal
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxBackdrop: document.getElementById('lightbox-backdrop'),
    lightboxImg: document.getElementById('lightbox-img'),
    btnLightboxClose: document.getElementById('btn-lightbox-close'),
    // Bottom Sheet
    sheetBackdrop: document.getElementById('sheet-backdrop'),
    bottomSheet: document.getElementById('bottom-sheet'),
    btnSheetClose: document.getElementById('btn-sheet-close'),
    sheetWsList: document.getElementById('sheet-ws-list'),
    sheetPanesList: document.getElementById('sheet-panes-list'),
    btnCreateWs: document.getElementById('btn-create-ws'),
    btnSplitHoriz: document.getElementById('btn-split-horiz'),
    btnSplitVert: document.getElementById('btn-split-vert'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    fontSizeDisplay: document.getElementById('font-size-display'),
    themeSelect: document.getElementById('theme-select'),
    sheetDaemonVersion: document.getElementById('sheet-daemon-version'),
    sheetSocketPath: document.getElementById('sheet-socket-path'),
    btnLogout: document.getElementById('btn-logout'),
    // New Workspace Dialog
    dialogNewWs: document.getElementById('dialog-new-ws'),
    dialogNewWsFields: document.getElementById('dialog-new-ws-fields'),
    btnDialogCancel: document.getElementById('btn-dialog-cancel'),
    btnDialogConfirm: document.getElementById('btn-dialog-confirm'),
    // Toast Shelf
    toastShelf: document.getElementById('toast-shelf')
};

// =============================================================================
// UTILITIES (HAPTIC, TOAST, API, TIME)
// =============================================================================
function triggerHaptic(type = 'light') {
    if (!navigator.vibrate) return;
    try {
        if (type === 'light') navigator.vibrate(10);
        else if (type === 'medium') navigator.vibrate(22);
        else if (type === 'success') navigator.vibrate([10, 20, 10]);
        else if (type === 'danger') navigator.vibrate([35, 35, 50]);
    } catch (e) {}
}

function showToast(msg, duration = 2200) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = msg;
    DOM.toastShelf.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}

function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function apiCall(endpoint, payload = null, method = 'POST') {
    try {
        const options = {
            method: payload ? 'POST' : method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (payload) {
            options.body = JSON.stringify(payload);
        }
        const res = await fetch(endpoint, options);
        if (res.status === 401) {
            window.location.href = '/login';
            return null;
        }
        return await res.json();
    } catch (err) {
        console.error('API Error on ' + endpoint, err);
        return null;
    }
}

// =============================================================================
// THEMES & TERMINAL (XTERM.JS)
// =============================================================================
const TERMINAL_THEMES = {
    'cyber-dark': {
        background: '#07080c',
        foreground: '#f0f4fc',
        cursor: '#00f0ff',
        selectionBackground: 'rgba(0, 240, 255, 0.25)',
        black: '#161b26',
        red: '#ff3d71',
        green: '#00e676',
        yellow: '#ffab00',
        blue: '#00f0ff',
        magenta: '#d066ff',
        cyan: '#00f0ff',
        white: '#f0f4fc'
    },
    'tokyo-night': {
        background: '#1a1b26',
        foreground: '#c0caf5',
        cursor: '#7aa2f7',
        selectionBackground: 'rgba(122, 162, 247, 0.3)',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6'
    },
    'obsidian-oled': {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selectionBackground: 'rgba(255, 255, 255, 0.3)',
        black: '#222222',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2'
    },
    'synthwave': {
        background: '#120c1a',
        foreground: '#fbebf7',
        cursor: '#ff2a85',
        selectionBackground: 'rgba(255, 42, 133, 0.35)',
        black: '#241432',
        red: '#fe4450',
        green: '#72f1b8',
        yellow: '#fede5d',
        blue: '#03edf9',
        magenta: '#ff2a85',
        cyan: '#03edf9',
        white: '#fbebf7'
    },
    'matrix': {
        background: '#040d06',
        foreground: '#00ff66',
        cursor: '#00ff66',
        selectionBackground: 'rgba(0, 255, 102, 0.3)',
        black: '#0a1c0d',
        red: '#ff3333',
        green: '#00ff66',
        yellow: '#ccff00',
        blue: '#00ccff',
        magenta: '#cc00ff',
        cyan: '#00ffcc',
        white: '#e6ffe6'
    }
};

function initTerminal() {
    const selectedTheme = TERMINAL_THEMES[State.theme] || TERMINAL_THEMES['cyber-dark'];

    State.term = new Terminal({
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: State.fontSize,
        lineHeight: 1.25,
        cursorBlink: true,
        cursorStyle: 'block',
        theme: selectedTheme,
        scrollback: 6000,
        convertEol: true,
        smoothScrollDuration: 100
    });

    State.fitAddon = new FitAddon.FitAddon();
    State.term.loadAddon(State.fitAddon);

    State.webLinksAddon = new WebLinksAddon.WebLinksAddon();
    State.term.loadAddon(State.webLinksAddon);

    State.term.open(DOM.terminalContainer);
    
    // Disable xterm internal helper textarea in Chat mode so Safari sees only 1 input
    const helperTa = DOM.terminalContainer.querySelector('.xterm-helper-textarea');
    if (helperTa && State.mode === 'chat') {
        helperTa.disabled = true;
        helperTa.tabIndex = -1;
        helperTa.setAttribute('aria-hidden', 'true');
    }

    setTimeout(() => {
        try { State.fitAddon.fit(); } catch (e) {}
    }, 60);

    State.term.onScroll(() => {
        const buffer = State.term.buffer.active;
        const atBottom = buffer.viewportY >= buffer.baseY;
        DOM.btnScrollBottom.style.display = atBottom ? 'none' : 'flex';
    });

    State.term.onData(data => {
        if (!State.activePaneId) return;
        if (data === '\r') {
            apiCall('/api/pane/keys', { pane_id: State.activePaneId, keys: ['enter'] });
        } else if (data === '\x03') {
            apiCall('/api/pane/keys', { pane_id: State.activePaneId, keys: ['ctrl+c'] });
        } else if (data === '\x1b') {
            apiCall('/api/pane/keys', { pane_id: State.activePaneId, keys: ['esc'] });
        } else if (data === '\t') {
            apiCall('/api/pane/keys', { pane_id: State.activePaneId, keys: ['tab'] });
        } else {
            apiCall('/api/pane/text', { pane_id: State.activePaneId, text: data, auto_enter: false });
        }
    });

    DOM.terminalContainer.addEventListener('click', () => {
        State.term.focus();
    });

    DOM.btnScrollBottom.addEventListener('click', () => {
        State.term.scrollToBottom();
        DOM.btnScrollBottom.style.display = 'none';
    });
}

// =============================================================================
// MODE SWITCHER: CHAT (WHATSAPP) vs TERMINAL (XTERM)
// =============================================================================
function toggleMode() {
    triggerHaptic('light');
    const newMode = State.mode === 'chat' ? 'terminal' : 'chat';
    setMode(newMode);
}

function setMode(mode) {
    State.mode = mode;
    const xtermTextarea = DOM.terminalContainer ? DOM.terminalContainer.querySelector('.xterm-helper-textarea') : null;
    if (mode === 'chat') {
        DOM.chatViewport.style.display = 'flex';
        DOM.terminalViewport.style.display = 'none';
        DOM.modeIcon.textContent = '💻';
        DOM.modeLabel.textContent = 'Terminale';
        DOM.btnToggleActions.style.display = 'flex';
        if (xtermTextarea) {
            xtermTextarea.disabled = true;
            xtermTextarea.tabIndex = -1;
            xtermTextarea.setAttribute('aria-hidden', 'true');
        }
        scrollChatToBottom();
    } else {
        DOM.chatViewport.style.display = 'none';
        DOM.terminalViewport.style.display = 'block';
        DOM.modeIcon.textContent = '💬';
        DOM.modeLabel.textContent = 'Chat';
        DOM.cliKeysDrawer.style.display = 'flex'; // Auto show CLI keys in terminal mode
        DOM.btnToggleActions.classList.add('active');
        if (xtermTextarea) {
            xtermTextarea.disabled = false;
            xtermTextarea.tabIndex = 0;
            xtermTextarea.removeAttribute('aria-hidden');
        }
        if (State.fitAddon) {
            setTimeout(() => {
                try {
                    State.fitAddon.fit();
                    State.term.focus();
                } catch (e) {}
            }, 30);
        }
    }
}

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
        DOM.sheetDaemonVersion.textContent = `v${data.version}`;
    }
    if (data.socket_path) {
        State.socketPath = data.socket_path;
        DOM.sheetSocketPath.textContent = data.socket_path;
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
function updateChatContent(pane, paneChanged) {
    const cleanText = pane.clean_text || '';
    if (!cleanText || cleanText === State.lastCleanText) return;
    State.lastCleanText = cleanText;

    // Parse clean terminal text into coherent conversation chunks
    renderActiveChatFromTerminal(cleanText, pane);
}

function renderActiveChatFromTerminal(cleanText, pane) {
    // Keep any user-sent local messages and append parsed agent output
    const lines = cleanText.split('\n');
    const tailLines = lines.slice(-40); // Last 40 lines for responsive context
    const agentText = tailLines.join('\n').trim();

    // Check if we already have the agent response bubble or need to update
    let agentBubble = document.getElementById('active-agent-bubble');
    if (!agentBubble) {
        agentBubble = document.createElement('div');
        agentBubble.id = 'active-agent-bubble';
        agentBubble.className = 'chat-bubble bubble-agent';
        DOM.chatMessages.appendChild(agentBubble);
    }

    const agentName = pane.agent || pane.title || 'Herdr Agent';
    const timeStr = formatTime();

    // Format output with code block detection
    let contentHtml = '';
    if (agentText.includes('```') || agentText.includes('---') || agentText.includes('│')) {
        contentHtml = `<pre class="bubble-code-block"><code>${escapeHtml(agentText)}</code></pre>`;
    } else {
        contentHtml = escapeHtml(agentText).replace(/\n/g, '<br>');
    }

    agentBubble.innerHTML = `
        <div class="bubble-avatar">🐏</div>
        <div class="bubble-body">
            <div class="bubble-sender">${escapeHtml(agentName)}</div>
            <div class="bubble-content">${contentHtml}</div>
            <div class="bubble-time">${timeStr}</div>
        </div>
    `;

    scrollChatToBottom();
}

function appendUserBubble(text, imagePath = null) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bubble-user';

    let imgHtml = '';
    if (imagePath) {
        imgHtml = `<img class="bubble-user-image" src="/api/file?path=${imagePath}" alt="Screenshot">`;
    }

    const timeStr = formatTime();

    bubble.innerHTML = `
        ${imgHtml}
        <div class="bubble-content">${escapeHtml(text)}</div>
        <div class="bubble-time">${timeStr} <span class="checkmarks">✓✓</span></div>
    `;

    // Add click to open image in lightbox
    if (imagePath) {
        const img = bubble.querySelector('.bubble-user-image');
        if (img) {
            img.addEventListener('click', () => openLightbox(`/api/file?path=${imagePath}`));
        }
    }

    DOM.chatMessages.appendChild(bubble);
    scrollChatToBottom();
}

function scrollChatToBottom() {
    DOM.chatScrollContainer.scrollTop = DOM.chatScrollContainer.scrollHeight;
}

// =============================================================================
// TABS RENDERING
// =============================================================================
function renderTabs(tabs) {
    DOM.tabsContainer.innerHTML = '';
    tabs.forEach(tab => {
        const pill = document.createElement('button');
        pill.className = `tab-pill ${tab.tab_id === State.activeTabId ? 'active' : ''}`;
        
        let icon = '📑';
        const hasAgent = tab.panes && tab.panes.some(p => p.agent || p.status === 'working' || p.status === 'blocked');
        if (hasAgent) icon = '🤖';

        pill.innerHTML = `
            <span>${icon}</span>
            <span>${tab.label || 'Tab'}</span>
            <span class="tab-close-btn" title="Chiudi">✕</span>
        `;

        pill.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-close-btn')) {
                e.stopPropagation();
                triggerHaptic('medium');
                apiCall('/api/tab/close', { tab_id: tab.tab_id });
                return;
            }
            triggerHaptic('light');
            State.activeTabId = tab.tab_id;
            apiCall('/api/tab/focus', { tab_id: tab.tab_id });
        });

        DOM.tabsContainer.appendChild(pill);
    });
}

// =============================================================================
// ATTACHMENT & IMAGE UPLOAD HANDLING
// =============================================================================
function setAttachment(dataUrl, filename, size) {
    State.pendingAttachment = {
        dataUrl,
        filename: filename || 'screenshot.png',
        size: size || 0
    };
    DOM.attachmentThumb.src = dataUrl;
    DOM.attachmentName.textContent = State.pendingAttachment.filename;
    DOM.attachmentSize.textContent = formatBytes(State.pendingAttachment.size);
    DOM.attachmentPreviewBar.style.display = 'flex';
    updateInputState();
    DOM.promptInput.focus();
    triggerHaptic('success');
    showToast('📷 Screenshot aggiunto');
}

function clearAttachment() {
    State.pendingAttachment = null;
    DOM.attachmentPreviewBar.style.display = 'none';
    DOM.attachmentThumb.src = '';
    DOM.fileInput.value = '';
    updateInputState();
}

function openLightbox(imgSrc) {
    if (!imgSrc) return;
    DOM.lightboxImg.src = imgSrc;
    DOM.lightboxModal.style.display = 'flex';
}

function closeLightbox() {
    DOM.lightboxModal.style.display = 'none';
    DOM.lightboxImg.src = '';
}

function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        setAttachment(e.target.result, file.name || 'screenshot.png', file.size);
    };
    reader.readAsDataURL(file);
}

function handlePasteEvent(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData || !clipboardData.items) return;

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = items[i].getAsFile();
            handleImageFile(file);
            return;
        }
    }
}

// =============================================================================
// PROMPT & COMMAND DISPATCH (CONTENTEDITABLE / IOS ASSISTANT SAFE)
// =============================================================================
function getPromptText() {
    return (DOM.promptInput.innerText || DOM.promptInput.textContent || '').trim();
}

function clearPromptInput() {
    DOM.promptInput.textContent = '';
    DOM.promptInput.innerHTML = '';
}

function setPromptText(text) {
    DOM.promptInput.textContent = text;
}

function updateInputState() {
    const text = getPromptText();
    const hasContent = (text.length > 0) || (State.pendingAttachment !== null);

    if (hasContent) {
        DOM.iconMic.style.display = 'none';
        DOM.iconSend.style.display = 'block';
        DOM.btnActionMicSend.title = 'Invia messaggio';
    } else {
        DOM.iconMic.style.display = 'block';
        DOM.iconSend.style.display = 'none';
        DOM.btnActionMicSend.title = 'Dettatura vocale';
    }
}

async function sendPrompt() {
    const text = getPromptText();
    if (!text && !State.pendingAttachment) return;
    if (!State.activePaneId) return;

    triggerHaptic('medium');

    let uploadedFilePath = null;
    if (State.pendingAttachment) {
        showToast('Caricamento immagine...');
        const uploadRes = await apiCall('/api/upload', {
            image: State.pendingAttachment.dataUrl,
            filename: State.pendingAttachment.filename
        });

        if (uploadRes && uploadRes.success && uploadRes.file_path) {
            uploadedFilePath = uploadRes.file_path;
        } else {
            showToast('Errore nel caricamento immagine');
            return;
        }
        clearAttachment();
    }

    clearPromptInput();
    updateInputState();

    // Append to local WhatsApp chat view immediately
    appendUserBubble(text, uploadedFilePath);

    let finalCommand = text;
    if (uploadedFilePath) {
        finalCommand = text ? `${text} ${uploadedFilePath}` : uploadedFilePath;
    }

    const res = await apiCall('/api/pane/text', {
        pane_id: State.activePaneId,
        text: finalCommand,
        auto_enter: true
    });

    if (res && !res.error) {
        showToast(uploadedFilePath ? '✓ Inviato con immagine' : 'Messaggio inviato');
    }
}

async function sendKey(keyName) {
    if (!State.activePaneId) return;
    triggerHaptic('light');
    await apiCall('/api/pane/keys', {
        pane_id: State.activePaneId,
        keys: [keyName]
    });
}

async function sendQuickText(text) {
    if (!State.activePaneId) return;
    triggerHaptic('light');
    appendUserBubble(text);
    await apiCall('/api/pane/text', {
        pane_id: State.activePaneId,
        text: text,
        auto_enter: true
    });
}

// =============================================================================
// SPEECH-TO-TEXT (VOICE DICTATION)
// =============================================================================
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    State.speechRecognition = new SpeechRecognition();
    State.speechRecognition.lang = 'it-IT';
    State.speechRecognition.continuous = false;
    State.speechRecognition.interimResults = false;

    State.speechRecognition.onstart = () => {
        State.isRecordingVoice = true;
        DOM.btnActionMicSend.classList.add('recording');
        triggerHaptic('medium');
        showToast('🎙️ In ascolto...');
    };

    State.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            const current = getPromptText();
            setPromptText(current ? `${current} ${transcript}` : transcript);
            updateInputState();
            DOM.promptInput.focus();
            triggerHaptic('success');
        }
    };

    State.speechRecognition.onerror = () => {
        State.isRecordingVoice = false;
        DOM.btnActionMicSend.classList.remove('recording');
    };

    State.speechRecognition.onend = () => {
        State.isRecordingVoice = false;
        DOM.btnActionMicSend.classList.remove('recording');
    };
}

function handleMicOrSendClick() {
    const text = getPromptText();
    const hasContent = (text.length > 0) || (State.pendingAttachment !== null);

    if (hasContent) {
        sendPrompt();
    } else {
        if (!State.speechRecognition) {
            showToast('Dettatura non supportata in questo browser');
            return;
        }
        if (State.isRecordingVoice) {
            State.speechRecognition.stop();
        } else {
            State.speechRecognition.start();
        }
    }
}

// =============================================================================
// BOTTOM SHEET MODAL (CONTROLS & SETTINGS)
// =============================================================================
function openBottomSheet() {
    triggerHaptic('light');
    renderSheetWorkspaces();
    renderSheetPanes();
    DOM.fontSizeDisplay.textContent = `${State.fontSize}px`;
    DOM.themeSelect.value = State.theme;
    if (DOM.themeSelect) {
        DOM.themeSelect.disabled = false;
        DOM.themeSelect.tabIndex = 0;
    }

    DOM.sheetBackdrop.classList.add('active');
    DOM.bottomSheet.classList.add('active');
}

function closeBottomSheet() {
    DOM.sheetBackdrop.classList.remove('active');
    DOM.bottomSheet.classList.remove('active');
    if (DOM.themeSelect) {
        DOM.themeSelect.disabled = true;
        DOM.themeSelect.tabIndex = -1;
    }
}

function renderSheetWorkspaces() {
    DOM.sheetWsList.innerHTML = '';
    State.workspaces.forEach(ws => {
        const item = document.createElement('div');
        item.className = `sheet-list-item ${ws.id === State.activeWorkspaceId ? 'active' : ''}`;
        item.innerHTML = `
            <div>
                <strong>${ws.name || `Workspace ${ws.id}`}</strong>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${ws.cwd || '~'}</div>
            </div>
            <span style="font-size: 12px; color: var(--cyan); font-weight: 600;">${ws.id === State.activeWorkspaceId ? 'Attivo' : 'Passa'}</span>
        `;
        item.addEventListener('click', async () => {
            triggerHaptic('light');
            State.activeWorkspaceId = ws.id;
            await apiCall('/api/workspace/focus', { workspace_id: ws.id });
            closeBottomSheet();
        });
        DOM.sheetWsList.appendChild(item);
    });
}

function renderSheetPanes() {
    DOM.sheetPanesList.innerHTML = '';
    if (State.panes.length === 0) {
        DOM.sheetPanesList.innerHTML = '<div style="font-size: 12px; color: var(--text-muted);">Nessun pannello attivo</div>';
        return;
    }

    State.panes.forEach(pane => {
        const item = document.createElement('div');
        item.className = `sheet-list-item ${pane.pane_id === State.activePaneId ? 'active' : ''}`;
        item.innerHTML = `
            <div>
                <strong>${pane.title || pane.pane_id}</strong>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${pane.cwd || '~'}</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: var(--cyan);">${pane.status}</span>
                <button class="btn-mini-action btn-close-pane" style="color: var(--danger);">✕</button>
            </div>
        `;
        item.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-close-pane')) {
                e.stopPropagation();
                triggerHaptic('medium');
                await apiCall('/api/pane/close', { pane_id: pane.pane_id });
                showToast('Pannello chiuso');
                return;
            }
            triggerHaptic('light');
            State.activePaneId = pane.pane_id;
            await apiCall('/api/pane/focus', { pane_id: pane.pane_id });
            closeBottomSheet();
        });
        DOM.sheetPanesList.appendChild(item);
    });
}

function updateTheme(newTheme) {
    State.theme = newTheme;
    localStorage.setItem('herdr_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    if (State.term) {
        const t = TERMINAL_THEMES[newTheme] || TERMINAL_THEMES['cyber-dark'];
        State.term.options.theme = t;
    }
}

function updateFontSize(delta) {
    const newSize = Math.max(9, Math.min(22, State.fontSize + delta));
    State.fontSize = newSize;
    localStorage.setItem('herdr_font_size', newSize.toString());
    DOM.fontSizeDisplay.textContent = `${newSize}px`;

    if (State.term) {
        State.term.options.fontSize = newSize;
        try { State.fitAddon.fit(); } catch (e) {}
    }
}

// =============================================================================
// SETUP EVENT LISTENERS
// =============================================================================
function setupEventListeners() {
    // Mode Switcher
    DOM.btnModeToggle.addEventListener('click', toggleMode);

    // Workspace & Controls Menu
    DOM.btnWsPicker.addEventListener('click', openBottomSheet);
    DOM.btnHeaderContact.addEventListener('click', openBottomSheet);
    DOM.btnOpenMenu.addEventListener('click', openBottomSheet);

    // Tab Add
    DOM.btnAddTab.addEventListener('click', () => {
        triggerHaptic('light');
        apiCall('/api/tab/create', { workspace_id: State.activeWorkspaceId, label: 'tab' });
    });

    // Confirmation Banner
    DOM.btnConfirmYes.addEventListener('click', () => sendQuickText('y'));
    DOM.btnConfirmNo.addEventListener('click', () => sendQuickText('n'));
    DOM.btnConfirmStop.addEventListener('click', () => sendKey('ctrl+c'));

    // '+' Action Button in Footer
    DOM.btnToggleActions.addEventListener('click', () => {
        triggerHaptic('light');
        const isHidden = (DOM.cliKeysDrawer.style.display === 'none');
        DOM.cliKeysDrawer.style.display = isHidden ? 'flex' : 'none';
        DOM.btnToggleActions.classList.toggle('active', isHidden);
    });

    // CLI Drawer Keys
    DOM.cliKeysDrawer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.dataset.key) {
            sendKey(btn.dataset.key);
        } else if (btn.dataset.send) {
            const sendVal = btn.dataset.send;
            if (sendVal.startsWith('/')) {
                setPromptText(sendVal);
                updateInputState();
                DOM.promptInput.focus();
            } else {
                sendQuickText(sendVal);
            }
        }
    });

    // Input changes & Send/Mic
    DOM.promptInput.addEventListener('input', () => {
        updateInputState();
    });

    DOM.promptInput.addEventListener('focus', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
            if (window.visualViewport) {
                const appRoot = document.getElementById('app-root');
                if (appRoot) {
                    appRoot.style.height = `${window.visualViewport.height}px`;
                    appRoot.style.top = `${window.visualViewport.offsetTop}px`;
                }
            }
            scrollChatToBottom();
        }, 100);
    });

    DOM.promptInput.addEventListener('blur', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
            const appRoot = document.getElementById('app-root');
            if (appRoot) {
                appRoot.style.height = '100vh';
                appRoot.style.top = '0px';
            }
            if (State.fitAddon && State.mode === 'terminal') {
                try { State.fitAddon.fit(); } catch (e) {}
            }
        }, 100);
    });

    DOM.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    });

    DOM.btnActionMicSend.addEventListener('click', handleMicOrSendClick);

    // Image Attachments & Paste
    document.addEventListener('paste', handlePasteEvent);
    DOM.promptInput.addEventListener('paste', handlePasteEvent);

    DOM.btnAttachImage.addEventListener('click', () => {
        const tempFileInput = document.createElement('input');
        tempFileInput.type = 'file';
        tempFileInput.accept = 'image/*';
        tempFileInput.style.display = 'none';
        tempFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
            }
            tempFileInput.remove();
        });
        document.body.appendChild(tempFileInput);
        tempFileInput.click();
    });

    DOM.btnRemoveAttachment.addEventListener('click', clearAttachment);

    DOM.attachmentThumbWrap.addEventListener('click', () => {
        if (State.pendingAttachment && State.pendingAttachment.dataUrl) {
            openLightbox(State.pendingAttachment.dataUrl);
        }
    });

    DOM.btnLightboxClose.addEventListener('click', closeLightbox);
    DOM.lightboxBackdrop.addEventListener('click', closeLightbox);

    // Drag & Drop
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    });

    // Bottom Sheet Controls
    DOM.btnSheetClose.addEventListener('click', closeBottomSheet);
    DOM.sheetBackdrop.addEventListener('click', closeBottomSheet);

    DOM.btnSplitHoriz.addEventListener('click', async () => {
        triggerHaptic('medium');
        await apiCall('/api/pane/split', { pane_id: State.activePaneId, direction: 'right' });
        showToast('Split orizzontale creato');
        closeBottomSheet();
    });

    DOM.btnSplitVert.addEventListener('click', async () => {
        triggerHaptic('medium');
        await apiCall('/api/pane/split', { pane_id: State.activePaneId, direction: 'down' });
        showToast('Split verticale creato');
        closeBottomSheet();
    });

    DOM.btnFontDec.addEventListener('click', () => updateFontSize(-1));
    DOM.btnFontInc.addEventListener('click', () => updateFontSize(1));
    DOM.themeSelect.addEventListener('change', (e) => updateTheme(e.target.value));

    DOM.btnLogout.addEventListener('click', async () => {
        await apiCall('/api/logout');
        window.location.href = '/login';
    });

    // Workspace Dialog
    DOM.btnCreateWs.addEventListener('click', () => {
        closeBottomSheet();
        if (DOM.dialogNewWsFields) {
            DOM.dialogNewWsFields.innerHTML = `
                <label for="input-new-ws-cwd">Directory del progetto (CWD):</label>
                <input type="text" id="input-new-ws-cwd" placeholder="/Users/leospa/..." value="~">
                <label for="input-new-ws-label">Nome etichetta (opzionale):</label>
                <input type="text" id="input-new-ws-label" placeholder="Es. api-service">
            `;
        }
        DOM.dialogNewWs.showModal();
        const firstInput = document.getElementById('input-new-ws-cwd');
        if (firstInput) firstInput.focus();
    });

    function closeAndCleanupNewWsDialog() {
        DOM.dialogNewWs.close();
        if (DOM.dialogNewWsFields) {
            DOM.dialogNewWsFields.innerHTML = '';
        }
    }

    DOM.btnDialogCancel.addEventListener('click', () => {
        closeAndCleanupNewWsDialog();
    });

    DOM.btnDialogConfirm.addEventListener('click', async () => {
        const cwdInput = document.getElementById('input-new-ws-cwd');
        const labelInput = document.getElementById('input-new-ws-label');
        const cwd = (cwdInput && cwdInput.value.trim()) || '~';
        const label = (labelInput && labelInput.value.trim()) || undefined;
        closeAndCleanupNewWsDialog();
        triggerHaptic('success');
        const res = await apiCall('/api/workspace/create', { cwd, label });
        if (res && !res.error) showToast('Nuovo spazio creato');
    });

    // Mobile Viewport Resize Handling
    // Mobile Viewport & Virtual Keyboard Manager (VisualViewport API)
    if (window.visualViewport) {
        function adjustToVisualViewport() {
            const vp = window.visualViewport;
            const appRoot = document.getElementById('app-root');
            if (!appRoot) return;

            // Lock app-root strictly to the visual viewport
            appRoot.style.height = `${vp.height}px`;
            appRoot.style.top = `${vp.offsetTop}px`;

            // Prevent Safari from phantom scrolling the window behind fixed elements
            if (window.scrollY !== 0 || window.scrollX !== 0) {
                window.scrollTo(0, 0);
            }

            if (State.mode === 'chat') {
                scrollChatToBottom();
            } else if (State.fitAddon && State.mode === 'terminal') {
                try { State.fitAddon.fit(); } catch (e) {}
            }
        }

        window.visualViewport.addEventListener('resize', adjustToVisualViewport);
        window.visualViewport.addEventListener('scroll', adjustToVisualViewport);
    }

    window.addEventListener('resize', () => {
        if (!window.visualViewport) {
            if (State.fitAddon && State.mode === 'terminal') {
                try { State.fitAddon.fit(); } catch (e) {}
            }
        }
    });

    // Orientation Change & iOS Safe Area Handling
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            fixIosSafeAreaAndChinGap();
            window.scrollTo(0, 0);
        }, 300);
    });

    // Prevent body pull-to-refresh but allow scrollable containers
    document.body.addEventListener('touchmove', (e) => {
        if (e.target.closest('.chat-scroll-container') || 
            e.target.closest('.terminal-container') || 
            e.target.closest('.sheet-body') ||
            e.target.closest('.cli-keys-drawer') ||
            e.target.closest('.cli-keys-scroll') ||
            e.target.closest('.tabs-container')) {
            return;
        }
        e.preventDefault();
    }, { passive: false });

    // Disable pinch-to-zoom gestures on iOS WebKit
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturechange', (e) => {
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('gestureend', (e) => {
        e.preventDefault();
    }, { passive: false });

    // Disable double-tap zoom on iOS WebKit
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            if (!e.target.closest('#prompt-input') && !e.target.closest('button') && !e.target.closest('input')) {
                e.preventDefault();
            }
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// =============================================================================
// IOS PWA FULLSCREEN & SAFE AREA STABILIZATION (Reddit / WebKit Chin Gap Workaround)
// =============================================================================
function fixIosSafeAreaAndChinGap() {
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone = window.navigator.standalone || 
                         window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && isStandalone) {
        // Toggle viewport-fit to force WebKit to recalculate env() values
        // and eliminate the 59px negative offset chin gap on cold start
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            const original = meta.getAttribute('content');
            if (original && original.includes('viewport-fit=cover')) {
                meta.setAttribute('content', original.replace('viewport-fit=cover', 'viewport-fit=auto'));
                requestAnimationFrame(() => {
                    meta.setAttribute('content', original);
                    requestAnimationFrame(() => {
                        if (State.fitAddon && State.mode === 'terminal') {
                            try { State.fitAddon.fit(); } catch (e) {}
                        }
                        if (State.mode === 'chat') {
                            scrollChatToBottom();
                        }
                    });
                });
            }
        }
    }
}

// =============================================================================
// APPLICATION BOOTSTRAP
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    updateTheme(State.theme);
    initTerminal();
    initSpeechRecognition();
    setupEventListeners();
    updateInputState();
    connectStateStream();

    // iOS PWA Fullscreen & Safe Area Stabilization
    fixIosSafeAreaAndChinGap();
    setTimeout(fixIosSafeAreaAndChinGap, 100);
    setTimeout(fixIosSafeAreaAndChinGap, 500);

    console.log('🚀 Herdr Mobile Dashboard (WhatsApp Layout) avviato con successo.');
});
