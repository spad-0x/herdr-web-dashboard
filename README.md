# Herdr Mobile WebGUI 🐏 ⚡ 🔒

    A high-performance, mobile-first Web Dashboard featuring a sleek **Cyber-Dark / Linear** design and a zero-dependency
  Progressive Web App (PWA) architecture.

    Specifically engineered to orchestrate **Herdr** and its fleet of autonomous AI coding agents (`Antigravity CLI / agy`,
  `Claude Code`, `Codex`) straight from your smartphone or tablet, providing a seamless chat interface without sacrificing the
  underlying power and raw responsiveness of the terminal.

    ---

    ## 🌟 Key Features

    ### 💬 Chat-Centric Experience & Semantic Parsing
    - **Terminal → Chat Conversion:** Parses raw terminal output streams in real-time, transforming them into clean,
  conversational UI bubbles.
    - **Smart Accordions for Tools & Thinking:**
      - `🧠 Agent Reasoning`: Collapsible thought blocks to keep the main chat view uncluttered.
      - `⚙️ Tool Call Execution`: Expandable containers showing live status previews (running, completed, failed) and tool
  parameters.
      - `📦 Code Diffs`: Syntax-highlighted diffs displaying added (`+`) and removed (`-`) lines cleanly.
      - `⚡ Interactive Confirmation`: Inline action buttons (Approve `Y`, Reject `N`) injected directly into the chat flow.

    ### 📱 Mobile-First Superpowers
    - **🎙️ Voice Dictation (Speech-to-Text):** One-tap microphone with multi-language support (English, Italian, Spanish, French,
  German) powered by native Web Speech APIs.
    - **📷 Vision & Camera Uploads:** Directly attach photos of wireframes, diagrams, or UI mockups using your device camera,
  injecting them straight into the agent's prompt.
    - **🎛️ Quick Action Chips:** A fast-scrolling horizontal carousel for common terminal commands (`✓ Y`, `✗ N`, `⛔ Ctrl+C`, `⎋
  Esc`, `⇥ Tab`, `/plan`, `/test`, `/compact`).
    - **📳 Haptic Feedback:** Native micro-vibrations for touch events and distinct notification patterns when an agent is
  awaiting human input.

    ### 🧭 Native iOS-Style Navigation (Fixed Bottom Bar)
    1. 💬 **Chat**: The active conversation with the agent and quick control panel.
    2. 🗂️ **Workspaces**: Overview of all working directories, new workspace creation, and tab management.
    3. 🤖 **Agents Hub**: Real-time monitoring of all agent statuses with dynamic badges.
    4. 💻 **Console**: Raw terminal view featuring quick copy-to-clipboard, auto-scroll, and virtual modifier keys.
    5. ⚙️ **Settings**: Theme selector (Cyber Dark, Tokyo Night, Obsidian OLED, Synthwave, Matrix) and session management.

    ### 🔒 Enterprise-Grade Security
    - **Zero-Config HTTPS:** Automatically generates Root CA and SSL/SAN certificates for local IPs and localhost to ensure
  secure transit.
    - **Encrypted Authentication:** SHA-256 + Salt hashing for credentials, fully compatible with Keychain, FaceID, and TouchID
  auto-fill.
    - **Standalone PWA:** Optimized manifests and icons for a native app-like installation on iOS and Android Home Screens.
