# Graph Report - herdr-web-dashboard  (2026-09-04)

## Corpus Check
- 20 files · ~20,707 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 916 nodes · 2042 edges · 59 communities (43 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cfcb6eed`
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
- [[_COMMUNITY_Community 36|Community 36]]
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
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 58|Community 58]]

## God Nodes (most connected - your core abstractions)
1. `_()` - 296 edges
2. `k` - 105 edges
3. `d` - 65 edges
4. `fire()` - 64 edges
5. `P` - 55 edges
6. `i()` - 45 edges
7. `constructor()` - 42 edges
8. `s()` - 41 edges
9. `n()` - 38 edges
10. `c()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `DashboardHandler` --uses--> `HerdrClient`  [INFERRED]
  server.py → herdr_client.py
- `handleStateUpdate()` --calls--> `renderTabs()`  [INFERRED]
  static/js/stream.js → static/js/input-bar.js
- `setAttachment()` --calls--> `formatBytes()`  [INFERRED]
  static/js/input-bar.js → static/js/utils.js
- `handleStateUpdate()` --calls--> `updateChatContent()`  [INFERRED]
  static/js/stream.js → static/js/chat.js
- `renderActiveChatFromTerminal()` --calls--> `escapeHtml()`  [INFERRED]
  static/js/chat.js → static/js/utils.js

## Import Cycles
- None detected.

## Communities (59 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (5): getNullCell(), markDirty(), _reflow(), _reflowLarger(), _reflowLargerAdjustViewport()

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (22): _(), addRefreshCallback(), clearListeners(), _clearLiveRegion(), compositionupdate(), dispose(), _equalEvents(), flush() (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (37): appendUserBubble(), renderActiveChatFromTerminal(), scrollChatToBottom(), updateChatContent(), renderChatsList(), setMode(), setScreen(), toggleMode() (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (10): _addStyle(), _applyMinimumContrast(), createRow(), getColor(), _getContrastCache(), i(), modifyColors(), restoreColor() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (30): BaseHTTPRequestHandler, check_is_agent(), create_session(), DashboardHandler, ensure_auth_credentials(), ensure_ssl_certificates(), get_aggregated_state(), get_git_branch() (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (10): HerdrClient, Send plain text to a pane and optionally press Enter., Send key combinations like ['enter'], ['ctrl+c'], ['esc'], ['up'], ['down']., Send prompt to a designated agent., Remove ANSI escape sequences from terminal output., Check if Herdr Unix socket is available and responsive., Send a JSON-RPC request to Herdr socket and return parsed response., Fetch session.snapshot containing full tree of workspaces, tabs, panes and agent (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (3): c(), clearHandler(), registerHandler()

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (18): _addMouseDownListeners(), _areCoordsInSelection(), _fireEventIfSelectionChanged(), _fireOnSelectionChange(), _getMouseBufferCoords(), getWrappedRangeForLine(), _handleDoubleClick(), _handleIncrementalClick() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): 1. Clone & Start, 2. Access from Any Device, 3. Install as Native PWA, 🧭 Adaptive Navigation & Terminal Console, 💬 Conversational Experience & Semantic Parsing, Custom Port or Binding, 🔒 Enterprise-Grade Security, Herdr Web Dashboard 🐏 ⚡ 🔒 (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.18
Nodes (5): activeProtocol(), fire(), _handleScroll(), resize(), w()

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (4): event(), register(), _registerDecorationListeners(), _registerDimensionChangeListeners()

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (5): _addCallbacks(), n(), o, provideLinks(), t()

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (4): createInstance(), enable(), hasRenderer(), setService()

### Community 18 - "Community 18"
Cohesion: 0.20
Nodes (6): addLineToLink(), addMarker(), _getEntryIdKey(), insert(), loadAddon(), registerLink()

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (3): addOscHandler(), registerOscHandler(), setHandlerFallback()

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (7): error(), _evalLazyOptionalParams(), _getJoinedRanges(), info(), _log(), _mergeRanges(), trace()

### Community 21 - "Community 21"
Cohesion: 0.08
Nodes (8): clear(), fillViewportRows(), get(), _getCorrectBufferLength(), init(), _measure(), o(), syncScrollArea()

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, name, orientation, scope (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (17): addEncoding(), addProtocol(), constructor(), _fireOnCanvasResize(), handleCharSizeChanged(), handleDevicePixelRatioChange(), _handleOptionsChanged(), _handleThemeChange() (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.21
Nodes (9): clearTextureAtlas(), _createAccessibilityTreeNode(), _fullRefresh(), _handleBoundaryFocus(), _handleResize(), _refreshRowDimensions(), _refreshRowElements(), _refreshRowsDimensions() (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): addDecoration(), _addLineToZone(), _lineAdjacentToZone(), _lineIntersectsZone(), _refreshCanvasDimensions(), _refreshColorZonePadding(), _refreshDecorations(), _refreshDrawConstants() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (17): areSelectionValuesReversed(), _clearCurrentLink(), _createLinkUnderlineEvent(), finalSelectionEnd(), finalSelectionStart(), _fireUnderlineEvent(), getCoords(), _getMouseEventScrollAmount() (+9 more)

### Community 28 - "Community 28"
Cohesion: 0.13
Nodes (14): _askForLink(), _batchedMemoryCleanup(), _checkLinkProviderResult(), getBufferElements(), getCss(), getLine(), getLinkData(), getService() (+6 more)

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (10): _applyScrollModifier(), _bubbleScroll(), _clearSmoothScrollState(), getLinesScrolled(), _getPixelsScrolled(), handleTouchMove(), handleWheel(), scrollLines() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (10): clearSelection(), deregister(), disable(), _dragScroll(), handleTrim(), _refreshRows(), _removeMouseDownListeners(), selectAll() (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.17
Nodes (4): clearAllMarkers(), _handleBufferActivate(), l, value()

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (3): addEscHandler(), registerEscHandler(), values()

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (4): _cancelCallback(), r(), _requestCallback(), set()

### Community 36 - "Community 36"
Cohesion: 0.27
Nodes (6): _convertViewportColToCharacterIndex(), getCell(), getJoinedCharacters(), _getWordAt(), _isCharWordSeparator(), _stringRangesToCellRanges()

### Community 38 - "Community 38"
Cohesion: 0.16
Nodes (8): clearRange(), decode(), end(), hook(), put(), reset(), _start(), unhook()

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (10): clearMarkers(), delete(), getBlankLine(), markRangeDirty(), _removeDecoration(), _removeMarker(), _removeMarkerFromLink(), scroll() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.60
Nodes (3): initServiceWorker(), subscribeUserToPush(), urlBase64ToUint8Array()

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (4): _announceCharacters(), _createSelectionElement(), handleSelectionChanged(), _renderRows()

### Community 44 - "Community 44"
Cohesion: 0.50
Nodes (5): _createElement(), _doRefreshDecorations(), _refreshStyle(), _refreshXPosition(), _renderDecoration()

### Community 46 - "Community 46"
Cohesion: 0.50
Nodes (4): compositionend(), _finalizeComposition(), _handleAnyTextareaChanges(), keydown()

### Community 49 - "Community 49"
Cohesion: 0.25
Nodes (3): compositionstart(), handleFocus(), shouldColumnSelect()

### Community 54 - "Community 54"
Cohesion: 0.40
Nodes (3): forEachByKey(), getKeyIterator(), _search()

## Knowledge Gaps
- **28 isolated node(s):** `State`, `DOM`, `TERMINAL_THEMES`, `name`, `short_name` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 31`, `Community 32`, `Community 33`, `Community 34`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 49`, `Community 50`, `Community 52`, `Community 54`, `Community 55`, `Community 58`?**
  _High betweenness centrality (0.492) - this node is a cross-community bridge._
- **Why does `k` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 13`, `Community 18`, `Community 19`, `Community 28`, `Community 32`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 40`, `Community 45`, `Community 50`, `Community 51`, `Community 52`, `Community 58`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Why does `d` connect `Community 8` to `Community 2`, `Community 3`, `Community 37`, `Community 38`, `Community 9`, `Community 15`, `Community 49`, `Community 17`, `Community 18`, `Community 21`, `Community 23`, `Community 24`, `Community 30`, `Community 31`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `d` (e.g. with `.restoreIndexedColor()` and `.setOrReportIndexedColor()`) actually correct?**
  _`d` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Remove ANSI escape sequences from terminal output.`, `Check if Herdr Unix socket is available and responsive.`, `Send a JSON-RPC request to Herdr socket and return parsed response.` to the rest of the system?**
  _46 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.0907563025210084 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.04415584415584416 - nodes in this community are weakly interconnected._