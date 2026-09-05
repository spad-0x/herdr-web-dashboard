# Graph Report - herdr-web-dashboard  (2026-09-05)

## Corpus Check
- 23 files · ~69,371 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1193 nodes · 2581 edges · 70 communities (48 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `20019ea8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `_()` - 296 edges
2. `k` - 105 edges
3. `d` - 65 edges
4. `fire()` - 64 edges
5. `P` - 55 edges
6. `i()` - 45 edges
7. `constructor()` - 42 edges
8. `f` - 41 edges
9. `i()` - 41 edges
10. `s()` - 41 edges

## Surprising Connections (you probably didn't know these)
- `openNavPopup()` --calls--> `triggerHaptic()`  [INFERRED]
  scratch-nav-logic.js → static/js/utils.js
- `DashboardHandler` --uses--> `HerdrClient`  [INFERRED]
  server.py → herdr_client.py
- `handleStateUpdate()` --calls--> `updateChatContent()`  [INFERRED]
  static/js/stream.js → static/js/chat.js
- `sendPrompt()` --calls--> `appendUserBubble()`  [INFERRED]
  static/js/input-bar.js → static/js/chat.js
- `sendQuickText()` --calls--> `appendUserBubble()`  [INFERRED]
  static/js/input-bar.js → static/js/chat.js

## Import Cycles
- None detected.

## Communities (70 total, 22 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (8): _convertViewportColToCharacterIndex(), decode(), getCell(), getJoinedCharacters(), _getWordAt(), h(), _isCharWordSeparator(), _stringRangesToCellRanges()

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (3): k, markAllDirty(), nextStop()

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (21): _(), _clearLiveRegion(), compositionend(), compositionupdate(), _finalizeComposition(), flush(), get(), _handleAnyTextareaChanges() (+13 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (12): _announceCharacters(), _createAccessibilityTreeNode(), _createSelectionElement(), _fullRefresh(), _handleBoundaryFocus(), _handleResize(), handleSelectionChanged(), _refreshRowDimensions() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (19): btnCustomMenu, btnNavMenu, customCommandsGrid, customPopupBackdrop, customShortcutsPopup, filteredSlashCommands, handleImageFile(), handlePasteEvent() (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (5): createRow(), i(), modifyColors(), restoreColor(), v()

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (39): BaseHTTPRequestHandler, check_is_agent(), create_session(), DashboardHandler, ensure_auth_credentials(), ensure_ssl_certificates(), extract_agent_key(), get_aggregated_state() (+31 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (26): C(), _cancelCallback(), clear(), clearListeners(), constructor(), debug(), dispose(), error() (+18 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (3): c(), clearHandler(), registerHandler()

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (18): _addMouseDownListeners(), areSelectionValuesReversed(), finalSelectionEnd(), finalSelectionStart(), _getMouseBufferCoords(), _getMouseEventScrollAmount(), getWrappedRangeForLine(), _handleDoubleClick() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): 1. Clone & Start, 2. Access from Any Device, 3. Install as Native PWA, 🧭 Adaptive Navigation & Terminal Console, 💬 Conversational Experience & Semantic Parsing, Custom Port or Binding, 🔒 Enterprise-Grade Security, Herdr Web Dashboard 🐏 ⚡ 🔒 (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (13): activeProtocol(), clearAllMarkers(), clearSelection(), disable(), _dragScroll(), fire(), _handleBufferActivate(), _handleScroll() (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (19): clearAttachment(), clearPromptInput(), closeCustomPopup(), closeSlashPalette(), getPromptText(), handleMicOrSendClick(), openNavPopup(), selectSlashCommand() (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (11): HerdrClient, Send plain text to a pane and optionally press Enter., Send key combinations like ['enter'], ['ctrl+c'], ['esc'], ['up'], ['down']., Send prompt to a designated agent., Resize the underlying PTY for a pane via ioctl(TIOCSWINSZ) with SIGWINCH., Remove ANSI escape sequences from terminal output., Check if Herdr Unix socket is available and responsive., Send a JSON-RPC request to Herdr socket and return parsed response. (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (9): compositionstart(), _createElement(), _doRefreshDecorations(), handleFocus(), _refreshStyle(), _refreshXPosition(), _removeIntersectingLinks(), _renderDecoration() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (7): createInstance(), enable(), event(), hasRenderer(), register(), _registerDecorationListeners(), setService()

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (4): clear(), fillViewportRows(), init(), o()

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, name, orientation, scope (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.42
Nodes (7): setMode(), toggleMode(), ensureWebglAddon(), initResizeObserver(), initSubpixelScroll(), initTerminal(), initTouchScroll()

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (21): addEncoding(), addProtocol(), addRefreshCallback(), constructor(), _fireOnCanvasResize(), handleCharSizeChanged(), handleDevicePixelRatioChange(), _handleOptionsChanged() (+13 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (5): _addCallbacks(), n(), o, provideLinks(), t()

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): addDecoration(), _addLineToZone(), _lineAdjacentToZone(), _lineIntersectsZone(), _refreshCanvasDimensions(), _refreshColorZonePadding(), _refreshDecorations(), _refreshDrawConstants() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (13): _askForLink(), _checkLinkProviderResult(), _clearCurrentLink(), _createLinkUnderlineEvent(), _fireUnderlineEvent(), getCoords(), _handleHover(), _handleMouseUp() (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (10): _applyScrollModifier(), _bubbleScroll(), _clearSmoothScrollState(), getLinesScrolled(), _getPixelsScrolled(), handleTouchMove(), handleWheel(), scrollLines() (+2 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (3): addEscHandler(), registerEscHandler(), values()

### Community 34 - "Community 34"
Cohesion: 0.12
Nodes (5): h, n, register(), resolve(), w()

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (6): end(), hook(), put(), reset(), _start(), unhook()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (12): openContactInfo(), renderSheetPanes(), updateHeaderInfo(), AGENT_METADATA, closeRenameAgentDialog(), detectAgentKey(), getAgentDefaultName(), getAgentIconSvg() (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (10): _batchedMemoryCleanup(), getBufferElements(), getCss(), getLine(), getLinkData(), getService(), provideLinks(), selectionText() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.31
Nodes (6): initServiceWorker(), loadNotificationSettings(), saveNotificationSettings(), subscribeUserToPush(), unsubscribeUserFromPush(), urlBase64ToUint8Array()

### Community 43 - "Community 43"
Cohesion: 0.15
Nodes (11): clearListeners(), clearMarkers(), delete(), deregister(), dispose(), _removeDecoration(), _removeMarker(), _removeMarkerFromLink() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (5): addLineToLink(), addMarker(), _getEntryIdKey(), loadAddon(), registerLink()

### Community 46 - "Community 46"
Cohesion: 0.43
Nodes (6): appendUserBubble(), renderActiveChatFromTerminal(), scrollChatToBottom(), updateChatContent(), escapeHtml(), formatTime()

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (9): renderChatsList(), setScreen(), renderTabs(), renderSettingsScreen(), handleStateUpdate(), updateActiveAgentsBadge(), updateConfirmationBanner(), updateTerminalContent() (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (4): _cancelCallback(), r(), _requestCallback(), warn()

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (7): error(), _evalLazyOptionalParams(), _getJoinedRanges(), info(), _log(), _mergeRanges(), trace()

### Community 54 - "Community 54"
Cohesion: 0.15
Nodes (3): addOscHandler(), registerOscHandler(), setHandlerFallback()

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (4): getBlankLine(), getNullCell(), markDirty(), markRangeDirty()

### Community 58 - "Community 58"
Cohesion: 0.20
Nodes (5): clearRange(), debug(), _equalEvents(), triggerBinaryEvent(), triggerMouseEvent()

### Community 59 - "Community 59"
Cohesion: 0.20
Nodes (7): _getCorrectBufferLength(), _reflow(), _reflowLarger(), _reflowLargerAdjustViewport(), _reflowSmaller(), resize(), set()

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (4): forEachByKey(), getKeyIterator(), insert(), _search()

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (4): btnNavMenu, navPopupBackdrop, navShortcutsPopup, openNavPopup()

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (5): _addStyle(), _applyMinimumContrast(), getColor(), _getContrastCache(), setColor()

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (6): _areCoordsInSelection(), _fireEventIfSelectionChanged(), _fireOnSelectionChange(), _isCellInSelection(), _isClickInSelection(), rightClickSelect()

## Knowledge Gaps
- **42 isolated node(s):** `fs`, `code`, `btnNavMenu`, `navShortcutsPopup`, `navPopupBackdrop` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 38`, `Community 40`, `Community 43`, `Community 44`, `Community 50`, `Community 52`, `Community 54`, `Community 55`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`, `Community 64`, `Community 65`, `Community 67`, `Community 68`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **Why does `k` connect `Community 1` to `Community 32`, `Community 65`, `Community 2`, `Community 0`, `Community 36`, `Community 38`, `Community 40`, `Community 44`, `Community 13`, `Community 14`, `Community 17`, `Community 54`, `Community 55`, `Community 58`, `Community 60`, `Community 61`, `Community 62`, `Community 63`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `d` connect `Community 8` to `Community 2`, `Community 38`, `Community 9`, `Community 43`, `Community 44`, `Community 13`, `Community 18`, `Community 20`, `Community 24`, `Community 28`, `Community 63`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `d` (e.g. with `.restoreIndexedColor()` and `.setOrReportIndexedColor()`) actually correct?**
  _`d` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `code`, `Remove ANSI escape sequences from terminal output.` to the rest of the system?**
  _62 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08232118758434548 - nodes in this community are weakly interconnected._