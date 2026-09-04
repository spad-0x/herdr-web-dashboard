# Graph Report - herdr-web-dashboard  (2026-09-04)

## Corpus Check
- 21 files · ~33,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1171 nodes · 2553 edges · 63 communities (40 shown, 23 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d3f81da`
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
- [[_COMMUNITY_Community 63|Community 63]]

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
- `DashboardHandler` --uses--> `HerdrClient`  [INFERRED]
  server.py → herdr_client.py
- `handleStateUpdate()` --calls--> `renderTabs()`  [INFERRED]
  static/js/stream.js → static/js/input-bar.js
- `setAttachment()` --calls--> `formatBytes()`  [INFERRED]
  static/js/input-bar.js → static/js/utils.js
- `provideLinks()` --calls--> `t()`  [INFERRED]
  static/vendor/addon-web-links.js → static/vendor/xterm.js
- `handleStateUpdate()` --calls--> `updateChatContent()`  [INFERRED]
  static/js/stream.js → static/js/chat.js

## Import Cycles
- None detected.

## Communities (63 total, 23 thin omitted)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (5): debug(), k, nextStop(), setgCharset(), setgLevel()

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (32): _(), addRefreshCallback(), _clearLiveRegion(), compositionend(), compositionupdate(), _equalEvents(), _evalLazyOptionalParams(), _finalizeComposition() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.27
Nodes (8): _createAccessibilityTreeNode(), _createSelectionElement(), _handleBoundaryFocus(), _handleResize(), handleSelectionChanged(), _refreshRowDimensions(), _refreshRowElements(), _refreshRowsDimensions()

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (60): appendUserBubble(), renderActiveChatFromTerminal(), scrollChatToBottom(), updateChatContent(), renderChatsList(), setMode(), setScreen(), toggleMode() (+52 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (39): BaseHTTPRequestHandler, check_is_agent(), create_session(), DashboardHandler, ensure_auth_credentials(), ensure_ssl_certificates(), extract_agent_key(), get_aggregated_state() (+31 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (26): C(), _cancelCallback(), clear(), clearListeners(), constructor(), debug(), dispose(), error() (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (3): d, error(), _handleSelectionChange()

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (4): c(), clearHandler(), registerHandler(), setHandlerFallback()

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (19): _addMouseDownListeners(), _areCoordsInSelection(), _getMouseBufferCoords(), _getMouseEventScrollAmount(), getWrappedRangeForLine(), _handleDoubleClick(), _handleIncrementalClick(), _handleMouseDown() (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): 1. Clone & Start, 2. Access from Any Device, 3. Install as Native PWA, 🧭 Adaptive Navigation & Terminal Console, 💬 Conversational Experience & Semantic Parsing, Custom Port or Binding, 🔒 Enterprise-Grade Security, Herdr Web Dashboard 🐏 ⚡ 🔒 (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (15): clearSelection(), deregister(), disable(), _dragScroll(), _fireEventIfSelectionChanged(), _fireOnSelectionChange(), getCoords(), _handleMouseUp() (+7 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (11): HerdrClient, Send plain text to a pane and optionally press Enter., Send key combinations like ['enter'], ['ctrl+c'], ['esc'], ['up'], ['down']., Send prompt to a designated agent., Resize the underlying PTY for a pane via ioctl(TIOCSWINSZ) with SIGWINCH., Remove ANSI escape sequences from terminal output., Check if Herdr Unix socket is available and responsive., Send a JSON-RPC request to Herdr socket and return parsed response. (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (5): _createElement(), _doRefreshDecorations(), _refreshStyle(), _refreshXPosition(), _renderDecoration()

### Community 20 - "Community 20"
Cohesion: 0.10
Nodes (13): addEncoding(), addProtocol(), constructor(), event(), _handleThemeChange(), register(), _registerBufferChangeListeners(), _registerDecorationListeners() (+5 more)

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, name, orientation, scope (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): clearTextureAtlas(), _fullRefresh(), setRenderer()

### Community 24 - "Community 24"
Cohesion: 0.21
Nodes (10): clear(), _fireOnCanvasResize(), _getCorrectBufferLength(), handleCharSizeChanged(), handleDevicePixelRatioChange(), _handleOptionsChanged(), _injectCss(), _setDefaultSpacing() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (4): _addCallbacks(), n(), o, provideLinks()

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): addDecoration(), _addLineToZone(), _lineAdjacentToZone(), _lineIntersectsZone(), _refreshCanvasDimensions(), _refreshColorZonePadding(), _refreshDecorations(), _refreshDrawConstants() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.12
Nodes (17): _askForLink(), _checkLinkProviderResult(), _clearCurrentLink(), compositionstart(), _createLinkUnderlineEvent(), _fireUnderlineEvent(), forEachByKey(), getLinkData() (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (4): get(), l, _measure(), syncScrollArea()

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
Cohesion: 0.17
Nodes (8): clearRange(), decode(), end(), hook(), put(), reset(), _start(), unhook()

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (4): _convertViewportColToCharacterIndex(), getCell(), _getWordAt(), _isCharWordSeparator()

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (10): addLineToLink(), addMarker(), _announceCharacters(), getBufferElements(), markDirty(), registerLink(), _renderRows(), selectionText() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.31
Nodes (6): initServiceWorker(), loadNotificationSettings(), saveNotificationSettings(), subscribeUserToPush(), unsubscribeUserFromPush(), urlBase64ToUint8Array()

### Community 43 - "Community 43"
Cohesion: 0.11
Nodes (18): clearAllMarkers(), clearListeners(), clearMarkers(), delete(), dispose(), _getJoinedRanges(), getKeyIterator(), _handleBufferActivate() (+10 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (3): _cancelCallback(), r(), _requestCallback()

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (5): _addStyle(), _applyMinimumContrast(), getColor(), _getContrastCache(), setColor()

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (4): areSelectionValuesReversed(), finalSelectionEnd(), finalSelectionStart(), _selectToWordAt()

### Community 55 - "Community 55"
Cohesion: 0.26
Nodes (3): getBlankLine(), markAllDirty(), markRangeDirty()

### Community 58 - "Community 58"
Cohesion: 0.15
Nodes (4): createInstance(), enable(), hasRenderer(), setService()

### Community 59 - "Community 59"
Cohesion: 0.11
Nodes (13): activeProtocol(), fillViewportRows(), fire(), getNullCell(), _handleScroll(), loadAddon(), _reflow(), _reflowLarger() (+5 more)

### Community 60 - "Community 60"
Cohesion: 0.21
Nodes (4): addDcsHandler(), addOscHandler(), registerDcsHandler(), registerOscHandler()

## Knowledge Gaps
- **30 isolated node(s):** `filteredSlashCommands`, `State`, `DOM`, `TERMINAL_THEMES`, `AGENT_METADATA` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 38`, `Community 39`, `Community 40`, `Community 43`, `Community 44`, `Community 46`, `Community 49`, `Community 50`, `Community 52`, `Community 53`, `Community 54`, `Community 55`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 63`?**
  _High betweenness centrality (0.299) - this node is a cross-community bridge._
- **Why does `k` connect `Community 1` to `Community 0`, `Community 32`, `Community 2`, `Community 36`, `Community 38`, `Community 40`, `Community 10`, `Community 44`, `Community 49`, `Community 18`, `Community 55`, `Community 59`, `Community 60`, `Community 61`, `Community 63`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `d` connect `Community 8` to `Community 1`, `Community 2`, `Community 38`, `Community 9`, `Community 43`, `Community 13`, `Community 18`, `Community 20`, `Community 23`, `Community 24`, `Community 58`, `Community 59`, `Community 28`, `Community 63`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `d` (e.g. with `.restoreIndexedColor()` and `.setOrReportIndexedColor()`) actually correct?**
  _`d` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Remove ANSI escape sequences from terminal output.`, `Check if Herdr Unix socket is available and responsive.`, `Send a JSON-RPC request to Herdr socket and return parsed response.` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06972789115646258 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0386946386946387 - nodes in this community are weakly interconnected._