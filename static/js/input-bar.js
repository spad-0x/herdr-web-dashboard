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
// =============================================================================
// WHATSAPP STYLE CONTACT INFO MODAL (AGENT & WORKSPACE DETAILS)
// =============================================================================
function openContactInfo() {
    triggerHaptic('light');

    const activeWs = State.workspaces.find(w => w.id === State.activeWorkspaceId) || State.workspaces[0] || {};
    const wsName = activeWs.name || (activeWs.id ? `Workspace ${activeWs.id}` : 'workspace');
    
    // Find active pane
    const activePane = State.panes.find(p => p.pane_id === State.activePaneId) || State.panes[0] || {};
    const paneName = activePane.agent || activePane.title || 'Herdr Agent';
    const cwd = activePane.cwd || activeWs.cwd || '~';
    const branch = activePane.branch || activeWs.branch || null;
    const cmd = activePane.command || activePane.title || '-';

    if (DOM.contactHeroName) {
        DOM.contactHeroName.textContent = paneName;
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
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(pane.agent || pane.title || `Pannello ${pane.pane_id}`)}</strong>${branchBadge}
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${escapeHtml(pane.cwd || '~')}</div>
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
