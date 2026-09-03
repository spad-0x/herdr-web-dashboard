# Herdr Web Dashboard 🐏 ⚡ 🔒

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-brightgreen.svg)](https://www.python.org/)
[![Universal PWA](https://img.shields.io/badge/PWA-Desktop%20%7C%20Tablet%20%7C%20Mobile-orange.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20external-purple.svg)]()
[![UI Design](https://img.shields.io/badge/design-Cyber--Dark%20Linear-cyan.svg)]()

A high-performance, **universal** Web Dashboard featuring a sleek **Cyber-Dark / Linear** design and a zero-dependency **Progressive Web App (PWA)** architecture.

Specifically engineered to orchestrate **[Herdr](https://github.com/herdr/herdr)** and its fleet of autonomous AI coding agents (`Antigravity CLI / agy`, `Claude Code`, `Codex`) across **all screen sizes and operating systems** — Desktop (macOS, Linux, Windows), Tablets, and Mobile (Android, iOS) — providing a seamless conversational chat interface without sacrificing the underlying power and raw responsiveness of the terminal.

---

## 🌟 Key Features

### 💬 Conversational Experience & Semantic Parsing
- **Terminal → Chat Conversion:** Parses raw terminal output streams in real-time, transforming them into clean, conversational UI bubbles.
- **Smart Accordions for Tools & Thinking:**
  - `🧠 Agent Reasoning`: Collapsible thought blocks to keep the main chat view clean and focused.
  - `⚙️ Tool Call Execution`: Expandable containers showing live status previews (running, completed, failed) and tool parameters.
  - `📦 Code Diffs`: Syntax-highlighted diffs displaying added (`+`) and removed (`-`) lines cleanly.
  - `⚡ Interactive Confirmation`: Inline action buttons (Approve `Y`, Reject `N`) injected directly into the chat flow.

### 🌐 Universal Multi-Platform Design (Desktop, Tablet & Mobile)
- **Responsive Layout:** Automatically adapts between a spacious desktop layout and a touch-optimized mobile view.
- **Desktop Keyboard Shortcuts:**
  - `⌘K` / `Ctrl+K`: Fast workspace & tab picker modal.
  - `⌘1..5` / `Ctrl+1..5`: Instant switching between Chat, Workspaces, Agents Hub, Console, and Settings.
  - `Enter` / `Shift+Enter`: Send prompt / Insert new line.
  - `Esc`: Dismiss open drawers and modals.
- **🎙️ Voice Dictation (Speech-to-Text):** One-tap microphone with multi-language support (English, Italian, Spanish, French, German) powered by native Web Speech APIs.
- **📷 Vision & File Uploads:** Directly attach images, wireframes, screenshots, or UI mockups, injecting them straight into the agent's prompt.
- **🎛️ Quick Action Chips:** A fast-scrolling horizontal carousel for common terminal commands (`✓ Y`, `✗ N`, `⛔ Ctrl+C`, `⎋ Esc`, `⇥ Tab`, `/plan`, `/test`, `/compact`).
- **📳 Haptic Feedback:** Native micro-vibrations on supported mobile and tablet touch devices.

### 🧭 Adaptive Navigation & Terminal Console
- **Slide-over Drawer & Header Navigation:** Unifies workspaces, active tabs, agent status indicators, and settings.
- **Instant Mode Switch (`💬 / 💻`):** Toggle between the parsed intelligent chat interface and the raw terminal console with 1 click or tap.
- **Auto-Agent Detection:** Automatically focuses on the active AI agent tab when launching the dashboard.

### 🔒 Enterprise-Grade Security
- **Zero-Config HTTPS:** Automatically generates a dedicated Root Certificate Authority (CA) and SSL/SAN certificates for local network IPs and localhost.
- **Encrypted Authentication:** SHA-256 + Salt password hashing with full support for browser password managers (1Password, Bitwarden, Google Password Manager, Apple Keychain).
- **Hardened Local Server:** Strict path containment against directory traversal vulnerabilities and memory-safe token storage.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- [Herdr](https://github.com/herdr/herdr) daemon running locally on your host machine.

### 1. Clone & Start

```bash
git clone https://github.com/spad-0x/herdr-web-dashboard.git
cd herdr-web-dashboard

# Start the secure HTTPS server
python3 server.py
```

Upon the first run, `server.py` automatically:
1. Generates local SSL/TLS certificates with Subject Alternative Name (SAN).
2. Generates initial admin credentials (displayed in your terminal output).

### 2. Access from Any Device

Open any modern browser (Chrome, Firefox, Safari, Edge, Brave) and navigate to:

```text
https://<YOUR-HOST-IP>:8088
```

> **Tip:** You can connect over your local Wi-Fi, Ethernet, or via mesh VPNs like [Tailscale](https://tailscale.com/).

### 3. Install as Native PWA

- **Desktop (Chrome/Edge/Brave):** Click the **Install** icon (`⊕`) in the URL address bar.
- **Android (Chrome/Firefox):** Tap **Menu** (`⋮`) → **Install App** / **Add to Home screen**.
- **iOS / iPadOS (Safari):** Tap **Share** (`⎙`) → **Add to Home Screen** (`➕`).

---

## 🛠️ Management & Utility Scripts

### Update Admin Password
```bash
python3 set_password.py
```

### Custom Port or Binding
```bash
# Run on a custom port
python3 server.py --port 9000
```

---

## 📂 Project Structure

```text
herdr-web-dashboard/
├── certs/                 # Auto-generated SSL/TLS certificates (gitignored)
│   ├── ca.crt             # Root CA certificate for local trust
│   ├── cert.pem           # Server certificate with SAN
│   └── key.pem            # Server private key
├── herdr_client.py        # Unix Domain Socket JSON-RPC v20 Client
├── server.py              # Zero-dependency HTTPS Server, SSE Engine & Auth Manager
├── set_password.py        # Interactive CLI password utility
├── static/                # Universal Frontend PWA Assets
│   ├── index.html         # Responsive app shell with Drawer & Safe Area layout
│   ├── style.css          # Universal Cyber-Dark Linear Design System & Themes
│   ├── app.js             # Client Controller, Semantic Parser, STT & Desktop Shortcuts
│   ├── login.html         # Universal Authentication view
│   ├── manifest.json      # Universal PWA Manifest configuration
│   ├── favicon.svg        # Vector app icon
│   └── icon-192.png       # App icons
├── .gitignore             # Comprehensive secrets & environment exclusions
├── LICENSE                # MIT License
└── README.md              # Project Documentation
```

---

## 🎨 Themes Included

Switch themes dynamically from the Settings drawer (`⚙️`):
- 🌌 **Cyber Dark** (Default neon cyan accent)
- 🌃 **Tokyo Night** (Soft indigo palette)
- 🖤 **Obsidian OLED** (Pure black `#000000` power-saving)
- 🌆 **Synthwave** (Vibrant hot magenta)
- 🟢 **Matrix** (Phosphor terminal green)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
