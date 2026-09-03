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
