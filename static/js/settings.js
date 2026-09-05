// =============================================================================
// HERDR SETTINGS, PLUGINS & INTEGRATIONS SUITE
// =============================================================================

function renderSettingsScreen(container) {
    if (!container) return;
    const settingsWrap = document.createElement('div');
    settingsWrap.className = 'settings-page-wrapper';
        
        // Show loading skeleton while fetching fresh config
        settingsWrap.innerHTML = `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
                Caricamento impostazioni e moduli di Herdr...
            </div>
        `;
        container.appendChild(settingsWrap);

        // Fetch fresh config, integrations, and plugins
        Promise.all([
            apiCall('/api/config', null, 'GET'),
            apiCall('/api/integrations', null, 'GET'),
            apiCall('/api/plugins', null, 'GET')
        ]).then(([cfgRes, intRes, plugRes]) => {
            if (cfgRes && cfgRes.config) State.herdrConfig = cfgRes.config;
            if (cfgRes && cfgRes.supported_themes) State.supportedThemes = cfgRes.supported_themes;
            if (intRes && intRes.integrations) State.integrations = intRes.integrations;
            if (plugRes && plugRes.plugins) State.plugins = plugRes.plugins;

            const cfg = State.herdrConfig || {};
            const ui = cfg.ui || {};
            const themeCfg = cfg.theme || {};
            const soundCfg = ui.sound || cfg.sound || {};
            const toastCfg = ui.toast || cfg.toast || {};

            const curTheme = themeCfg.name || State.theme || 'gruvbox';
            const curIndicators = ui.status_indicators || 'dots';
            const curSort = ui.agent_panel_sort || 'spaces';
            const curSound = (soundCfg.enabled !== false);
            const curToast = toastCfg.delivery || 'off';
            const curBorders = (ui.pane_borders !== false);
            const curOuterBorders = (ui.pane_outer_borders !== false);
            const curScrollbars = (ui.pane_scrollbars !== false);
            const curGaps = (ui.pane_gaps !== false);
            const curAgentLabels = (ui.show_agent_labels_on_pane_borders === true);

            settingsWrap.innerHTML = `
                <!-- App Hero Card -->
                <div class="settings-hero-card">
                    <div class="settings-hero-icon">🐏</div>
                    <div class="settings-hero-info">
                        <div class="settings-hero-title">Herdr Configuration</div>
                        <div class="settings-hero-subtitle">${cfgRes && cfgRes.config_path ? cfgRes.config_path : '~/.config/herdr/config.toml'}</div>
                    </div>
                </div>

                <!-- 1. THEMES (Ufficiali di Herdr) -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Temi Ufficiali di Herdr (theme)</div>
                    <div class="settings-item-row column">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🎨 Palette Colori Globale</span>
                            <span class="settings-item-desc">Applica sia alla dashboard web che al demone Herdr server</span>
                        </div>
                        <div class="theme-chips-list" id="settings-theme-chips" style="width: 100%;">
                            ${State.supportedThemes.map(t => `
                                <button type="button" class="theme-chip-btn ${t === State.theme ? 'active' : ''}" data-theme="${t}">
                                    ${t.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🌓 Auto Switch Chiaro/Scuro</span>
                            <span class="settings-item-desc">Segui l'aspetto del sistema operativo / terminale host</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-theme-auto-switch" ${themeCfg.auto_switch ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <!-- 2. STATUS INDICATORS & LABELS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Indicatori & Etichette (indicators & labels)</div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🚥 Stile Indicatori Agenti</span>
                            <span class="settings-item-desc">Puntini colorati compatti o glifi iconici dedicati</span>
                        </div>
                        <select class="settings-select" id="cfg-status-indicators">
                            <option value="dots" ${curIndicators === 'dots' ? 'selected' : ''}>Dots (Pallini)</option>
                            <option value="symbols" ${curIndicators === 'symbols' ? 'selected' : ''}>Symbols (Glifi)</option>
                        </select>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🏷️ Etichette Agenti sui Bordi</span>
                            <span class="settings-item-desc">Mostra nome agente nel bordo del pannello (show_agent_labels)</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-show-agent-labels" ${curAgentLabels ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">📊 Ordinamento Pannello Agenti</span>
                            <span class="settings-item-desc">Raggruppa per spazio o per coda di priorità</span>
                        </div>
                        <select class="settings-select" id="cfg-agent-panel-sort">
                            <option value="spaces" ${curSort === 'spaces' ? 'selected' : ''}>Per Spazio (spaces)</option>
                            <option value="priority" ${curSort === 'priority' ? 'selected' : ''}>Per Priorità (priority)</option>
                        </select>
                    </div>
                </div>

                <!-- 3. SOUND & TOASTS NOTIFICATIONS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Suoni & Notifiche (sound & toasts)</div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">📲 Notifiche Push di Sistema (Web Push)</span>
                            <span class="settings-item-desc" id="push-perm-status-desc">Ricevi avvisi su iPhone/PC quando un agente finisce o chiede conferma</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button class="settings-install-btn" id="btn-test-push" style="display: none; padding: 6px 12px; font-size: 11px;">Test Notifica</button>
                            <label class="toggle-switch">
                                <input type="checkbox" id="cfg-push-notifications">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🔊 Suoni Agenti in Background</span>
                            <span class="settings-item-desc">Riproduci audio quando un agente termina o richiede attenzione</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-sound-enabled" ${curSound ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🔔 Recapito Notifiche Toast</span>
                            <span class="settings-item-desc">Modalità popup per eventi e modifiche di stato</span>
                        </div>
                        <select class="settings-select" id="cfg-toast-delivery">
                            <option value="off" ${curToast === 'off' ? 'selected' : ''}>Disattivato (off)</option>
                            <option value="herdr" ${curToast === 'herdr' ? 'selected' : ''}>In-App (herdr)</option>
                            <option value="terminal" ${curToast === 'terminal' ? 'selected' : ''}>Terminale (terminal)</option>
                            <option value="system" ${curToast === 'system' ? 'selected' : ''}>Sistema OS (system)</option>
                        </select>
                    </div>

                    <!-- Filtro Notifiche per Spazio -->
                    <div class="settings-subsection" style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                            📁 Notifiche per Spazio di Lavoro
                        </div>
                        <div id="settings-workspaces-notif-list" style="display: flex; flex-direction: column; gap: 8px;">
                            <!-- Popolato dinamicamente da JS -->
                        </div>
                    </div>

                    <!-- Filtro Notifiche per Singolo Agente -->
                    <div class="settings-subsection" style="margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
                        <div style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                            🤖 Notifiche per Singolo Agente AI
                        </div>
                        <div id="settings-agents-notif-list" style="display: flex; flex-direction: column; gap: 8px;">
                            <!-- Popolato dinamicamente da JS -->
                        </div>
                    </div>
                </div>

                <!-- 4. PANE & BORDERS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Struttura Pannelli & Terminale (pane)</div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🔲 Bordi dei Pannelli Split</span>
                            <span class="settings-item-desc">Disegna linee di divisione visiva tra i terminali</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-pane-borders" ${curBorders ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🖼️ Bordo Esterno Completo</span>
                            <span class="settings-item-desc">Cornice lungo il perimetro esterno (pane_outer_borders)</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-pane-outer-borders" ${curOuterBorders ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">📏 Spaziatura Pannelli (Gaps)</span>
                            <span class="settings-item-desc">Separazione visiva tra pannelli divisi (pane_gaps)</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-pane-gaps" ${curGaps ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">📜 Barre di Scorrimento</span>
                            <span class="settings-item-desc">Barra scroll interattiva nei pannelli (pane_scrollbars)</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="cfg-pane-scrollbars" ${curScrollbars ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="settings-item-row">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🔤 Dimensione Font Dashboard</span>
                            <span class="settings-item-desc">Grandezza caratteri per il terminale xterm</span>
                        </div>
                        <div class="font-controls">
                            <button class="btn-control-chip" id="settings-font-dec">A-</button>
                            <span class="font-size-display" id="settings-font-display">${State.fontSize}px</span>
                            <button class="btn-control-chip" id="settings-font-inc">A+</button>
                        </div>
                    </div>
                </div>

                <!-- 4.5. CUSTOM COMMANDS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Comandi Personalizzati Rapidi</div>
                    <div class="settings-item-row column">
                        <div class="settings-item-left" style="margin-bottom: 6px;">
                            <span class="settings-item-label">🛠️ Aggiungi Scorciatoia</span>
                            <span class="settings-item-desc">I comandi saranno disponibili nel pulsante "Custom" della barra input</span>
                        </div>
                        <div class="plugin-install-form" style="display: flex; gap: 6px;">
                            <input type="text" class="plugin-input-field" id="input-custom-cmd-label" placeholder="Nome (es. Log)" style="flex: 1;" />
                            <input type="text" class="plugin-input-field" id="input-custom-cmd-val" placeholder="Comando (es. git log)" style="flex: 2;" />
                            <button class="btn-plugin-install" id="btn-custom-cmd-add">Aggiungi</button>
                        </div>
                    </div>
                    <div id="custom-cmds-list-container" style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
                    </div>
                </div>

                <!-- 5. AGENT INTEGRATIONS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Integrazioni Agenti Ufficiali (integrations)</div>
                    ${State.integrations.length === 0 ? `
                        <div class="settings-item-row">
                            <span class="settings-item-desc">Nessuna integrazione rilevata</span>
                        </div>
                    ` : State.integrations.map(agent => `
                        <div class="settings-item-row">
                            <div class="settings-item-left">
                                <span class="settings-item-label">${agent.installed ? '🟢' : '⚪'} ${agent.name}</span>
                                <span class="settings-item-desc">${escapeHtml(agent.path || agent.status_text)}</span>
                            </div>
                            <div class="integration-item-meta">
                                ${agent.installed ? `
                                    <button class="btn-action-sm uninstall btn-integration-toggle" data-action="uninstall" data-agent="${agent.name}">Disinstalla</button>
                                ` : `
                                    <button class="btn-action-sm install btn-integration-toggle" data-action="install" data-agent="${agent.name}">Installa</button>
                                `}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- 6. WORKFLOW PLUGINS -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Plugin di Herdr (herdr plugin)</div>
                    <div class="settings-item-row column">
                        <div class="settings-item-left">
                            <span class="settings-item-label">🔌 Installa Nuovo Plugin da GitHub</span>
                            <span class="settings-item-desc">Inserisci il repository nel formato <code style="color:var(--cyan)">owner/repo</code></span>
                        </div>
                        <div class="plugin-install-form">
                            <input type="text" class="plugin-input-field" id="input-plugin-repo" placeholder="es. herdr/plugin-git-worktree" />
                            <button class="btn-plugin-install" id="btn-plugin-install-submit">Installa</button>
                        </div>
                    </div>
                    ${State.plugins.length === 0 ? `
                        <div class="settings-item-row">
                            <span class="settings-item-desc" style="padding: 4px 0;">Nessun plugin esterno installato. I plugin permettono di aggiungere comandi, viste e azioni rapide a Herdr.</span>
                        </div>
                    ` : State.plugins.map(p => `
                        <div class="settings-item-row">
                            <div class="settings-item-left">
                                <span class="settings-item-label">📦 ${escapeHtml(p)}</span>
                            </div>
                            <button class="btn-action-sm uninstall btn-plugin-uninstall" data-plugin="${escapeHtml(p)}">Rimuovi</button>
                        </div>
                    `).join('')}
                </div>

                <!-- 7. SYSTEM & SOCKET INFO -->
                <div class="settings-section-card">
                    <div class="settings-section-title">Demone Herdr & Connessione</div>
                    <div class="settings-item-row">
                        <span class="settings-item-label">Versione Demone</span>
                        <span class="settings-item-val">v${State.version || '0.8.2'}</span>
                    </div>
                    <div class="settings-item-row">
                        <span class="settings-item-label">Socket Unix</span>
                        <span class="settings-item-val mono">${State.socketPath || '~/.config/herdr/herdr.sock'}</span>
                    </div>
                    <div class="settings-item-row">
                        <span class="settings-item-label">Stato Connessione</span>
                        <span class="settings-item-val highlight" style="color: var(--success);">🟢 Connesso</span>
                    </div>
                </div>

                <!-- 8. USER SESSION -->
                <div class="settings-section-card" style="padding: 12px; background: transparent; border: none;">
                    <button class="btn-app-logout" id="btn-settings-logout">Esci dalla sessione</button>
                </div>
            `;

            // Helper to post config changes
            async function saveConfigDelta(delta) {
                triggerHaptic('light');
                const res = await apiCall('/api/config/update', { config: delta });
                if (res && res.success) {
                    showToast('✓ Impostazioni Herdr applicate');
                } else {
                    showToast('Errore salvataggio impostazioni');
                }
            }

            // Theme chip buttons
            settingsWrap.querySelectorAll('.theme-chip-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const chosenTheme = btn.dataset.theme;
                    updateTheme(chosenTheme);
                    settingsWrap.querySelectorAll('.theme-chip-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    saveConfigDelta({ theme: { name: chosenTheme } });
                });
            });

            // Auto-switch theme toggle
            const autoSwitchEl = settingsWrap.querySelector('#cfg-theme-auto-switch');
            if (autoSwitchEl) {
                autoSwitchEl.addEventListener('change', (e) => {
                    saveConfigDelta({ theme: { auto_switch: e.target.checked } });
                });
            }

            // Indicators
            const indEl = settingsWrap.querySelector('#cfg-status-indicators');
            if (indEl) {
                indEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { status_indicators: e.target.value } });
                });
            }

            // Show agent labels
            const labelsEl = settingsWrap.querySelector('#cfg-show-agent-labels');
            if (labelsEl) {
                labelsEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { show_agent_labels_on_pane_borders: e.target.checked } });
                });
            }

            // Panel sort
            const sortEl = settingsWrap.querySelector('#cfg-agent-panel-sort');
            if (sortEl) {
                sortEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { agent_panel_sort: e.target.value } });
                });
            }

            // Push Notifications Toggle & Test
            const pushEl = settingsWrap.querySelector('#cfg-push-notifications');
            const testPushBtn = settingsWrap.querySelector('#btn-test-push');
            const pushDesc = settingsWrap.querySelector('#push-perm-status-desc');

            if (pushEl) {
                const isPushSupported = ('Notification' in window);
                const notifCfg = State.notificationSettings || window.HerdrNotificationSettings || {};
                const localPushPref = localStorage.getItem('herdr_push_enabled');
                
                // Real active status: Notification API granted AND global setting enabled AND localStorage not 'false'
                const isPushActive = isPushSupported && 
                                     (Notification.permission === 'granted') && 
                                     (notifCfg.enabled !== false) && 
                                     (localPushPref === 'true');

                if (!isPushSupported) {
                    pushEl.disabled = true;
                    if (pushDesc) pushDesc.textContent = 'Notifiche non supportate da questo browser (installa come PWA per iOS).';
                    if (testPushBtn) testPushBtn.style.display = 'none';
                } else {
                    const currentPerm = Notification.permission;
                    pushEl.checked = isPushActive;

                    if (currentPerm === 'denied') {
                        pushEl.checked = false;
                        if (testPushBtn) testPushBtn.style.display = 'none';
                        if (pushDesc) pushDesc.textContent = 'Permesso notifiche bloccato nelle impostazioni di sistema del browser.';
                    } else if (isPushActive) {
                        if (testPushBtn) testPushBtn.style.display = 'inline-block';
                        if (pushDesc) pushDesc.textContent = 'Notifiche attive. Riceverai avvisi quando un agente termina o aspetta conferma.';
                    } else {
                        if (testPushBtn) testPushBtn.style.display = 'none';
                        if (pushDesc) pushDesc.textContent = 'Notifiche push disattivate.';
                    }

                    pushEl.addEventListener('change', async (e) => {
                        if (e.target.checked) {
                            triggerHaptic('medium');
                            if (pushDesc) pushDesc.textContent = 'Attivazione notifiche in corso...';
                            const success = await window.subscribeUserToPush();
                            if (success) {
                                pushEl.checked = true;
                                if (testPushBtn) testPushBtn.style.display = 'inline-block';
                                if (pushDesc) pushDesc.textContent = 'Notifiche push attivate! Riceverai avvisi anche a schermo bloccato.';
                                if (window.triggerServerPushTest) {
                                    window.triggerServerPushTest();
                                }
                                showToast('🔔 Notifiche push abilitate');
                                renderSettingsScreen(settingsWrap.parentElement);
                            } else {
                                pushEl.checked = false;
                                if (testPushBtn) testPushBtn.style.display = 'none';
                                if (pushDesc) pushDesc.textContent = 'Permesso notifiche non concesso o non supportato.';
                                alert('Permesso notifiche non concesso o non supportato. Se sei su iPhone, assicurati che la pagina sia stata aggiunta alla Home e che le notifiche per la Web App siano consentite in Impostazioni iOS.');
                            }
                        } else {
                            triggerHaptic('medium');
                            if (pushDesc) pushDesc.textContent = 'Disattivazione notifiche...';
                            await window.unsubscribeUserFromPush();
                            pushEl.checked = false;
                            if (testPushBtn) testPushBtn.style.display = 'none';
                            if (pushDesc) pushDesc.textContent = 'Notifiche push disattivate.';
                            showToast('🔕 Notifiche push disattivate');
                            renderSettingsScreen(settingsWrap.parentElement);
                        }
                    });

                    if (testPushBtn) {
                        testPushBtn.addEventListener('click', async () => {
                            testPushBtn.textContent = 'Invio in corso...';
                            if (window.triggerServerPushTest) {
                                await window.triggerServerPushTest();
                            }
                            testPushBtn.textContent = 'Test Notifica';
                        });
                    }
                }
            }

            // Populate Workspace Notifications List
            const wsListEl = settingsWrap.querySelector('#settings-workspaces-notif-list');
            if (wsListEl) {
                wsListEl.innerHTML = '';
                if (!State.workspaces || State.workspaces.length === 0) {
                    wsListEl.innerHTML = '<div style="font-size: 12px; color: var(--text-muted); padding: 4px 0;">Nessun spazio attivo al momento</div>';
                } else {
                    State.workspaces.forEach(ws => {
                        const isMuted = (typeof isTargetMuted === 'function') && isTargetMuted('workspace', ws.id);
                        const row = document.createElement('div');
                        row.className = 'settings-item-row';
                        row.style.padding = '6px 0';
                        row.innerHTML = `
                            <div class="settings-item-left">
                                <span class="settings-item-label" style="font-size: 13px;">📁 ${escapeHtml(ws.name || `Workspace ${ws.id}`)}</span>
                                <span class="settings-item-desc">${isMuted ? '<span style="color:var(--danger); font-weight:600;">🔕 Disattivato</span>' : '<span style="color:var(--success); font-weight:600;">🔔 Attivo</span>'}</span>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" class="cfg-ws-notif-toggle" data-ws-id="${ws.id}" ${!isMuted ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        `;
                        row.querySelector('.cfg-ws-notif-toggle').addEventListener('change', async (e) => {
                            triggerHaptic('light');
                            await window.toggleNotificationTarget('workspace', ws.id, e.target.checked);
                            showToast(e.target.checked ? `🔔 Notifiche attivate per ${ws.name || 'Spazio'}` : `🔕 Notifiche disattivate per ${ws.name || 'Spazio'}`);
                            renderSettingsScreen(settingsWrap.parentElement);
                        });
                        wsListEl.appendChild(row);
                    });
                }
            }

            // Populate Agent Notifications List
            const agentListEl = settingsWrap.querySelector('#settings-agents-notif-list');
            if (agentListEl && typeof AGENT_METADATA !== 'undefined') {
                agentListEl.innerHTML = '';
                const agentKeys = Object.keys(AGENT_METADATA).filter(k => k !== 'generic');
                agentKeys.forEach(k => {
                    const meta = AGENT_METADATA[k];
                    const isMuted = (typeof isTargetMuted === 'function') && isTargetMuted('agent', k);
                    const iconSvg = (typeof getAgentIconSvg === 'function') ? getAgentIconSvg(k, 18) : '🤖';
                    const row = document.createElement('div');
                    row.className = 'settings-item-row';
                    row.style.padding = '6px 0';
                    row.innerHTML = `
                        <div class="settings-item-left" style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: ${meta.bgGradient}; border: 1px solid ${meta.color}40; flex-shrink: 0;">
                                ${iconSvg}
                            </div>
                            <div>
                                <span class="settings-item-label" style="font-size: 13px;">${escapeHtml(meta.name)}</span>
                                <span class="settings-item-desc">${isMuted ? '<span style="color:var(--danger); font-weight:600;">🔕 Disattivato</span>' : '<span style="color:var(--success); font-weight:600;">🔔 Attivo</span>'}</span>
                            </div>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="cfg-agent-notif-toggle" data-agent-key="${k}" ${!isMuted ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    `;
                    row.querySelector('.cfg-agent-notif-toggle').addEventListener('change', async (e) => {
                        triggerHaptic('light');
                        await window.toggleNotificationTarget('agent', k, e.target.checked);
                        showToast(e.target.checked ? `🔔 Notifiche attivate per ${meta.name}` : `🔕 Notifiche disattivate per ${meta.name}`);
                        renderSettingsScreen(settingsWrap.parentElement);
                    });
                    agentListEl.appendChild(row);
                });
            }

            // Sound
            const soundEl = settingsWrap.querySelector('#cfg-sound-enabled');
            if (soundEl) {
                soundEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { sound: { enabled: e.target.checked } } });
                });
            }

            // Toast
            const toastEl = settingsWrap.querySelector('#cfg-toast-delivery');
            if (toastEl) {
                toastEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { toast: { delivery: e.target.value } } });
                });
            }

            // Pane Borders
            const pbEl = settingsWrap.querySelector('#cfg-pane-borders');
            if (pbEl) {
                pbEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { pane_borders: e.target.checked } });
                });
            }

            // Outer Borders
            const pobEl = settingsWrap.querySelector('#cfg-pane-outer-borders');
            if (pobEl) {
                pobEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { pane_outer_borders: e.target.checked } });
                });
            }

            // Gaps
            const pgEl = settingsWrap.querySelector('#cfg-pane-gaps');
            if (pgEl) {
                pgEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { pane_gaps: e.target.checked } });
                });
            }

            // Scrollbars
            const psEl = settingsWrap.querySelector('#cfg-pane-scrollbars');
            if (psEl) {
                psEl.addEventListener('change', (e) => {
                    saveConfigDelta({ ui: { pane_scrollbars: e.target.checked } });
                });
            }

            // Font Controls
            const fontDecBtn = settingsWrap.querySelector('#settings-font-dec');
            const fontIncBtn = settingsWrap.querySelector('#settings-font-inc');
            const fontDisplay = settingsWrap.querySelector('#settings-font-display');
            if (fontDecBtn) fontDecBtn.addEventListener('click', () => {
                updateFontSize(-1);
                if (fontDisplay) fontDisplay.textContent = `${State.fontSize}px`;
            });
            if (fontIncBtn) fontIncBtn.addEventListener('click', () => {
                updateFontSize(1);
                if (fontDisplay) fontDisplay.textContent = `${State.fontSize}px`;
            });

            // Integrations Install / Uninstall
            settingsWrap.querySelectorAll('.btn-integration-toggle').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const agentName = btn.dataset.agent;
                    const action = btn.dataset.action;
                    btn.disabled = true;
                    btn.textContent = '...';
                    triggerHaptic('medium');
                    const endpoint = action === 'install' ? '/api/integration/install' : '/api/integration/uninstall';
                    const res = await apiCall(endpoint, { name: agentName });
                    if (res && res.success) {
                        showToast(`✓ Integrazione ${agentName} ${action === 'install' ? 'installata' : 'rimossa'}`);
                        renderChatsList(); // Re-render
                    } else {
                        const errMsg = (res && (res.error || res.output)) ? (res.error || res.output) : 'comando fallito';
                        showToast(`Errore: ${errMsg}`);
                        btn.disabled = false;
                        btn.textContent = action === 'install' ? 'Installa' : 'Disinstalla';
                    }
                });
            });

            // Plugin Install
            const btnPluginInstall = settingsWrap.querySelector('#btn-plugin-install-submit');
            const inputPluginRepo = settingsWrap.querySelector('#input-plugin-repo');
            if (btnPluginInstall && inputPluginRepo) {
                btnPluginInstall.addEventListener('click', async () => {
                    const repo = inputPluginRepo.value.trim();
                    if (!repo) {
                        showToast('Inserisci owner/repo di GitHub');
                        return;
                    }
                    btnPluginInstall.disabled = true;
                    btnPluginInstall.textContent = 'Installazione...';
                    triggerHaptic('medium');
                    const res = await apiCall('/api/plugin/install', { repo: repo });
                    if (res && res.success) {
                        showToast(`✓ Plugin ${repo} installato`);
                        renderChatsList();
                    } else {
                        showToast(`Errore installazione plugin: ${res && res.error ? res.error : 'comando fallito'}`);
                        btnPluginInstall.disabled = false;
                        btnPluginInstall.textContent = 'Installa';
                    }
                });
            }

            // Plugin Uninstall
            settingsWrap.querySelectorAll('.btn-plugin-uninstall').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const plugName = btn.dataset.plugin;
                    if (!confirm(`Vuoi rimuovere il plugin ${plugName}?`)) return;
                    btn.disabled = true;
                    triggerHaptic('medium');
                    const res = await apiCall('/api/plugin/uninstall', { name: plugName });
                    if (res && res.success) {
                        showToast(`✓ Plugin ${plugName} rimosso`);
                        renderChatsList();
                    } else {
                        showToast(`Errore rimozione plugin`);
                        btn.disabled = false;
                    }
                });
            });

            // Logout

            // Custom Commands Logic
            function renderCustomCommandsList() {
                const listContainer = settingsWrap.querySelector('#custom-cmds-list-container');
                if (!listContainer) return;
                
                let cmds = [];
                try {
                    cmds = JSON.parse(localStorage.getItem('herdr_custom_commands') || '[]');
                } catch(e) {}
                
                if (cmds.length === 0) {
                    listContainer.innerHTML = '<span class="settings-item-desc">Nessun comando personalizzato.</span>';
                    return;
                }
                
                listContainer.innerHTML = '';
                cmds.forEach((cmd, idx) => {
                    const row = document.createElement('div');
                    row.className = 'settings-item-row';
                    row.style.padding = '8px 12px';
                    row.innerHTML = `
                        <div class="settings-item-left" style="overflow: hidden;">
                            <span class="settings-item-label" style="font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(cmd.label)}</span>
                            <span class="settings-item-desc mono" style="font-size: 11px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${escapeHtml(cmd.command)}</span>
                        </div>
                        <button class="btn-action-sm uninstall btn-remove-custom-cmd" data-idx="${idx}" style="flex-shrink: 0;">Rimuovi</button>
                    `;
                    listContainer.appendChild(row);
                });
                
                listContainer.querySelectorAll('.btn-remove-custom-cmd').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.dataset.idx, 10);
                        cmds.splice(idx, 1);
                        localStorage.setItem('herdr_custom_commands', JSON.stringify(cmds));
                        renderCustomCommandsList();
                        showToast('Comando rimosso');
                    });
                });
            }
            
            const btnAddCustom = settingsWrap.querySelector('#btn-custom-cmd-add');
            if (btnAddCustom) {
                btnAddCustom.addEventListener('click', () => {
                    const lblInput = settingsWrap.querySelector('#input-custom-cmd-label');
                    const valInput = settingsWrap.querySelector('#input-custom-cmd-val');
                    const label = lblInput.value.trim();
                    const command = valInput.value.trim();
                    
                    if (!label || !command) {
                        showToast('Compila nome e comando');
                        return;
                    }
                    
                    let cmds = [];
                    try {
                        cmds = JSON.parse(localStorage.getItem('herdr_custom_commands') || '[]');
                    } catch(e) {}
                    
                    cmds.push({ label, command });
                    localStorage.setItem('herdr_custom_commands', JSON.stringify(cmds));
                    
                    lblInput.value = '';
                    valInput.value = '';
                    renderCustomCommandsList();
                    showToast('Comando aggiunto');
                    triggerHaptic('light');
                });
            }
            
            renderCustomCommandsList();
            const logoutBtn = settingsWrap.querySelector('#btn-settings-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    triggerHaptic('medium');
                    if (confirm('Vuoi davvero uscire dalla sessione di Herdr?')) {
                        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        window.location.href = '/login';
                    }
                });
            }
        }).catch(err => {
            console.error('Error rendering settings:', err);
            settingsWrap.innerHTML = `
                <div style="padding: 40px 20px; text-align: center; color: var(--danger); font-size: 13px;">
                    Errore durante il caricamento delle impostazioni di Herdr.
                </div>
            `;
        });

        return;


}
