// =============================================================================
// TABS RENDERING
// =============================================================================
function renderTabs(tabs) {
    DOM.tabsContainer.innerHTML = '';
    tabs.forEach(tab => {
        const pill = document.createElement('button');
        pill.className = `tab-pill ${tab.tab_id === State.activeTabId ? 'active' : ''}`;
        
        let iconHtml = '<span>📑</span>';
        const agentPane = tab.panes && tab.panes.find(p => p.agent || p.status === 'working' || p.status === 'blocked' || (typeof check_is_agent === 'function' && check_is_agent(p)));
        if (agentPane && typeof getAgentIconSvg === 'function') {
            iconHtml = `<span style="display:inline-flex; align-items:center;">${getAgentIconSvg(agentPane.agent || agentPane.title || agentPane.command, 14)}</span>`;
        }

        pill.innerHTML = `
            ${iconHtml}
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
            if (State.activeTabId === tab.tab_id) return;
            
            triggerHaptic('light');
            State.activeTabId = tab.tab_id;
            
            // Optimistic UI update to remove perceived latency
            renderTabs(State.tabs);
            if (State.term) State.term.clear(); 
            
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

    if (!State.activePaneId) {
        const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId) || State.workspaces[0];
        if (activeWs && activeWs.panes && activeWs.panes.length > 0) {
            State.activePaneId = activeWs.panes[0].pane_id;
        } else if (State.panes && State.panes.length > 0) {
            State.activePaneId = State.panes[0].pane_id;
        }
    }

    if (!State.activePaneId) {
        showToast('Nessun agente attivo su cui inviare');
        return;
    }

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
    if (!State.activePaneId) {
        const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId) || State.workspaces[0];
        if (activeWs && activeWs.panes && activeWs.panes.length > 0) {
            State.activePaneId = activeWs.panes[0].pane_id;
        } else if (State.panes && State.panes.length > 0) {
            State.activePaneId = State.panes[0].pane_id;
        }
    }
    if (!State.activePaneId) {
        showToast('Nessun terminale attivo');
        return;
    }
    triggerHaptic('light');
    const normalizedKey = keyName.replace('-', '+');
    await apiCall('/api/pane/keys', {
        pane_id: State.activePaneId,
        keys: [normalizedKey]
    });
}

// =============================================================================
// CTRL SHORTCUTS POPUP (LONG-PRESS & TAP FLYOUT)
// =============================================================================
function initCtrlMenu() {
    if (!DOM.btnCtrlMenu || !DOM.ctrlShortcutsPopup) return;

    let pressTimer = null;
    let isLongPress = false;
    let isHolding = false;

    function openCtrlPopup() {
        if (!DOM.ctrlShortcutsPopup) return;

        DOM.ctrlShortcutsPopup.style.display = 'block';
        if (DOM.ctrlPopupBackdrop) DOM.ctrlPopupBackdrop.style.display = 'block';

        const btnRect = DOM.btnCtrlMenu.getBoundingClientRect();
        const drawerRect = DOM.cliKeysDrawer ? DOM.cliKeysDrawer.getBoundingClientRect() : btnRect;
        const popupWidth = DOM.ctrlShortcutsPopup.offsetWidth || 320;

        // Calculate horizontal position (align with button, bounded inside viewport)
        let left = btnRect.left;
        if (left + popupWidth > window.innerWidth - 10) {
            left = window.innerWidth - popupWidth - 10;
        }
        if (left < 10) left = 10;

        // Calculate bottom position (just above the drawer bar)
        const bottom = Math.max(10, window.innerHeight - drawerRect.top + 6);

        DOM.ctrlShortcutsPopup.style.left = `${Math.round(left)}px`;
        DOM.ctrlShortcutsPopup.style.bottom = `${Math.round(bottom)}px`;
        DOM.ctrlShortcutsPopup.classList.add('active');
        DOM.btnCtrlMenu.classList.add('active');
        triggerHaptic('medium');
    }

    function closeCtrlPopup() {
        if (!DOM.ctrlShortcutsPopup) return;
        DOM.ctrlShortcutsPopup.style.display = 'none';
        DOM.ctrlShortcutsPopup.classList.remove('active');
        if (DOM.ctrlPopupBackdrop) DOM.ctrlPopupBackdrop.style.display = 'none';
        if (DOM.btnCtrlMenu) DOM.btnCtrlMenu.classList.remove('active');
        DOM.ctrlShortcutsPopup.querySelectorAll('.ctrl-grid-item').forEach(el => el.classList.remove('drag-hover'));
    }

    function triggerShortcut(item) {
        if (!item || !item.dataset.key) return;
        const key = item.dataset.key;
        const name = item.dataset.name || key;
        triggerHaptic('light');
        sendKey(key);
        showToast(`Inviato ${name}`);
        closeCtrlPopup();
    }

    // Pointerdown: start hold timer
    DOM.btnCtrlMenu.addEventListener('pointerdown', () => {
        isLongPress = false;
        isHolding = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            isHolding = true;
            openCtrlPopup();
        }, 260);
    });

    // Window pointermove: if dragging finger/mouse after long-press, highlight hovered item
    window.addEventListener('pointermove', (e) => {
        if (!isHolding || DOM.ctrlShortcutsPopup.style.display !== 'block') return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const gridItem = target ? target.closest('.ctrl-grid-item') : null;
        DOM.ctrlShortcutsPopup.querySelectorAll('.ctrl-grid-item').forEach(el => {
            el.classList.toggle('drag-hover', el === gridItem);
        });
    });

    // Window pointerup: handle long-press release selection or tap
    window.addEventListener('pointerup', (e) => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        if (isHolding) {
            isHolding = false;
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const gridItem = target ? target.closest('.ctrl-grid-item') : null;
            if (gridItem) {
                triggerShortcut(gridItem);
            }
        }
    });

    window.addEventListener('pointercancel', () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        isHolding = false;
    });

    // Click on Ctrl button: short tap toggles menu
    DOM.btnCtrlMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isLongPress) {
            isLongPress = false;
            return;
        }
        const isOpen = (DOM.ctrlShortcutsPopup.style.display === 'block');
        if (isOpen) {
            closeCtrlPopup();
        } else {
            openCtrlPopup();
        }
    });

    // Click on individual grid items
    DOM.ctrlShortcutsPopup.addEventListener('click', (e) => {
        const item = e.target.closest('.ctrl-grid-item');
        if (item) {
            e.stopPropagation();
            triggerShortcut(item);
        }
    });

    // Backdrop click dismisses
    if (DOM.ctrlPopupBackdrop) {
        DOM.ctrlPopupBackdrop.addEventListener('click', () => {
            closeCtrlPopup();
        });
    }

    // Dismiss on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.ctrlShortcutsPopup && DOM.ctrlShortcutsPopup.style.display === 'block') {
            closeCtrlPopup();
        }
    });

    // Close on viewport resize / orientation change to prevent detached positioning
    window.addEventListener('resize', () => {
        if (DOM.ctrlShortcutsPopup && DOM.ctrlShortcutsPopup.style.display === 'block') {
            closeCtrlPopup();
        }
    });
}

// =============================================================================
// SLASH COMMANDS & DYNAMIC SKILLS PALETTE
// =============================================================================
let filteredSlashCommands = [];

async function loadSlashCommands() {
    try {
        const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId);
        const cwd = activeWs ? activeWs.cwd : null;
        const res = await apiCall('/api/slash-commands', { cwd: cwd });
        if (res && res.commands && Array.isArray(res.commands)) {
            State.slashCommands = res.commands;
            if (DOM.slashPaletteCount) {
                DOM.slashPaletteCount.textContent = `${res.commands.length} comandi`;
            }
            return res.commands;
        }
    } catch (e) {
        console.error('Failed to load slash commands:', e);
    }
    return [];
}

function renderSlashPalette(filterQuery = '') {
    if (!DOM.slashPaletteList) return;
    DOM.slashPaletteList.innerHTML = '';

    if (!State.slashCommands || State.slashCommands.length === 0) {
        const loading = document.createElement('div');
        loading.className = 'slash-palette-empty';
        loading.textContent = 'Caricamento comandi e skill...';
        DOM.slashPaletteList.appendChild(loading);
        return;
    }

    const cleanQuery = filterQuery.startsWith('/') ? filterQuery.slice(1).toLowerCase().trim() : filterQuery.toLowerCase().trim();

    filteredSlashCommands = State.slashCommands.filter(item => {
        // Category filter
        if (State.activeSlashCat !== 'all') {
            if (State.activeSlashCat === 'skill') {
                if (item.type !== 'skill' && item.category !== 'skill') return false;
            } else if (item.category !== State.activeSlashCat) {
                return false;
            }
        }
        // Text filter
        if (!cleanQuery) return true;
        const nameMatch = item.name.toLowerCase().includes(cleanQuery);
        const cmdMatch = item.cmd.toLowerCase().includes(cleanQuery);
        const descMatch = (item.desc || '').toLowerCase().includes(cleanQuery);
        const aliasMatch = (item.alias || '').toLowerCase().includes(cleanQuery);
        const pluginMatch = (item.plugin || '').toLowerCase().includes(cleanQuery);
        return nameMatch || cmdMatch || descMatch || aliasMatch || pluginMatch;
    });

    if (DOM.slashPaletteCount) {
        DOM.slashPaletteCount.textContent = `${filteredSlashCommands.length} comandi`;
    }

    if (filteredSlashCommands.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'slash-palette-empty';
        empty.textContent = cleanQuery ? `Nessuna skill o comando per "${cleanQuery}"` : 'Nessun comando in questa categoria';
        DOM.slashPaletteList.appendChild(empty);
        return;
    }

    if (State.selectedSlashIndex >= filteredSlashCommands.length) {
        State.selectedSlashIndex = 0;
    }

    const frag = document.createDocumentFragment();
    filteredSlashCommands.forEach((cmd, idx) => {
        const item = document.createElement('div');
        item.className = `slash-cmd-item ${idx === State.selectedSlashIndex ? 'selected' : ''}`;
        item.dataset.index = idx.toString();
        item.dataset.cmd = cmd.cmd;

        const badgeClass = cmd.type === 'skill' ? 'badge-skill' : (cmd.type === 'builtin' ? 'badge-builtin' : 'badge-custom');
        const badgeLabel = cmd.type === 'skill' ? (cmd.plugin ? cmd.plugin.toUpperCase() : 'Skill') : (cmd.type === 'builtin' ? 'Core' : 'Custom');

        item.innerHTML = `
            <div class="slash-cmd-left">
                <div class="slash-cmd-top">
                    <span class="slash-cmd-icon">${escapeHtml(cmd.icon || '⚡')}</span>
                    <span class="slash-cmd-name">${escapeHtml(cmd.cmd)}</span>
                    ${cmd.alias ? `<span class="slash-cmd-alias">${escapeHtml(cmd.alias)}</span>` : ''}
                </div>
                <div class="slash-cmd-desc">${escapeHtml(cmd.desc || '')}</div>
            </div>
            <span class="slash-cmd-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
        `;

        item.addEventListener('click', (e) => {
            e.stopPropagation();
            selectSlashCommand(cmd);
        });

        frag.appendChild(item);
    });
    DOM.slashPaletteList.appendChild(frag);

    // Auto-scroll selected item into view
    const selectedEl = DOM.slashPaletteList.children[State.selectedSlashIndex];
    if (selectedEl && selectedEl.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
}

function repositionSlashPalette() {
    if (!DOM.slashPalettePopup || DOM.slashPalettePopup.style.display === 'none') return;

    const drawerRect = DOM.cliKeysDrawer && DOM.cliKeysDrawer.style.display !== 'none'
        ? DOM.cliKeysDrawer.getBoundingClientRect()
        : DOM.chatFooter.getBoundingClientRect();

    const popupWidth = DOM.slashPalettePopup.offsetWidth || 360;
    let left = 12;
    if (DOM.btnSlashMenu) {
        const btnRect = DOM.btnSlashMenu.getBoundingClientRect();
        left = btnRect.left;
        if (left + popupWidth > window.innerWidth - 10) {
            left = window.innerWidth - popupWidth - 10;
        }
    }
    if (left < 10) left = 10;

    const bottom = Math.max(10, window.innerHeight - drawerRect.top + 6);
    DOM.slashPalettePopup.style.left = `${Math.round(left)}px`;
    DOM.slashPalettePopup.style.bottom = `${Math.round(bottom)}px`;
}

async function openSlashPalette(filterQuery = '') {
    if (!DOM.slashPalettePopup) return;

    DOM.slashPalettePopup.style.display = 'flex';
    if (DOM.slashPopupBackdrop) DOM.slashPopupBackdrop.style.display = 'block';
    if (DOM.btnSlashMenu) DOM.btnSlashMenu.classList.add('active');

    repositionSlashPalette();

    if (!State.slashCommands || State.slashCommands.length === 0) {
        renderSlashPalette(filterQuery);
        await loadSlashCommands();
    }
    renderSlashPalette(filterQuery);
    repositionSlashPalette();
}

function closeSlashPalette() {
    if (!DOM.slashPalettePopup) return;
    DOM.slashPalettePopup.style.display = 'none';
    if (DOM.slashPopupBackdrop) DOM.slashPopupBackdrop.style.display = 'none';
    if (DOM.btnSlashMenu) DOM.btnSlashMenu.classList.remove('active');
}

function isSlashPaletteOpen() {
    return DOM.slashPalettePopup && DOM.slashPalettePopup.style.display === 'flex';
}

function selectSlashCommand(cmdObj) {
    if (!cmdObj) return;
    triggerHaptic('light');

    const cmdText = cmdObj.cmd + ' ';
    setPromptText(cmdText);
    updateInputState();
    closeSlashPalette();

    DOM.promptInput.focus();
    try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(DOM.promptInput);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    } catch (e) {}

    showToast(`Comando ${cmdObj.cmd} selezionato`);
}

function initSlashMenu() {
    if (!DOM.btnSlashMenu || !DOM.slashPalettePopup) return;

    loadSlashCommands();

    DOM.btnSlashMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHaptic('light');
        if (isSlashPaletteOpen()) {
            closeSlashPalette();
        } else {
            const curText = getPromptText();
            if (!curText || !curText.startsWith('/')) {
                setPromptText('/');
                updateInputState();
            }
            openSlashPalette(getPromptText());
        }
    });

    if (DOM.slashCategoriesBar) {
        DOM.slashCategoriesBar.addEventListener('click', (e) => {
            const pill = e.target.closest('.slash-cat-pill');
            if (!pill) return;
            triggerHaptic('light');
            DOM.slashCategoriesBar.querySelectorAll('.slash-cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            State.activeSlashCat = pill.dataset.cat || 'all';
            renderSlashPalette(getPromptText());
        });
    }

    if (DOM.slashPopupBackdrop) {
        DOM.slashPopupBackdrop.addEventListener('click', closeSlashPalette);
    }
    if (DOM.btnSlashClose) {
        DOM.btnSlashClose.addEventListener('click', closeSlashPalette);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSlashPaletteOpen()) {
            closeSlashPalette();
        }
    });

    window.addEventListener('resize', () => {
        if (isSlashPaletteOpen()) repositionSlashPalette();
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (isSlashPaletteOpen()) repositionSlashPalette();
        });
    }
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
// =============================================================================
// WHATSAPP STYLE CONTACT INFO MODAL (AGENT & WORKSPACE DETAILS)
// =============================================================================
function openContactInfo() {
    triggerHaptic('light');

    const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId) || State.workspaces[0] || {};
    const wsName = activeWs.name || (activeWs.id ? `Workspace ${activeWs.id}` : 'workspace');
    
    // Find active pane
    const activePane = State.panes.find(p => p.pane_id === State.activePaneId) || State.panes[0] || {};
    const defaultName = (typeof getAgentDefaultName === 'function') ? getAgentDefaultName(activePane.agent || activePane.title || activePane.command) : 'Agente AI';
    const paneName = activePane.label || activePane.custom_name || activePane.agent || activePane.title || defaultName || 'Herdr Agent';
    const cwd = activePane.cwd || activeWs.cwd || '~';
    const branch = activePane.branch || activeWs.branch || null;
    const cmd = activePane.command || activePane.title || '-';

    if (DOM.contactHeroName) {
        DOM.contactHeroName.textContent = paneName;
    }

    const heroAvatar = DOM.bottomSheet ? DOM.bottomSheet.querySelector('.avatar-large-emoji') : null;
    if (heroAvatar && typeof getAgentIconSvg === 'function') {
        heroAvatar.innerHTML = getAgentIconSvg(activePane.agent || activePane.title || activePane.command, 46);
        const meta = getAgentMeta(activePane.agent || activePane.title || activePane.command);
        const heroAvatarWrap = DOM.bottomSheet.querySelector('.contact-hero-avatar');
        if (heroAvatarWrap) {
            heroAvatarWrap.style.background = meta.bgGradient;
            heroAvatarWrap.style.borderColor = `${meta.color}60`;
        }
    }

    if (DOM.contactHeroSubtitle) {
        const isWorking = (activePane.status === 'working' || activePane.is_running);
        DOM.contactHeroSubtitle.textContent = `${wsName} • ${isWorking ? '⚡ in esecuzione' : (activePane.status || 'online')}`;
    }
    if (DOM.contactCwdVal) {
        DOM.contactCwdVal.textContent = cwd;
    }
    if (DOM.contactBranchVal) {
        DOM.contactBranchVal.textContent = branch ? `🌿 ${branch}` : 'Nessun branch git';
    }
    if (DOM.contactPaneIdVal) {
        DOM.contactPaneIdVal.textContent = activePane.pane_id ? `#${activePane.pane_id}` : '-';
    }
    if (DOM.contactCmdVal) {
        DOM.contactCmdVal.textContent = cmd;
    }
    if (DOM.contactStatusVal) {
        const isWorking = (activePane.status === 'working' || activePane.is_running);
        DOM.contactStatusVal.textContent = isWorking ? '⚡ In esecuzione' : (activePane.status || 'Pronto');
        DOM.contactStatusVal.style.color = isWorking ? 'var(--warning)' : 'var(--success)';
    }

    // Agent & Workspace Notification Status
    const agentKey = (typeof detectAgentKey === 'function') ? detectAgentKey(activePane.agent || activePane.title || activePane.command) : 'generic';
    const updateNotifUI = () => {
        const isAgentMuted = (typeof isTargetMuted === 'function') ? (isTargetMuted('agent', agentKey) || isTargetMuted('pane', activePane.pane_id)) : false;
        const isWsMuted = (typeof isTargetMuted === 'function') ? isTargetMuted('workspace', activeWs.id) : false;

        if (DOM.btnQuickMute) {
            DOM.btnQuickMute.classList.toggle('muted', isAgentMuted);
            if (DOM.quickMuteIcon) DOM.quickMuteIcon.textContent = isAgentMuted ? '🔕' : '🔔';
            if (DOM.quickMuteLabel) DOM.quickMuteLabel.textContent = isAgentMuted ? 'Muto' : 'Notifiche';
        }
        if (DOM.contactAgentNotifVal) {
            DOM.contactAgentNotifVal.textContent = isAgentMuted ? '🔕 Disattivate (Muto)' : '🔔 Attive';
            DOM.contactAgentNotifVal.style.color = isAgentMuted ? 'var(--danger)' : 'var(--success)';
        }
        if (DOM.contactWsNotifVal) {
            DOM.contactWsNotifVal.textContent = isWsMuted ? '🔕 Disattivate (Muto)' : '🔔 Attive';
            DOM.contactWsNotifVal.style.color = isWsMuted ? 'var(--danger)' : 'var(--success)';
        }
        return { isAgentMuted, isWsMuted };
    };

    updateNotifUI();

    const toggleAgentMuteAction = async () => {
        triggerHaptic('medium');
        const { isAgentMuted } = updateNotifUI();
        const shouldEnable = isAgentMuted; // Toggle: if currently muted, enable it
        if (typeof toggleNotificationTarget === 'function') {
            await toggleNotificationTarget('agent', agentKey, shouldEnable);
        }
        updateNotifUI();
        if (typeof showToast === 'function') {
            showToast(shouldEnable ? `🔔 Notifiche attivate per ${paneName}` : `🔕 Notifiche disattivate per ${paneName}`);
        }
    };

    const toggleWsMuteAction = async () => {
        triggerHaptic('medium');
        const { isWsMuted } = updateNotifUI();
        const shouldEnable = isWsMuted;
        if (typeof toggleNotificationTarget === 'function') {
            await toggleNotificationTarget('workspace', activeWs.id, shouldEnable);
        }
        updateNotifUI();
        if (typeof showToast === 'function') {
            showToast(shouldEnable ? `🔔 Notifiche attivate per ${wsName}` : `🔕 Notifiche disattivate per ${wsName}`);
        }
    };

    if (DOM.btnQuickMute) DOM.btnQuickMute.onclick = toggleAgentMuteAction;
    if (DOM.rowToggleAgentNotif) DOM.rowToggleAgentNotif.onclick = toggleAgentMuteAction;
    if (DOM.rowToggleWsNotif) DOM.rowToggleWsNotif.onclick = toggleWsMuteAction;

    renderSheetPanes();

    DOM.sheetBackdrop.classList.add('active');
    DOM.bottomSheet.classList.add('active');
}

function closeBottomSheet() {
    DOM.sheetBackdrop.classList.remove('active');
    DOM.bottomSheet.classList.remove('active');
}

function renderSheetPanes() {
    DOM.sheetPanesList.innerHTML = '';
    if (State.panes.length === 0) {
        DOM.sheetPanesList.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 6px 0;">Nessun pannello attivo</div>';
        return;
    }

    State.panes.forEach(pane => {
        const item = document.createElement('div');
        item.className = `sheet-list-item ${pane.pane_id === State.activePaneId ? 'active' : ''}`;
        const branchBadge = pane.branch ? `<span style="color: var(--cyan); margin-left: 6px; font-size: 11px;">🌿 ${escapeHtml(pane.branch)}</span>` : '';
        const paneDisplayName = pane.label || pane.custom_name || pane.agent || pane.title || `Pannello ${pane.pane_id}`;
        const paneIcon = (typeof getAgentIconSvg === 'function') ? getAgentIconSvg(pane.agent || pane.title || pane.command, 16) : '🤖';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-flex; align-items: center;">${paneIcon}</span>
                <div>
                    <strong>${escapeHtml(paneDisplayName)}</strong>${branchBadge}
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(pane.cwd || '~')}</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <span style="font-size: 11px; text-transform: uppercase; color: var(--cyan);">${escapeHtml(pane.status || 'idle')}</span>
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
            setScreen('chat-active');
        });
        DOM.sheetPanesList.appendChild(item);
    });
}

function renderThemeChips() {
    if (!DOM.themeChipsList) return;
    const buttons = DOM.themeChipsList.querySelectorAll('.theme-chip-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === State.theme);
    });
}

function updateTheme(newTheme) {
    State.theme = newTheme;
    localStorage.setItem('herdr_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    renderThemeChips();

    // Dynamically update browser/iOS status bar meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        const bgBase = getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim();
        if (bgBase) metaTheme.setAttribute('content', bgBase);
    }

    if (State.term) {
        const t = TERMINAL_THEMES[newTheme] || TERMINAL_THEMES['cyber-dark'];
        State.term.options.theme = t;
    }
}

function updateFontSize(delta) {
    const newSize = Math.max(9, Math.min(22, State.fontSize + delta));
    State.fontSize = newSize;
    localStorage.setItem('herdr_font_size', newSize.toString());
    if (DOM.fontSizeDisplay) DOM.fontSizeDisplay.textContent = `${newSize}px`;

    if (State.term) {
        State.term.options.fontSize = newSize;
        try { State.fitAddon.fit(); } catch (e) {}
    }
}
