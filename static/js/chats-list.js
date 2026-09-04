function toggleMode() {
    triggerHaptic('light');
    const newMode = State.mode === 'chat' ? 'terminal' : 'chat';
    setMode(newMode);
}

function setMode(mode) {
    State.mode = mode;
    if (mode === 'chat') {
        DOM.chatViewport.style.display = 'flex';
        DOM.terminalViewport.style.display = 'none';
        DOM.modeIcon.textContent = '💻';
        if (DOM.modeLabel) DOM.modeLabel.textContent = 'Terminale';
        DOM.btnToggleActions.style.display = 'flex';
        State.isChatUserScrolled = false;
        scrollChatToBottom(false);
    } else {
        DOM.chatViewport.style.display = 'none';
        DOM.terminalViewport.style.display = 'block';
        DOM.modeIcon.textContent = '💬';
        if (DOM.modeLabel) DOM.modeLabel.textContent = 'Chat';
        DOM.cliKeysDrawer.style.display = 'flex'; // Auto show CLI keys in terminal mode
        DOM.btnToggleActions.classList.add('active');
        if (typeof ensureWebglAddon === 'function') ensureWebglAddon();
        if (typeof initSubpixelScroll === 'function') initSubpixelScroll();
        if (typeof initTouchScroll === 'function') initTouchScroll();
        if (State.fitAddon) {
            setTimeout(() => {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend(true);
                    if (typeof ensureWebglAddon === 'function') ensureWebglAddon();
                    if (typeof initSubpixelScroll === 'function') initSubpixelScroll();
                    if (typeof initTouchScroll === 'function') initTouchScroll();
                    if (State.term && State.terminalAtBottom) {
                        State.term.scrollToBottom();
                    }
                } catch (e) {}
            }, 30);
        }
    }
}

// =============================================================================
// SCREEN NAVIGATION: WHATSAPP CHATS LIST vs ACTIVE CHAT
// =============================================================================
function setScreen(screenName) {
    State.currentScreen = screenName;
    if (screenName === 'chats-list') {
        if (DOM.screenChatsList) DOM.screenChatsList.style.display = 'flex';
        if (DOM.screenChatActive) DOM.screenChatActive.style.display = 'none';
        renderChatsList();
    } else {
        if (DOM.screenChatsList) DOM.screenChatsList.style.display = 'none';
        if (DOM.screenChatActive) DOM.screenChatActive.style.display = 'flex';
        if (State.mode === 'chat') {
            State.isChatUserScrolled = false;
            scrollChatToBottom(false);
        } else if (State.mode === 'terminal') {
            if (State.fitAddon) {
                try {
                    State.fitAddon.fit();
                    if (typeof syncTerminalSizeWithBackend === 'function') syncTerminalSizeWithBackend(true);
                } catch (e) {}
            }
            if (State.term && State.terminalAtBottom) {
                State.term.scrollToBottom();
            }
        }
    }
}

function renderChatsList() {
    if (!DOM.chatsListScroll) return;
    DOM.chatsListScroll.innerHTML = '';

    const filter = State.chatsFilter || 'panes';

    // Update Header title and new chat button based on active tab
    if (DOM.chatsViewTitle) {
        if (filter === 'settings') {
            DOM.chatsViewTitle.textContent = 'Impostazioni';
            if (DOM.btnNewChat) DOM.btnNewChat.style.display = 'none';
        } else if (filter === 'workspaces') {
            DOM.chatsViewTitle.textContent = 'Spazi';
            if (DOM.btnNewChat) DOM.btnNewChat.style.display = 'flex';
        } else {
            DOM.chatsViewTitle.textContent = 'Agenti';
            if (DOM.btnNewChat) DOM.btnNewChat.style.display = 'flex';
        }
    }

    // Sync tabbar active state
    if (DOM.chatsFilterChips) {
        DOM.chatsFilterChips.querySelectorAll('.tabbar-item').forEach(item => {
            if (item.dataset.filter) {
                item.classList.toggle('active', item.dataset.filter === filter);
            }
        });
    }


    // Dedicated App Settings Screen (Herdr Official Settings Suite)
    if (filter === 'settings') {
        renderSettingsScreen(DOM.chatsListScroll);
        return;
    }

    if (!State.workspaces || State.workspaces.length === 0) {
        DOM.chatsListScroll.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
                Nessun spazio di lavoro attivo.<br>
                Tocca <strong>+</strong> in alto per crearne uno nuovo.
            </div>
        `;
        return;
    }

    // Collect ALL panes across the active workspace and all workspaces
    const allPanes = [];
    let runningPanesCount = 0;

    State.workspaces.forEach(ws => {
        const isWsActive = (ws.id === State.activeWorkspaceId);
        const seenPaneIds = new Set();
        
        // Check ws.panes
        if (ws.panes && ws.panes.length > 0) {
            ws.panes.forEach(p => {
                if (!seenPaneIds.has(p.pane_id)) {
                    seenPaneIds.add(p.pane_id);
                    allPanes.push({
                        ...p,
                        workspace_id: ws.id,
                        ws_name: ws.name || `Workspace ${ws.id}`,
                        is_active_ws: isWsActive
                    });
                    if (p.is_running || p.status === 'working') runningPanesCount++;
                }
            });
        }
        
        // Also check ws.tabs[].panes
        if (ws.tabs) {
            ws.tabs.forEach(tab => {
                if (tab.panes) {
                    tab.panes.forEach(p => {
                        if (!seenPaneIds.has(p.pane_id)) {
                            seenPaneIds.add(p.pane_id);
                            allPanes.push({
                                ...p,
                                tab_id: tab.tab_id,
                                tab_name: tab.name,
                                workspace_id: ws.id,
                                ws_name: ws.name || `Workspace ${ws.id}`,
                                is_active_ws: isWsActive
                            });
                            if (p.is_running || p.status === 'working') runningPanesCount++;
                        }
                    });
                }
            });
        }
    });

    // Filter to real AI agents only (exclude raw shell terminals)
    const agentPanes = allPanes.filter(p => {
        if (p.is_agent === true) return true;
        if (p.is_agent === false) return false;
        if (p.agent) return true;
        if (p.status === 'working' || p.status === 'blocked' || p.waiting_confirm) return true;
        const title = (p.command || p.title || '').toLowerCase().trim();
        if (['zsh', 'bash', 'fish', 'sh', 'login', '-zsh', '-bash'].includes(title)) return false;
        if (title.includes('@') && title.includes(':')) return false;
        return ['agy', 'claude', 'codex', 'gemini', 'cursor', 'aider', 'openhands'].some(kw => title.includes(kw));
    });
    const runningAgentsCount = agentPanes.filter(p => p.is_running || p.status === 'working').length;

    // Update badge in bottom tab bar (showing running AGENTS count)
    if (DOM.badgeAgentCount) {
        if (runningAgentsCount > 0) {
            DOM.badgeAgentCount.textContent = runningAgentsCount;
            DOM.badgeAgentCount.style.display = 'flex';
        } else {
            DOM.badgeAgentCount.style.display = 'none';
        }
    }

    // 1. Workspaces as WhatsApp Chats (Tutti / Spazi)
    if (filter === 'all' || filter === 'workspaces') {
        State.workspaces.forEach(ws => {
            const isActive = (ws.id === State.activeWorkspaceId);
            const totalTabs = (ws.tabs && ws.tabs.length) ? ws.tabs.length : 1;
            
            let totalPanes = 0;
            let isRunning = false;
            let lastCommand = '';
            if (ws.tabs) {
                ws.tabs.forEach(tab => {
                    if (tab.panes) {
                        totalPanes += tab.panes.length;
                        tab.panes.forEach(p => {
                            if (p.is_running || p.status === 'working') isRunning = true;
                            if (p.command && !lastCommand) lastCommand = p.command;
                        });
                    }
                });
            }

            const item = document.createElement('div');
            item.className = `chat-item-row ${isActive ? 'active' : ''}`;
            
            let statusSnippet = isRunning ? '⚡ In esecuzione...' : (ws.cwd ? ws.cwd : 'Pronto');
            if (lastCommand) statusSnippet = `▶ ${lastCommand}`;

            item.innerHTML = `
                <div class="chat-item-avatar">
                    <span>📁</span>
                    ${isActive ? '<span class="chat-item-online-dot"></span>' : ''}
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-top">
                        <span class="chat-item-title">${escapeHtml(ws.name || `Workspace ${ws.id}`)}</span>
                        <span class="chat-item-time">Oggi</span>
                    </div>
                    <div class="chat-item-bottom">
                        <span class="chat-item-preview">${escapeHtml(statusSnippet)}</span>
                        <span class="chat-item-badge">${totalTabs} tab</span>
                    </div>
                </div>
            `;

            item.addEventListener('click', async () => {
                triggerHaptic('light');
                if (ws.id !== State.activeWorkspaceId) {
                    State.activeWorkspaceId = ws.id;
                    await apiCall('/api/workspace/focus', { workspace_id: ws.id });
                }
                setScreen('chat-active');
            });

            DOM.chatsListScroll.appendChild(item);
        });
    }

    // 2. Agents List (ONLY real AI agents)
    if (filter === 'panes') {
        if (agentPanes.length === 0) {
            DOM.chatsListScroll.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
                    Nessun agente AI attivo al momento.<br>
                    Tocca <strong>Spazi</strong> per visualizzare i tuoi terminali o crearne uno nuovo.
                </div>
            `;
            return;
        }

        // Sort: active agent first, then active workspace agents, then others
        agentPanes.sort((a, b) => {
            if (a.pane_id === State.activePaneId) return -1;
            if (b.pane_id === State.activePaneId) return 1;
            if (a.is_active_ws && !b.is_active_ws) return -1;
            if (!a.is_active_ws && b.is_active_ws) return 1;
            return 0;
        });

        agentPanes.forEach(pane => {
            const isActive = (pane.pane_id === State.activePaneId);
            const isWorking = (pane.status === 'working' || pane.is_running);
            const isBlocked = (pane.status === 'blocked' || pane.waiting_confirm);

            const item = document.createElement('div');
            item.className = `chat-item-row ${isActive ? 'active' : ''}`;
            
            let statusBadge = isWorking ? '⚡ lavora' : (isBlocked ? '⚠️ conferma' : 'pronto');
            let preview = pane.clean_text ? pane.clean_text.slice(-60).trim() : (isWorking ? '⚡ In esecuzione...' : 'Pronto');
            if (pane.command) preview = `▶ ${pane.command}`;

            item.innerHTML = `
                <div class="chat-item-avatar">
                    <span>${isWorking ? '⚡' : '🤖'}</span>
                    ${isActive ? '<span class="chat-item-online-dot"></span>' : ''}
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-top">
                        <span class="chat-item-title">${escapeHtml(pane.agent || pane.title || `Agente #${pane.pane_id}`)}</span>
                        <span class="chat-item-time">${escapeHtml(pane.ws_name || 'Spazio')}</span>
                    </div>
                    <div class="chat-item-bottom">
                        <span class="chat-item-preview">${escapeHtml(preview)}</span>
                        <span class="chat-item-badge">${escapeHtml(statusBadge)}</span>
                    </div>
                </div>
            `;

            item.addEventListener('click', async () => {
                triggerHaptic('light');
                if (pane.workspace_id && pane.workspace_id !== State.activeWorkspaceId) {
                    State.activeWorkspaceId = pane.workspace_id;
                    await apiCall('/api/workspace/focus', { workspace_id: pane.workspace_id });
                }
                if (pane.tab_id && pane.tab_id !== State.activeTabId) {
                    State.activeTabId = pane.tab_id;
                    await apiCall('/api/tab/focus', { tab_id: pane.tab_id });
                }
                State.activePaneId = pane.pane_id;
                await apiCall('/api/pane/focus', { pane_id: pane.pane_id });
                setScreen('chat-active');
                if (State.mode === 'terminal' && typeof syncTerminalSizeWithBackend === 'function') {
                    syncTerminalSizeWithBackend(true);
                }
            });

            DOM.chatsListScroll.appendChild(item);
        });
    }
}
