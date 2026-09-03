function initTerminal() {
    if (!DOM.terminalContainer) return;

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

    if (window.FitAddon && FitAddon.FitAddon) {
        State.fitAddon = new FitAddon.FitAddon();
        State.term.loadAddon(State.fitAddon);
    }

    if (window.WebLinksAddon && WebLinksAddon.WebLinksAddon) {
        State.webLinksAddon = new WebLinksAddon.WebLinksAddon();
        State.term.loadAddon(State.webLinksAddon);
    }

    State.term.open(DOM.terminalContainer);
    
    setTimeout(() => {
        try { if (State.fitAddon) State.fitAddon.fit(); } catch (e) {}
    }, 60);

    State.term.onScroll(() => {
        const buffer = State.term.buffer.active;
        const atBottom = buffer.viewportY >= buffer.baseY;
        if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = atBottom ? 'none' : 'flex';
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

    if (DOM.btnScrollBottom) {
        DOM.btnScrollBottom.addEventListener('click', () => {
            State.term.scrollToBottom();
            DOM.btnScrollBottom.style.display = 'none';
        });
    }
}

// =============================================================================
// MODE SWITCHER: CHAT (WHATSAPP) vs TERMINAL (XTERM)
// =============================================================================
