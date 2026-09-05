function ensureWebglAddon() {
    if (!State.term || State.webglAddon) return;
    const WebglAddonClass = window.WebglAddon && (window.WebglAddon.WebglAddon || window.WebglAddon);
    if (!WebglAddonClass) return;
    try {
        State.webglAddon = new WebglAddonClass();
        State.webglAddon.onContextLoss(() => {
            if (State.webglAddon) {
                State.webglAddon.dispose();
                State.webglAddon = null;
            }
        });
        State.term.loadAddon(State.webglAddon);
        console.log('⚡ WebGL Hardware Accelerated Renderer activated for xterm!');
    } catch (e) {
        console.warn('WebGL addon initialization deferred/failed:', e);
    }
}

function initSubpixelScroll() {
    // Deprecated: Subpixel transform translations caused screen flickering and live stream scroll lock.
    // Native xterm with smoothScrollDuration: 0 provides rock-solid, jitter-free scrolling.
    if (State.term && State.term.element) {
        const screen = State.term.element.querySelector('.xterm-screen');
        if (screen) {
            screen.style.transform = '';
            screen.style.willChange = '';
            screen._subpixelScrollActive = false;
        }
    }
}

function initTouchScroll() {
    if (!DOM.terminalContainer || DOM.terminalContainer._touchScrollInitialized) return;
    DOM.terminalContainer._touchScrollInitialized = true;

    let touchStartY = 0;
    let lastTouchY = 0;
    let lastTouchTime = 0;
    let velocity = 0;
    let momentumRAF = null;
    let isTracking = false;
    let hasMoved = false;

    const getViewport = () => {
        return DOM.terminalContainer.querySelector('.xterm-viewport');
    };

    DOM.terminalContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        if (momentumRAF) {
            cancelAnimationFrame(momentumRAF);
            momentumRAF = null;
        }
        isTracking = true;
        hasMoved = false;
        touchStartY = e.touches[0].clientY;
        lastTouchY = touchStartY;
        lastTouchTime = performance.now();
        velocity = 0;
    }, { passive: true });

    DOM.terminalContainer.addEventListener('touchmove', (e) => {
        if (!isTracking || e.touches.length !== 1) return;
        const viewport = getViewport();
        if (!viewport) return;

        const currentY = e.touches[0].clientY;
        const currentTime = performance.now();
        const deltaY = lastTouchY - currentY;
        const deltaTime = currentTime - lastTouchTime;

        if (!hasMoved) {
            if (Math.abs(currentY - touchStartY) >= 3) {
                hasMoved = true;
            } else {
                return;
            }
        }

        if (deltaTime > 0) {
            const instantVelocity = deltaY / deltaTime; // px/ms
            velocity = 0.7 * instantVelocity + 0.3 * velocity;
        }

        lastTouchY = currentY;
        lastTouchTime = currentTime;

        viewport.scrollTop += deltaY;

        if (e.cancelable) {
            e.preventDefault();
        }
    }, { passive: false });

    const stopTracking = () => {
        if (!isTracking) return;
        isTracking = false;

        const viewport = getViewport();
        if (!viewport) return;

        // If finger was held still before release, cancel momentum
        if (performance.now() - lastTouchTime > 80) {
            velocity = 0;
        }

        if (Math.abs(velocity) > 0.05) {
            let currentVelocity = velocity * 16; // Translate to ~60fps frame delta (px)
            currentVelocity = Math.max(-45, Math.min(45, currentVelocity)); // Safety clamp
            const friction = 0.94; // Deceleration rate per frame
            const minVelocity = 0.5;

            const stepMomentum = () => {
                if (Math.abs(currentVelocity) < minVelocity) {
                    momentumRAF = null;
                    return;
                }
                const vp = getViewport();
                if (!vp) {
                    momentumRAF = null;
                    return;
                }

                const prevTop = vp.scrollTop;
                vp.scrollTop += currentVelocity;

                if (vp.scrollTop === prevTop) {
                    // Reached bounds
                    momentumRAF = null;
                    return;
                }

                currentVelocity *= friction;
                momentumRAF = requestAnimationFrame(stepMomentum);
            };

            momentumRAF = requestAnimationFrame(stepMomentum);
        }
    };

    DOM.terminalContainer.addEventListener('touchend', stopTracking, { passive: true });
    DOM.terminalContainer.addEventListener('touchcancel', stopTracking, { passive: true });

    // Desktop/Trackpad wheel handler
    DOM.terminalContainer.addEventListener('wheel', (e) => {
        if (e.deltaY < 0) {
            State.terminalAtBottom = false;
            if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = 'flex';
        } else if (e.deltaY > 0) {
            setTimeout(() => {
                if (State.term) {
                    const buffer = State.term.buffer.active;
                    if (buffer.viewportY >= (buffer.baseY - 1)) {
                        State.terminalAtBottom = true;
                        if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = 'none';
                    }
                }
            }, 50);
        }
    }, { passive: true });
}

let lastSyncedCols = null;
let lastSyncedRows = null;
let syncDebounceTimer = null;

function syncTerminalSizeWithBackend(force = false) {
    if (!State.term) return;
    const cols = State.term.cols;
    const rows = State.term.rows;

    if (!cols || !rows || cols <= 0 || rows <= 0) return;
    if (!force && cols === lastSyncedCols && rows === lastSyncedRows) return;

    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
        lastSyncedCols = cols;
        lastSyncedRows = rows;
        const payload = {
            type: 'resize',
            pane_id: State.activePaneId || null,
            cols: cols,
            rows: rows
        };
        apiCall('/api/terminal/resize', payload).then((res) => {
            console.log(`📡 PTY winsize synchronized: ${cols} cols x ${rows} rows`, res);
        }).catch(err => {
            console.warn('[Terminal Resize] PTY sync error:', err);
        });
    }, 60);
}

function initResizeObserver() {
    if (!DOM.terminalContainer || DOM.terminalContainer._resizeObserver) return;

    let resizeTimeout = null;
    const handleResize = () => {
        if (!State.term || !State.fitAddon) return;
        // Avoid fitting when viewport is hidden (0 dimensions)
        if (!DOM.terminalContainer || DOM.terminalContainer.offsetParent === null) return;
        if (DOM.screenChatActive && DOM.screenChatActive.style.display === 'none') return;

        try {
            State.fitAddon.fit();
            syncTerminalSizeWithBackend();
            if (typeof initSubpixelScroll === 'function') initSubpixelScroll();
        } catch (e) {
            console.warn('[Terminal Resize] fit error:', e);
        }
    };

    DOM.terminalContainer._resizeObserver = new ResizeObserver(() => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 40);
    });
    DOM.terminalContainer._resizeObserver.observe(DOM.terminalContainer);

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', handleResize);
    }
}

function initTerminal() {
    if (!DOM.terminalContainer) return;

    const selectedTheme = TERMINAL_THEMES[State.theme] || TERMINAL_THEMES['cyber-dark'];

    State.term = new Terminal({
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: State.fontSize,
        lineHeight: 1.25,
        cursorBlink: false,
        cursorStyle: 'bar',
        cursorInactiveStyle: 'none',
        disableStdin: true,        // Pure read-only view: disables keyboard input and typing
        theme: selectedTheme,
        scrollback: 6000,
        convertEol: true,
        smoothScrollDuration: 0,   // MUST BE 0: eliminates 250ms animation delay, lag, and jitter during live streaming
        scrollSensitivity: 1,      // Natural feel for Mac trackpads and wheel
        fastScrollSensitivity: 4
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

    // Disable and lock textarea to prevent mobile keyboard pop-up or focus steal
    if (State.term.textarea) {
        State.term.textarea.readOnly = true;
        State.term.textarea.disabled = true;
        State.term.textarea.tabIndex = -1;
        State.term.textarea.setAttribute('inputmode', 'none');
        State.term.textarea.setAttribute('aria-hidden', 'true');
        State.term.textarea.addEventListener('focus', () => {
            if (State.term && State.term.textarea) State.term.textarea.blur();
        });
        State.term.textarea.blur();
    }
    // Stub focus to prevent any touch or programmatic focus attempt
    State.term.focus = function() {};

    ensureWebglAddon();
    initSubpixelScroll();
    initTouchScroll();
    initResizeObserver();

    // Initial mount: compute dimensions and synchronize with PTY backend immediately
    setTimeout(() => {
        try {
            if (State.fitAddon) State.fitAddon.fit();
            syncTerminalSizeWithBackend(true);
            ensureWebglAddon();
            initSubpixelScroll();
            initTouchScroll();
        } catch (e) {}
    }, 40);

    State.terminalAtBottom = true;

    State.term.onScroll(() => {
        const buffer = State.term.buffer.active;
        const atBottom = buffer.viewportY >= (buffer.baseY - 1);
        // Only update to false if user triggered the scroll (not an active programmatic write)
        if (!State._isWritingToTerminal) {
            State.terminalAtBottom = atBottom;
            if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = atBottom ? 'none' : 'flex';
        } else if (atBottom) {
            State.terminalAtBottom = true;
            if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = 'none';
        }
    });

    if (DOM.btnScrollBottom) {
        DOM.btnScrollBottom.addEventListener('click', () => {
            State.terminalAtBottom = true;
            State.term.scrollToBottom();
            DOM.btnScrollBottom.style.display = 'none';
        });
    }
}

// =============================================================================
// MODE SWITCHER: CHAT (WHATSAPP) vs TERMINAL (XTERM)
// =============================================================================
