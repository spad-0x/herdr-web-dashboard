// =============================================================================
// SETUP EVENT LISTENERS
// =============================================================================
function setupEventListeners() {
    // Mode Switcher removed: Pure Terminal View active by default

    // WhatsApp Navigation: Back arrow navigates to Chats List
    DOM.btnWsPicker.addEventListener('click', () => {
        triggerHaptic('light');
        setScreen('chats-list');
    });

    // WhatsApp Header Contact: Click opens Agent Contact Info Sheet
    DOM.btnHeaderContact.addEventListener('click', openContactInfo);
    if (DOM.btnOpenMenu) DOM.btnOpenMenu.addEventListener('click', openContactInfo);

    // WhatsApp Chats List Screen Listeners
    if (DOM.btnNewChat) {
        DOM.btnNewChat.addEventListener('click', () => {
            triggerHaptic('medium');
            DOM.inputNewWsCwd.disabled = false;
            DOM.inputNewWsLabel.disabled = false;
            DOM.dialogNewWs.showModal();
        });
    }

    if (DOM.chatsFilterChips) {
        DOM.chatsFilterChips.addEventListener('click', (e) => {
            const item = e.target.closest('.tabbar-item');
            if (!item) return;

            triggerHaptic('light');
            DOM.chatsFilterChips.querySelectorAll('.tabbar-item').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            State.chatsFilter = item.dataset.filter || 'panes';
            renderChatsList();
        });
    }

    // Contact Card Quick Action Buttons
    if (DOM.btnQuickChat) {
        DOM.btnQuickChat.addEventListener('click', () => {
            triggerHaptic('light');
            closeBottomSheet();
            setMode('chat');
        });
    }

    if (DOM.btnQuickTerm) {
        DOM.btnQuickTerm.addEventListener('click', () => {
            triggerHaptic('light');
            closeBottomSheet();
            setMode('terminal');
        });
    }

    if (DOM.btnQuickTab) {
        DOM.btnQuickTab.addEventListener('click', () => {
            triggerHaptic('light');
            closeBottomSheet();
            DOM.btnAddTab.click();
        });
    }

    if (DOM.btnQuickSplit) {
        DOM.btnQuickSplit.addEventListener('click', () => {
            triggerHaptic('light');
            closeBottomSheet();
            DOM.btnSplitHoriz.click();
        });
    }

    // Rename Agent Actions
    if (DOM.btnEditContactName) {
        DOM.btnEditContactName.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic('light');
            const activePane = (State.panes && State.panes.find(p => p.pane_id === State.activePaneId)) || {};
            const curName = activePane.label || activePane.custom_name || activePane.agent || activePane.title;
            openRenameAgentDialog(State.activePaneId, curName, activePane.agent || activePane.title);
        });
    }

    if (DOM.btnQuickRename) {
        DOM.btnQuickRename.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic('light');
            closeBottomSheet();
            const activePane = (State.panes && State.panes.find(p => p.pane_id === State.activePaneId)) || {};
            const curName = activePane.label || activePane.custom_name || activePane.agent || activePane.title;
            openRenameAgentDialog(State.activePaneId, curName, activePane.agent || activePane.title);
        });
    }

    if (DOM.btnRenameConfirm) {
        DOM.btnRenameConfirm.addEventListener('click', () => handleRenameAgentSubmit(false));
    }
    if (DOM.btnRenameReset) {
        DOM.btnRenameReset.addEventListener('click', () => handleRenameAgentSubmit(true));
    }
    if (DOM.btnRenameCancel) {
        DOM.btnRenameCancel.addEventListener('click', closeRenameAgentDialog);
    }
    if (DOM.btnRenameDialogX) {
        DOM.btnRenameDialogX.addEventListener('click', closeRenameAgentDialog);
    }
    if (DOM.inputRenameAgentName) {
        DOM.inputRenameAgentName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleRenameAgentSubmit(false);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeRenameAgentDialog();
            }
        });
    }

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
        if (btn.id === 'btn-ctrl-menu' || btn.closest('#btn-ctrl-menu') || btn.id === 'btn-slash-menu' || btn.closest('#btn-slash-menu')) return;
        if (btn.dataset.key) {
            sendKey(btn.dataset.key);
        } else if (btn.dataset.cmd) {
            sendQuickText(btn.dataset.cmd);
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
        const text = getPromptText();
        if (text.startsWith('/')) {
            const firstWord = text.split(/\s+/)[0];
            if (!text.includes(' ') && firstWord.length > 0) {
                openSlashPalette(firstWord);
            } else if (text.includes(' ')) {
                closeSlashPalette();
            }
        } else {
            if (isSlashPaletteOpen()) {
                closeSlashPalette();
            }
        }
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
            if (State.fitAddon) {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend(true);
                } catch (e) {}
            }
            if (State.term && State.terminalAtBottom) {
                State.term.scrollToBottom();
            }
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
            if (State.fitAddon) {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend(true);
                } catch (e) {}
            }
        }, 100);
    });

    // Enter behavior: Enter creates a newline (especially on iPhone/mobile virtual keyboard).
    // The prompt is sent exclusively via the action button on the side (or Ctrl/Cmd+Enter on desktop).
    DOM.promptInput.addEventListener('keydown', (e) => {
        if (isSlashPaletteOpen()) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredSlashCommands && filteredSlashCommands.length > 0) {
                    State.selectedSlashIndex = (State.selectedSlashIndex + 1) % filteredSlashCommands.length;
                    renderSlashPalette(getPromptText());
                }
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredSlashCommands && filteredSlashCommands.length > 0) {
                    State.selectedSlashIndex = (State.selectedSlashIndex - 1 + filteredSlashCommands.length) % filteredSlashCommands.length;
                    renderSlashPalette(getPromptText());
                }
                return;
            }
            if (e.key === 'Tab' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey)) {
                if (filteredSlashCommands && filteredSlashCommands.length > 0 && filteredSlashCommands[State.selectedSlashIndex]) {
                    e.preventDefault();
                    selectSlashCommand(filteredSlashCommands[State.selectedSlashIndex]);
                    return;
                }
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSlashPalette();
                return;
            }
        }

        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            sendPrompt();
        }
    });

    DOM.btnActionMicSend.addEventListener('click', handleMicOrSendClick);

    // Image Attachments & Paste
    document.addEventListener('paste', handlePasteEvent);
    DOM.promptInput.addEventListener('paste', handlePasteEvent);

    DOM.btnAttachImage.addEventListener('click', () => {
        DOM.fileInput.click();
    });

    DOM.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
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

    if (DOM.btnFontDec) DOM.btnFontDec.addEventListener('click', () => updateFontSize(-1));
    if (DOM.btnFontInc) DOM.btnFontInc.addEventListener('click', () => updateFontSize(1));

    if (DOM.themeChipsList) {
        DOM.themeChipsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.theme-chip-btn');
            if (btn && btn.dataset.theme) {
                triggerHaptic('light');
                updateTheme(btn.dataset.theme);
            }
        });
    }

    if (DOM.btnLogout) {
        DOM.btnLogout.addEventListener('click', async () => {
            await apiCall('/api/logout');
            window.location.href = '/login';
        });
    }

    // Workspace Dialog
    if (DOM.btnCreateWs) {
        DOM.btnCreateWs.addEventListener('click', () => {
            closeBottomSheet();
            DOM.inputNewWsCwd.disabled = false;
            DOM.inputNewWsLabel.disabled = false;
            DOM.dialogNewWs.showModal();
        });
    }

    DOM.btnDialogCancel.addEventListener('click', () => {
        DOM.dialogNewWs.close();
        DOM.inputNewWsCwd.disabled = true;
        DOM.inputNewWsLabel.disabled = true;
    });

    DOM.btnDialogConfirm.addEventListener('click', async () => {
        const cwd = DOM.inputNewWsCwd.value.trim() || '~';
        const label = DOM.inputNewWsLabel.value.trim() || undefined;
        DOM.dialogNewWs.close();
        DOM.inputNewWsCwd.disabled = true;
        DOM.inputNewWsLabel.disabled = true;
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

            if (State.fitAddon) {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend();
                } catch (e) {}
            }
        }

        window.visualViewport.addEventListener('resize', adjustToVisualViewport);
        window.visualViewport.addEventListener('scroll', adjustToVisualViewport);
    }

    window.addEventListener('resize', () => {
        if (!window.visualViewport) {
            if (State.fitAddon) {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend();
                } catch (e) {}
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
            e.target.closest('.contact-sheet') ||
            e.target.closest('.chats-list-scroll') ||
            e.target.closest('.cli-keys-drawer') ||
            e.target.closest('.cli-keys-scroll') ||
            e.target.closest('.ctrl-shortcuts-popup') ||
            e.target.closest('.slash-palette-popup') ||
            e.target.closest('.slash-categories-bar') ||
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
                        if (State.fitAddon) {
                            try { State.fitAddon.fit(); } catch (e) {}
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
    // 1. Establish SSE stream immediately
    connectStateStream();

    // 2. Initialize subsystems safely
    try { updateTheme(State.theme); } catch (e) { console.error('Theme error:', e); }
    try { initTerminal(); } catch (e) { console.error('Terminal error:', e); }
    try { initSpeechRecognition(); } catch (e) { console.error('Speech error:', e); }
    try { initCtrlMenu(); } catch (e) { console.error('Ctrl menu error:', e); }
    try { initSlashMenu(); } catch (e) { console.error('Slash menu error:', e); }
    try { setupEventListeners(); } catch (e) { console.error('Listeners error:', e); }
    try { updateInputState(); } catch (e) { console.error('Input state error:', e); }

    // 3. iOS PWA Fullscreen & Safe Area Stabilization
    try {
        fixIosSafeAreaAndChinGap();
        setTimeout(fixIosSafeAreaAndChinGap, 100);
        setTimeout(fixIosSafeAreaAndChinGap, 500);
    } catch (e) { console.error('Safe area error:', e); }

    console.log('🚀 Herdr Mobile Dashboard avviato con successo.');
});
