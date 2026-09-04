/**
 * Herdr Mobile Dashboard — Client Controller & Engine
 * Native WhatsApp & Linear Hybrid Architecture
 */

// =============================================================================
// STATE & CONFIGURATION
// =============================================================================
const State = {
    connected: false,
    version: '0.8.2',
    socketPath: '~/.config/herdr/herdr.sock',
    activeWorkspaceId: null,
    activeTabId: null,
    activePaneId: null,
    workspaces: [],
    tabs: [],
    panes: [],
    mode: 'chat', // 'chat' or 'terminal'
    lastText: '',
    lastCleanText: '',
    lastRevision: -1,
    fontSize: parseInt(localStorage.getItem('herdr_font_size') || '13', 10),
    theme: localStorage.getItem('herdr_theme') || 'cyber-dark',
    term: null,
    fitAddon: null,
    webLinksAddon: null,
    webglAddon: null,
    sseSource: null,
    isRecordingVoice: false,
    speechRecognition: null,
    isAtBottom: true,
    terminalAtBottom: true,
    isChatUserScrolled: false,
    pendingAttachment: null,
    currentScreen: 'chat-active', // 'chat-active' or 'chats-list'
    chatsFilter: 'panes', // 'panes', 'workspaces'
    chatMessages: [], // Local user-sent message cache
    herdrConfig: null,
    integrations: [],
    slashCommands: [],
    activeSlashCat: 'all',
    selectedSlashIndex: 0,
    plugins: [],
    supportedThemes: [
        'catppuccin', 'gruvbox', 'dracula', 'nord', 'one-dark',
        'kanagawa', 'rose-pine', 'solarized', 'tokyo-night', 'vesper', 'terminal'
    ]
};

// =============================================================================
// DOM CACHE
// =============================================================================
const DOM = {
    // WhatsApp Multi-Screen Views
    screenChatsList: document.getElementById('screen-chats-list'),
    chatsViewTitle: document.getElementById('chats-view-title'),
    badgeAgentCount: document.getElementById('badge-agent-count'),
    btnTabbarSettings: document.getElementById('btn-tabbar-settings'),
    btnTabbarInfo: document.getElementById('btn-tabbar-settings'),
    screenChatActive: document.getElementById('screen-chat-active'),
    btnNewChat: document.getElementById('btn-new-chat'),
    chatsListScroll: document.getElementById('chats-list-scroll'),
    chatsFilterChips: document.getElementById('chats-filter-chips'),
    // Header Elements
    appRoot: document.getElementById('app-root'),
    chatHeader: document.getElementById('chat-header'),
    btnWsPicker: document.getElementById('btn-ws-picker'),
    headerAvatarMini: document.getElementById('header-avatar-mini'),
    currentWsName: document.getElementById('current-ws-name'),
    btnHeaderContact: document.getElementById('btn-header-contact'),
    socketDot: document.getElementById('socket-dot'),
    chatHeaderTitle: document.getElementById('chat-header-title'),
    agentStatusText: document.getElementById('agent-status-text'),
    btnModeToggle: document.getElementById('btn-mode-toggle'),
    modeIcon: document.getElementById('mode-icon'),
    modeLabel: document.getElementById('mode-label'),
    btnOpenMenu: document.getElementById('btn-open-menu'),
    // Tab Strip
    tabStrip: document.getElementById('tab-strip'),
    tabsContainer: document.getElementById('tabs-container'),
    btnAddTab: document.getElementById('btn-add-tab'),
    // Viewports
    viewportWrapper: document.getElementById('viewport-wrapper'),
    chatViewport: document.getElementById('chat-viewport'),
    chatScrollContainer: document.getElementById('chat-scroll-container'),
    chatMessages: document.getElementById('chat-messages'),
    btnChatScrollBottom: document.getElementById('btn-chat-scroll-bottom'),
    terminalViewport: document.getElementById('terminal-viewport'),
    terminalContainer: document.getElementById('terminal-container'),
    btnScrollBottom: document.getElementById('btn-scroll-bottom'),
    // Confirm Banner
    agentConfirmBanner: document.getElementById('agent-confirm-banner'),
    confirmText: document.getElementById('confirm-text'),
    btnConfirmYes: document.getElementById('btn-confirm-yes'),
    btnConfirmNo: document.getElementById('btn-confirm-no'),
    btnConfirmStop: document.getElementById('btn-confirm-stop'),
    // CLI Keys Drawer
    cliKeysDrawer: document.getElementById('cli-keys-drawer'),
    btnCtrlMenu: document.getElementById('btn-ctrl-menu'),
    ctrlShortcutsPopup: document.getElementById('ctrl-shortcuts-popup'),
    ctrlPopupBackdrop: document.getElementById('ctrl-popup-backdrop'),
    btnSlashMenu: document.getElementById('btn-slash-menu'),
    slashPalettePopup: document.getElementById('slash-palette-popup'),
    slashPopupBackdrop: document.getElementById('slash-popup-backdrop'),
    slashPaletteList: document.getElementById('slash-palette-list'),
    slashPaletteCount: document.getElementById('slash-palette-count'),
    btnSlashClose: document.getElementById('btn-slash-close'),
    slashCategoriesBar: document.getElementById('slash-categories-bar'),
    // Attachment Preview Bar
    attachmentPreviewBar: document.getElementById('attachment-preview-bar'),
    attachmentThumbWrap: document.getElementById('attachment-thumb-wrap'),
    attachmentThumb: document.getElementById('attachment-thumb'),
    attachmentName: document.getElementById('attachment-name'),
    attachmentSize: document.getElementById('attachment-size'),
    btnRemoveAttachment: document.getElementById('btn-remove-attachment'),
    fileInput: document.getElementById('file-input'),
    // Footer & Input
    chatFooter: document.getElementById('chat-footer'),
    btnToggleActions: document.getElementById('btn-toggle-actions'),
    promptInput: document.getElementById('prompt-input'),
    btnAttachImage: document.getElementById('btn-attach-image'),
    btnActionMicSend: document.getElementById('btn-action-mic-send'),
    iconMic: document.querySelector('.icon-mic'),
    iconSend: document.querySelector('.icon-send'),
    // Lightbox Modal
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxBackdrop: document.getElementById('lightbox-backdrop'),
    lightboxImg: document.getElementById('lightbox-img'),
    btnLightboxClose: document.getElementById('btn-lightbox-close'),
    // WhatsApp Contact Info Modal / Sheet
    sheetBackdrop: document.getElementById('sheet-backdrop'),
    bottomSheet: document.getElementById('bottom-sheet'),
    btnSheetClose: document.getElementById('btn-sheet-close'),
    contactHeroName: document.getElementById('contact-hero-name'),
    contactHeroSubtitle: document.getElementById('contact-hero-subtitle'),
    contactCwdVal: document.getElementById('contact-cwd-val'),
    contactBranchVal: document.getElementById('contact-branch-val'),
    contactPaneIdVal: document.getElementById('contact-pane-id-val'),
    contactCmdVal: document.getElementById('contact-cmd-val'),
    contactStatusVal: document.getElementById('contact-status-val'),
    btnQuickChat: document.getElementById('btn-quick-chat'),
    btnQuickTerm: document.getElementById('btn-quick-term'),
    btnQuickTab: document.getElementById('btn-quick-tab'),
    btnQuickSplit: document.getElementById('btn-quick-split'),
    sheetPanesList: document.getElementById('sheet-panes-list'),
    btnCreateWs: document.getElementById('btn-create-ws'),
    btnSplitHoriz: document.getElementById('btn-split-horiz'),
    btnSplitVert: document.getElementById('btn-split-vert'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    fontSizeDisplay: document.getElementById('font-size-display'),
    themeChipsList: document.getElementById('theme-chips-list'),
    sheetDaemonVersion: document.getElementById('sheet-daemon-version'),
    sheetSocketPath: document.getElementById('sheet-socket-path'),
    btnLogout: document.getElementById('btn-logout'),
    // New Workspace Dialog
    dialogNewWs: document.getElementById('dialog-new-ws'),
    inputNewWsCwd: document.getElementById('input-new-ws-cwd'),
    inputNewWsLabel: document.getElementById('input-new-ws-label'),
    btnDialogCancel: document.getElementById('btn-dialog-cancel'),
    btnDialogConfirm: document.getElementById('btn-dialog-confirm'),
    // Toast Shelf
    toastShelf: document.getElementById('toast-shelf')
};

// =============================================================================
// UTILITIES (HAPTIC, TOAST, API, TIME)
// =============================================================================
