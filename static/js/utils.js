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
    },
    // Official Herdr Built-in Themes
    'catppuccin': {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        selectionBackground: 'rgba(203, 166, 247, 0.3)',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#cba6f7',
        cyan: '#89dceb',
        white: '#cdd6f4'
    },
    'gruvbox': {
        background: '#282828',
        foreground: '#ebdbb2',
        cursor: '#fe8019',
        selectionBackground: 'rgba(254, 128, 25, 0.3)',
        black: '#282828',
        red: '#fb4934',
        green: '#b8bb26',
        yellow: '#fabd2f',
        blue: '#83a598',
        magenta: '#d3869b',
        cyan: '#8ec07c',
        white: '#ebdbb2'
    },
    'dracula': {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f2',
        selectionBackground: 'rgba(255, 121, 198, 0.3)',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2'
    },
    'nord': {
        background: '#2e3440',
        foreground: '#eceff4',
        cursor: '#88c0d0',
        selectionBackground: 'rgba(136, 192, 208, 0.3)',
        black: '#3b4252',
        red: '#bf616a',
        green: '#a3be8c',
        yellow: '#ebcb8b',
        blue: '#81a1c1',
        magenta: '#b48ead',
        cyan: '#88c0d0',
        white: '#eceff4'
    },
    'one-dark': {
        background: '#282c34',
        foreground: '#abb2bf',
        cursor: '#528bff',
        selectionBackground: 'rgba(97, 175, 239, 0.3)',
        black: '#2c313a',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#abb2bf'
    },
    'kanagawa': {
        background: '#1f1f28',
        foreground: '#dcd7ba',
        cursor: '#dcd7ba',
        selectionBackground: 'rgba(149, 127, 184, 0.3)',
        black: '#2a2a37',
        red: '#c34043',
        green: '#76946a',
        yellow: '#ffa066',
        blue: '#7e9cd8',
        magenta: '#957fb8',
        cyan: '#7aa89f',
        white: '#dcd7ba'
    },
    'rose-pine': {
        background: '#191724',
        foreground: '#e0def4',
        cursor: '#e0def4',
        selectionBackground: 'rgba(235, 111, 146, 0.3)',
        black: '#26233a',
        red: '#eb6f92',
        green: '#31748f',
        yellow: '#f6c177',
        blue: '#9ccfd8',
        magenta: '#c4a7e7',
        cyan: '#ebbcba',
        white: '#e0def4'
    },
    'solarized': {
        background: '#002b36',
        foreground: '#839496',
        cursor: '#268bd2',
        selectionBackground: 'rgba(38, 139, 210, 0.3)',
        black: '#073642',
        red: '#dc322f',
        green: '#859900',
        yellow: '#b58900',
        blue: '#268bd2',
        magenta: '#d33682',
        cyan: '#2aa198',
        white: '#839496'
    },
    'vesper': {
        background: '#101010',
        foreground: '#ffffff',
        cursor: '#ffc799',
        selectionBackground: 'rgba(255, 199, 153, 0.3)',
        black: '#232323',
        red: '#ff8080',
        green: '#99ffb2',
        yellow: '#ffea79',
        blue: '#99ffe4',
        magenta: '#ffc799',
        cyan: '#99ffe4',
        white: '#ffffff'
    },
    'terminal': {
        background: '#000000',
        foreground: '#33ff33',
        cursor: '#33ff33',
        selectionBackground: 'rgba(51, 255, 51, 0.3)',
        black: '#1a1a1a',
        red: '#ff3333',
        green: '#33ff33',
        yellow: '#ffcc00',
        blue: '#3399ff',
        magenta: '#ff33cc',
        cyan: '#00ffff',
        white: '#33ff33'
    }
};

// =============================================================================
// OFFICIAL AI AGENTS ICONS & IDENTITY SYSTEM
// =============================================================================
const AGENT_METADATA = {
    'agy': {
        name: 'Google Antigravity',
        color: '#4285F4',
        bgGradient: 'linear-gradient(135deg, rgba(66, 133, 244, 0.22), rgba(138, 43, 226, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9.5" stroke="#4285F4" stroke-width="1.8" stroke-dasharray="3.5 2"/>
                <path d="M12 4.5L16.5 13.5H7.5L12 4.5Z" fill="url(#grad-agy-${size})"/>
                <circle cx="12" cy="16.5" r="1.8" fill="#00F0FF"/>
                <defs>
                    <linearGradient id="grad-agy-${size}" x1="7.5" y1="4.5" x2="16.5" y2="13.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#4285F4"/>
                        <stop offset="0.6" stop-color="#8A2BE2"/>
                        <stop offset="1" stop-color="#00F0FF"/>
                    </linearGradient>
                </defs>
            </svg>`
    },
    'claude': {
        name: 'Anthropic Claude',
        color: '#D97757',
        bgGradient: 'linear-gradient(135deg, rgba(217, 119, 87, 0.25), rgba(180, 83, 9, 0.25))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.8 3.2C13.5 2.4 12.5 2.4 12.2 3.2L10.9 7.3C10.6 8.2 9.8 9 9 9.3L4.9 10.6C4.1 10.9 4.1 11.9 4.9 12.2L9 13.5C9.9 13.8 10.6 14.5 10.9 15.4L12.2 19.5C12.5 20.3 13.5 20.3 13.8 19.5L15.1 15.4C15.4 14.5 16.1 13.8 17 13.5L21.1 12.2C21.9 11.9 21.9 10.9 21.1 10.6L17 9.3C16.2 9 15.4 8.2 15.1 7.3L13.8 3.2Z" fill="#D97757"/>
                <path d="M6.8 4.2L7.3 5.6C7.5 6.1 7.9 6.5 8.4 6.7L9.8 7.2L8.4 7.7C7.9 7.9 7.5 8.3 7.3 8.8L6.8 10.2L6.3 8.8C6.1 8.3 5.7 7.9 5.2 7.7L3.8 7.2L5.2 6.7C5.7 6.5 6.1 6.1 6.3 5.6L6.8 4.2Z" fill="#E8927C"/>
            </svg>`
    },
    'copilot': {
        name: 'GitHub Copilot',
        color: '#2B7FFF',
        bgGradient: 'linear-gradient(135deg, rgba(43, 127, 255, 0.22), rgba(138, 43, 226, 0.25))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3.2C7.3 3.2 3.5 7 3.5 11.8C3.5 14.5 4.7 16.9 6.7 18.5L5.8 20.8L8.8 19.8C9.8 20.2 10.9 20.4 12 20.4C16.7 20.4 20.5 16.6 20.5 11.8C20.5 7 16.7 3.2 12 3.2Z" fill="#2B7FFF"/>
                <path d="M7 11.5C7 10.1 8.1 9 9.5 9H14.5C15.9 9 17 10.1 17 11.5V13C17 14.4 15.9 15.5 14.5 15.5H9.5C8.1 15.5 7 14.4 7 13V11.5Z" fill="#FFFFFF"/>
                <circle cx="10" cy="12.2" r="1.3" fill="#2B7FFF"/>
                <circle cx="14" cy="12.2" r="1.3" fill="#2B7FFF"/>
            </svg>`
    },
    'cursor': {
        name: 'Cursor AI',
        color: '#00E5FF',
        bgGradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(30, 41, 59, 0.5))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z" stroke="#00E5FF" stroke-width="1.8" stroke-linejoin="round" fill="rgba(0, 229, 255, 0.12)"/>
                <path d="M12 22V12M12 12L20.5 7M12 12L3.5 7" stroke="#00E5FF" stroke-width="1.8" stroke-linejoin="round"/>
            </svg>`
    },
    'codex': {
        name: 'OpenAI Codex',
        color: '#10A37F',
        bgGradient: 'linear-gradient(135deg, rgba(16, 163, 127, 0.22), rgba(6, 78, 59, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#10A37F" stroke-width="1.6" fill="rgba(16, 163, 127, 0.12)"/>
                <path d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 15.04 8.96 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12" stroke="#10A37F" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12" stroke="#10A37F" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="1.5" fill="#10A37F"/>
            </svg>`
    },
    'gemini': {
        name: 'Google Gemini',
        color: '#4E82EE',
        bgGradient: 'linear-gradient(135deg, rgba(78, 130, 238, 0.22), rgba(156, 39, 176, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" fill="url(#grad-gem-${size})"/>
                <defs>
                    <linearGradient id="grad-gem-${size}" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#4E82EE"/>
                        <stop offset="0.5" stop-color="#9C27B0"/>
                        <stop offset="1" stop-color="#F43F5E"/>
                    </linearGradient>
                </defs>
            </svg>`
    },
    'devin': {
        name: 'Cognition Devin',
        color: '#10B981',
        bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 78, 59, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="4" fill="#064E3B" stroke="#10B981" stroke-width="1.8"/>
                <path d="M8 8.5L12 12L8 15.5" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="13" y1="15.5" x2="16.5" y2="15.5" stroke="#10B981" stroke-width="2" stroke-linecap="round"/>
            </svg>`
    },
    'droid': {
        name: 'Factory Droid',
        color: '#00FF66',
        bgGradient: 'linear-gradient(135deg, rgba(0, 255, 102, 0.18), rgba(13, 40, 24, 0.4))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3.5" y="5" width="17" height="14" rx="4" fill="#0D2818" stroke="#00FF66" stroke-width="1.8"/>
                <line x1="7" y1="10" x2="17" y2="10" stroke="#00FF66" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="8" cy="14.5" r="1.3" fill="#00FF66"/>
                <circle cx="16" cy="14.5" r="1.3" fill="#00FF66"/>
                <line x1="12" y1="2" x2="12" y2="5" stroke="#00FF66" stroke-width="1.8"/>
            </svg>`
    },
    'kimi': {
        name: 'Moonshot Kimi',
        color: '#3B82F6',
        bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.22), rgba(30, 64, 175, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 12C4 8 8 6 12 6C16 6 20 8 20 12C20 16 16 18 12 18C8 18 4 16 4 12Z" stroke="#3B82F6" stroke-width="2"/>
                <circle cx="9" cy="12" r="2" fill="#60A5FA"/>
                <circle cx="15" cy="12" r="2" fill="#3B82F6"/>
            </svg>`
    },
    'opencode': {
        name: 'OpenCode',
        color: '#A855F7',
        bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.22), rgba(168, 85, 247, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6L3 12L8 18" stroke="#A855F7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 6L21 12L16 18" stroke="#A855F7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 4L10 20" stroke="#EC4899" stroke-width="2" stroke-linecap="round"/>
            </svg>`
    },
    'kilo': {
        name: 'Kilo Code',
        color: '#F97316',
        bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22), rgba(124, 45, 18, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" fill="#7C2D12" stroke="#F97316" stroke-width="1.8"/>
                <path d="M9 7V17M15 7L9 12L15 17" stroke="#F97316" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    'hermes': {
        name: 'Nous Hermes',
        color: '#F59E0B',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(120, 53, 15, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C8 4 5 7 5 11C5 15 9 18 12 20C15 18 19 15 19 11C19 7 16 4 12 4Z" fill="#78350F" stroke="#F59E0B" stroke-width="1.8"/>
                <path d="M3 8C5 7 8 8 9 10" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M21 8C19 7 16 8 15 10" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="11" r="2.5" fill="#FBBF24"/>
            </svg>`
    },
    'qoder': {
        name: 'Qoder',
        color: '#6366F1',
        bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(49, 46, 129, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="11" r="7" stroke="#6366F1" stroke-width="2"/>
                <path d="M14 14L18 18" stroke="#6366F1" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M10 9L8 11L10 13" stroke="#818CF8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    'qwen': {
        name: 'Alibaba Qwen',
        color: '#8B5CF6',
        bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(88, 28, 135, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="#8B5CF6" stroke-width="1.8" fill="rgba(139, 92, 246, 0.15)"/>
                <path d="M12 6L16 9.5V14.5L12 18L8 14.5V9.5L12 6Z" fill="#8B5CF6"/>
            </svg>`
    },
    'mastra': {
        name: 'Mastra Code',
        color: '#E11D48',
        bgGradient: 'linear-gradient(135deg, rgba(225, 29, 72, 0.22), rgba(136, 19, 55, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18V6L12 13L20 6V18" stroke="#E11D48" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    'pi': {
        name: 'Inflection Pi',
        color: '#10B981',
        bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(30, 58, 43, 0.4))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8H19M9 8V17M15 8V16C15 17 16 17.5 17 17" stroke="#10B981" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
    },
    'omp': {
        name: 'OMP Agent',
        color: '#06B6D4',
        bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(168, 85, 247, 0.25))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8L10 12L4 16" stroke="#06B6D4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="16" x2="20" y2="16" stroke="#EC4899" stroke-width="2.2" stroke-linecap="round"/>
            </svg>`
    },
    'grok': {
        name: 'xAI Grok',
        color: '#F3F4F6',
        bgGradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(31, 41, 55, 0.4))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#E5E7EB" stroke-width="1.8" fill="#111827"/>
                <path d="M7 17L17 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`
    },
    'aider': {
        name: 'Aider',
        color: '#EF4444',
        bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22), rgba(153, 27, 27, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L4 13H11L10 22L20 10H13L14 2Z" fill="#EF4444" stroke="#DC2626" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>`
    },
    'openhands': {
        name: 'OpenHands',
        color: '#F59E0B',
        bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22), rgba(217, 119, 6, 0.25))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14C4 14 6 11 9 11C11 11 12 13 12 13M20 14C20 14 18 11 15 11C13 11 12 13 12 13" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 13V20M8 18H16" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="7" r="3" fill="#F59E0B"/>
            </svg>`
    },
    'goose': {
        name: 'Goose',
        color: '#FB923C',
        bgGradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.22), rgba(194, 65, 12, 0.3))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16C6 13 9 10 13 10H18L21 7M18 10L20 12M13 10V5C13 3.5 11.5 2.5 10 3C8.5 3.5 8 5 8 6.5V11" stroke="#FB923C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 16C6 19 9 21 13 21C17 21 20 19 20 16H6Z" fill="#FB923C"/>
            </svg>`
    },
    'generic': {
        name: 'Agente AI',
        color: '#00F0FF',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.18), rgba(138, 43, 226, 0.25))',
        getSvg: (size) => `
            <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" fill="#00F0FF" opacity="0.9"/>
                <circle cx="12" cy="12" r="2.5" fill="#FFFFFF"/>
            </svg>`
    }
};

function detectAgentKey(identifier) {
    if (!identifier) return 'generic';
    const str = String(identifier).toLowerCase().trim();
    if (str.includes('agy') || str.includes('antigravity')) return 'agy';
    if (str.includes('claude') || str.includes('anthropic')) return 'claude';
    if (str.includes('copilot') || str.includes('github')) return 'copilot';
    if (str.includes('cursor')) return 'cursor';
    if (str.includes('codex') || str.includes('openai') || str.includes('chatgpt') || str.includes('gpt')) return 'codex';
    if (str.includes('gemini') || str.includes('google')) return 'gemini';
    if (str.includes('devin') || str.includes('cognition')) return 'devin';
    if (str.includes('droid') || str.includes('factory')) return 'droid';
    if (str.includes('kimi') || str.includes('moonshot')) return 'kimi';
    if (str.includes('opencode')) return 'opencode';
    if (str.includes('kilo')) return 'kilo';
    if (str.includes('hermes') || str.includes('nous')) return 'hermes';
    if (str.includes('qoder')) return 'qoder';
    if (str.includes('qwen') || str.includes('tongyi')) return 'qwen';
    if (str.includes('mastra')) return 'mastra';
    if (str.includes('pi') || str.includes('inflection')) return 'pi';
    if (str.includes('omp')) return 'omp';
    if (str.includes('grok') || str.includes('xai')) return 'grok';
    if (str.includes('aider')) return 'aider';
    if (str.includes('openhands') || str.includes('opendevin') || str.includes('swe-agent')) return 'openhands';
    if (str.includes('goose')) return 'goose';
    return 'generic';
}

function getAgentDefaultName(identifier) {
    const key = detectAgentKey(identifier);
    return (AGENT_METADATA[key] && AGENT_METADATA[key].name) || 'Agente AI';
}

function getAgentMeta(identifier) {
    const key = detectAgentKey(identifier);
    const meta = AGENT_METADATA[key] || AGENT_METADATA['generic'];
    return { ...meta, key };
}

function getAgentIconSvg(identifier, size = 24) {
    const meta = getAgentMeta(identifier);
    return meta.getSvg(size);
}

// =============================================================================
// AGENT RENAMING SYSTEM
// =============================================================================
let _currentRenamingPaneId = null;

function openRenameAgentDialog(paneId, currentDisplayName, agentType) {
    _currentRenamingPaneId = paneId;
    if (!DOM.dialogRenameAgent) return;

    const defaultName = getAgentDefaultName(agentType || currentDisplayName);
    
    if (DOM.inputRenameAgentName) {
        DOM.inputRenameAgentName.value = currentDisplayName || '';
    }
    if (DOM.renameAgentOrigName) {
        DOM.renameAgentOrigName.textContent = currentDisplayName || defaultName;
    }
    if (DOM.renameAgentSubtitle) {
        DOM.renameAgentSubtitle.textContent = `Pannello #${paneId} • ${defaultName}`;
    }
    if (DOM.renameAgentIconSlot) {
        const meta = getAgentMeta(agentType || currentDisplayName);
        DOM.renameAgentIconSlot.innerHTML = getAgentIconSvg(agentType || currentDisplayName, 24);
        DOM.renameAgentIconSlot.style.background = meta.bgGradient;
        DOM.renameAgentIconSlot.style.borderColor = `${meta.color}60`;
    }

    try {
        DOM.dialogRenameAgent.showModal();
    } catch (e) {
        DOM.dialogRenameAgent.style.display = 'block';
    }

    setTimeout(() => {
        if (DOM.inputRenameAgentName) {
            DOM.inputRenameAgentName.focus();
            DOM.inputRenameAgentName.select();
        }
    }, 60);
}

function closeRenameAgentDialog() {
    if (DOM.dialogRenameAgent) {
        try {
            DOM.dialogRenameAgent.close();
        } catch (e) {
            DOM.dialogRenameAgent.style.display = 'none';
        }
    }
    _currentRenamingPaneId = null;
}

async function handleRenameAgentSubmit(resetToDefault = false) {
    if (!_currentRenamingPaneId) return;
    const paneId = _currentRenamingPaneId;
    const newName = resetToDefault ? '' : (DOM.inputRenameAgentName ? DOM.inputRenameAgentName.value.trim() : '');

    triggerHaptic('medium');
    const res = await apiCall('/api/agent/rename', {
        pane_id: paneId,
        name: newName
    });

    if (res && res.success) {
        showToast(newName ? `✓ Agente rinominato in "${newName}"` : '✓ Nome agente ripristinato');

        // Update State panes & workspaces
        const applyRename = (p) => {
            if (p.pane_id === paneId) {
                p.label = newName || null;
                p.custom_name = newName || null;
                p.title = newName || p.terminal_title_stripped || p.terminal_title || `Pane ${paneId}`;
            }
        };

        if (State.panes) State.panes.forEach(applyRename);
        if (State.workspaces) {
            State.workspaces.forEach(ws => {
                if (ws.panes) ws.panes.forEach(applyRename);
                if (ws.tabs) {
                    ws.tabs.forEach(t => {
                        if (t.panes) t.panes.forEach(applyRename);
                    });
                }
            });
        }

        // Update active chat header if this pane is open
        if (State.activePaneId === paneId) {
            const activePane = (State.panes && State.panes.find(p => p.pane_id === paneId)) || {};
            if (typeof updateHeaderInfo === 'function') updateHeaderInfo(activePane);
            if (DOM.contactHeroName) {
                DOM.contactHeroName.textContent = newName || activePane.agent || activePane.title || 'Herdr Agent';
            }
        }

        // Refresh lists
        if (typeof renderChatsList === 'function') renderChatsList();
        if (typeof renderSheetPanes === 'function') renderSheetPanes();

        closeRenameAgentDialog();
    } else {
        showToast('❌ Impossibile rinominare l\'agente');
    }
}
