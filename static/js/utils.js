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
