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
    if (!State.term || !State.term.element) return;
    const viewport = State.term.element.querySelector('.xterm-viewport');
    const screen = State.term.element.querySelector('.xterm-screen');
    if (!viewport || !screen) return;

    if (screen._subpixelScrollActive) return;
    screen._subpixelScrollActive = true;
    screen.style.willChange = 'transform';

    let rAF = null;
    const updateScrollTransform = () => {
        if (!State.term || !State.term._core) return;
        const core = State.term._core;
        const renderService = core._renderService;
        if (!renderService || !renderService.dimensions) return;
        const rowHeight = renderService.dimensions.css.cell.height;
        if (!rowHeight || rowHeight <= 0) return;

        const scrollTop = viewport.scrollTop;
        const ydisp = core._bufferService.buffer.ydisp;

        // Subpixel continuity: cancels the row-jumping artifact of xterm's character grid
        const offsetPx = (ydisp * rowHeight) - scrollTop;
        screen.style.transform = `translate3d(0, ${offsetPx}px, 0)`;
    };

    viewport.addEventListener('scroll', () => {
        if (rAF) cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(updateScrollTransform);
    }, { passive: true });

    State.term.onScroll(updateScrollTransform);
    State.term.onRender(updateScrollTransform);
    updateScrollTransform();
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
        smoothScrollDuration: 250, // Animates viewport transitions smoothly in milliseconds
        scrollSensitivity: 0.8,    // Balanced and natural feel for Mac trackpads and wheel
        fastScrollSensitivity: 4
    });

    if (window.FitAddon && FitAddon.FitAddon) {
        State.fitAddon = new FitAddon.FitAddon();
        const origPropose = State.fitAddon.proposeDimensions.bind(State.fitAddon);
        State.fitAddon.proposeDimensions = function() {
            const dims = origPropose();
            if (dims && dims.rows) {
                dims.rows += 2; // Extra buffer rows so fractional subpixel scroll never exposes gap
            }
            return dims;
        };
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
    
    setTimeout(() => {
        try {
            if (State.fitAddon) State.fitAddon.fit();
            ensureWebglAddon();
            initSubpixelScroll();
            initTouchScroll();
        } catch (e) {}
    }, 60);

    State.terminalAtBottom = true;

    State.term.onScroll(() => {
        const buffer = State.term.buffer.active;
        const atBottom = buffer.viewportY >= (buffer.baseY - 1);
        State.terminalAtBottom = atBottom;
        if (DOM.btnScrollBottom) DOM.btnScrollBottom.style.display = atBottom ? 'none' : 'flex';
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
