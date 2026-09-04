# Graph Report - herdr-web-dashboard  (2026-09-04)

## Corpus Check
- 21 files · ~23,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1137 nodes · 2466 edges · 64 communities (49 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `05a35069`
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
- `handleStateUpdate()` --calls--> `updateChatContent()`  [INFERRED]
  static/js/stream.js → static/js/chat.js
- `renderActiveChatFromTerminal()` --calls--> `escapeHtml()`  [INFERRED]
  static/js/chat.js → static/js/utils.js

## Import Cycles
- None detected.

## Communities (64 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (5): _batchedMemoryCleanup(), getLinkData(), h(), provideLinks(), _reflowSmaller()

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (5): k, markAllDirty(), nextStop(), setgCharset(), setgLevel()

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (23): _(), addRefreshCallback(), clearListeners(), _clearLiveRegion(), compositionend(), compositionupdate(), dispose(), _finalizeComposition() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.31
Nodes (8): _createAccessibilityTreeNode(), _fullRefresh(), _handleBoundaryFocus(), _handleResize(), _refreshRowDimensions(), _refreshRowElements(), _refreshRowsDimensions(), setRenderer()

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (43): appendUserBubble(), renderActiveChatFromTerminal(), scrollChatToBottom(), updateChatContent(), renderChatsList(), setMode(), setScreen(), toggleMode() (+35 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (3): createRow(), i(), v()

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (30): BaseHTTPRequestHandler, check_is_agent(), create_session(), DashboardHandler, ensure_auth_credentials(), ensure_ssl_certificates(), get_aggregated_state(), get_git_branch() (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (22): _cancelCallback(), clear(), clearListeners(), constructor(), debug(), dispose(), error(), _evalLazyOptionalParams() (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (4): c(), clearHandler(), registerHandler(), values()

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (18): _addMouseDownListeners(), _areCoordsInSelection(), _fireEventIfSelectionChanged(), _fireOnSelectionChange(), _getMouseBufferCoords(), getWrappedRangeForLine(), _handleDoubleClick(), _handleIncrementalClick() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (17): 1. Clone & Start, 2. Access from Any Device, 3. Install as Native PWA, 🧭 Adaptive Navigation & Terminal Console, 💬 Conversational Experience & Semantic Parsing, Custom Port or Binding, 🔒 Enterprise-Grade Security, Herdr Web Dashboard 🐏 ⚡ 🔒 (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.21
Nodes (8): clearSelection(), disable(), _dragScroll(), handleTrim(), _removeMouseDownListeners(), selectAll(), selectLines(), setSelection()

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (5): _addCallbacks(), n(), o, provideLinks(), t()

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (11): HerdrClient, Send plain text to a pane and optionally press Enter., Send key combinations like ['enter'], ['ctrl+c'], ['esc'], ['up'], ['down']., Send prompt to a designated agent., Resize the underlying PTY for a pane via ioctl(TIOCSWINSZ) with SIGWINCH., Remove ANSI escape sequences from terminal output., Check if Herdr Unix socket is available and responsive., Send a JSON-RPC request to Herdr socket and return parsed response. (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (4): createInstance(), enable(), hasRenderer(), setService()

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (3): clearTextureAtlas(), P, shouldColumnSelect()

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (3): addOscHandler(), registerOscHandler(), setHandlerFallback()

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (3): fillViewportRows(), init(), o()

### Community 22 - "Community 22"
Cohesion: 0.15
Nodes (12): background_color, categories, description, display, icons, name, orientation, scope (+4 more)

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (4): forEachByKey(), getKeyIterator(), insert(), _search()

### Community 24 - "Community 24"
Cohesion: 0.12
Nodes (5): _cancelCallback(), loadAddon(), r(), _requestCallback(), warn()

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (3): a(), compositionstart(), handleFocus()

### Community 26 - "Community 26"
Cohesion: 0.18
Nodes (11): addDecoration(), _addLineToZone(), _lineAdjacentToZone(), _lineIntersectsZone(), _refreshCanvasDimensions(), _refreshColorZonePadding(), _refreshDecorations(), _refreshDrawConstants() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.13
Nodes (19): areSelectionValuesReversed(), _askForLink(), _checkLinkProviderResult(), _clearCurrentLink(), _createLinkUnderlineEvent(), finalSelectionEnd(), finalSelectionStart(), _fireUnderlineEvent() (+11 more)

### Community 28 - "Community 28"
Cohesion: 0.18
Nodes (4): clearMarkers(), _handleBufferActivate(), l, value()

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (10): _applyScrollModifier(), _bubbleScroll(), _clearSmoothScrollState(), getLinesScrolled(), _getPixelsScrolled(), handleTouchMove(), handleWheel(), scrollLines() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (20): addEncoding(), addProtocol(), clear(), constructor(), _fireOnCanvasResize(), _getCorrectBufferLength(), handleCharSizeChanged(), handleDevicePixelRatioChange() (+12 more)

### Community 33 - "Community 33"
Cohesion: 0.06
Nodes (3): C(), i(), s

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (6): h, n, register(), resolve(), w(), x

### Community 35 - "Community 35"
Cohesion: 0.10
Nodes (4): L, pause(), restartBlinkAnimation(), resume()

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (8): clearRange(), decode(), end(), hook(), put(), reset(), _start(), unhook()

### Community 39 - "Community 39"
Cohesion: 0.15
Nodes (4): event(), register(), _registerDecorationListeners(), _registerDimensionChangeListeners()

### Community 40 - "Community 40"
Cohesion: 0.20
Nodes (7): getBlankLine(), getCss(), getLine(), getNullCell(), getService(), markDirty(), markRangeDirty()

### Community 41 - "Community 41"
Cohesion: 0.60
Nodes (3): initServiceWorker(), subscribeUserToPush(), urlBase64ToUint8Array()

### Community 43 - "Community 43"
Cohesion: 0.22
Nodes (8): _announceCharacters(), _createSelectionElement(), getBufferElements(), handleSelectionChanged(), _renderRows(), selectionText(), translateBufferLineToString(), translateToString()

### Community 44 - "Community 44"
Cohesion: 0.50
Nodes (5): _createElement(), _doRefreshDecorations(), _refreshStyle(), _refreshXPosition(), _renderDecoration()

### Community 46 - "Community 46"
Cohesion: 0.27
Nodes (6): _convertViewportColToCharacterIndex(), getCell(), getJoinedCharacters(), _getWordAt(), _isCharWordSeparator(), _stringRangesToCellRanges()

### Community 49 - "Community 49"
Cohesion: 0.20
Nodes (3): get(), _measure(), syncScrollArea()

### Community 50 - "Community 50"
Cohesion: 0.16
Nodes (5): activeProtocol(), clearAllMarkers(), fire(), _handleScroll(), w()

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (7): error(), _evalLazyOptionalParams(), _getJoinedRanges(), info(), _log(), _mergeRanges(), trace()

### Community 54 - "Community 54"
Cohesion: 0.20
Nodes (8): delete(), deregister(), _removeDecoration(), _removeIntersectingLinks(), _removeMarker(), _removeMarkerFromLink(), unregister(), _wrappedAddonDispose()

### Community 55 - "Community 55"
Cohesion: 0.29
Nodes (5): _reflow(), _reflowLarger(), _reflowLargerAdjustViewport(), resize(), set()

### Community 58 - "Community 58"
Cohesion: 0.40
Nodes (5): _addStyle(), _applyMinimumContrast(), getColor(), _getContrastCache(), setColor()

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (4): debug(), _equalEvents(), triggerBinaryEvent(), triggerMouseEvent()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (4): addLineToLink(), addMarker(), _getEntryIdKey(), registerLink()

## Knowledge Gaps
- **28 isolated node(s):** `State`, `DOM`, `TERMINAL_THEMES`, `name`, `short_name` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_()` connect `Community 2` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 17`, `Community 18`, `Community 19`, `Community 20`, `Community 21`, `Community 23`, `Community 24`, `Community 25`, `Community 26`, `Community 27`, `Community 28`, `Community 29`, `Community 30`, `Community 32`, `Community 38`, `Community 39`, `Community 40`, `Community 43`, `Community 44`, `Community 45`, `Community 46`, `Community 49`, `Community 50`, `Community 52`, `Community 53`, `Community 54`, `Community 55`, `Community 58`, `Community 59`, `Community 60`, `Community 61`, `Community 62`, `Community 63`?**
  _High betweenness centrality (0.322) - this node is a cross-community bridge._
- **Why does `k` connect `Community 1` to `Community 0`, `Community 32`, `Community 2`, `Community 36`, `Community 38`, `Community 40`, `Community 45`, `Community 46`, `Community 50`, `Community 19`, `Community 52`, `Community 20`, `Community 24`, `Community 59`, `Community 60`, `Community 63`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `P` connect `Community 18` to `Community 2`, `Community 39`, `Community 8`, `Community 9`, `Community 45`, `Community 13`, `Community 49`, `Community 50`, `Community 17`, `Community 54`, `Community 30`, `Community 62`, `Community 63`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `d` (e.g. with `.restoreIndexedColor()` and `.setOrReportIndexedColor()`) actually correct?**
  _`d` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Remove ANSI escape sequences from terminal output.`, `Check if Herdr Unix socket is available and responsive.`, `Send a JSON-RPC request to Herdr socket and return parsed response.` to the rest of the system?**
  _47 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06431372549019608 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.043859649122807015 - nodes in this community are weakly interconnected._