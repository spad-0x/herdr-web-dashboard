# Herdr Mobile WebGUI 🐏 ⚡ 🔒

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-brightgreen.svg)](https://www.python.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-iOS%20%7C%20Android-orange.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0%20external-purple.svg)]()
[![UI Design](https://img.shields.io/badge/design-Cyber--Dark%20Linear-cyan.svg)]()

A high-performance, mobile-first Web Dashboard featuring a sleek **Cyber-Dark / Linear** design and a zero-dependency **Progressive Web App (PWA)** architecture.

Specifically engineered to orchestrate **[Herdr](https://github.com/herdr/herdr)** and its fleet of autonomous AI coding agents (`Antigravity CLI / agy`, `Claude Code`, `Codex`) straight from your smartphone or tablet, providing a seamless chat interface without sacrificing the underlying power and raw responsiveness of the terminal.

---

## 🌟 Key Features

### 💬 Chat-Centric Experience & Semantic Parsing
- **Terminal → Chat Conversion:** Parses raw terminal output streams in real-time, transforming them into clean, conversational UI bubbles.
- **Smart Accordions for Tools & Thinking:**
  - `🧠 Agent Reasoning`: Collapsible thought blocks to keep the main chat view uncluttered.
  - `⚙️ Tool Call Execution`: Expandable containers showing live status previews (running, completed, failed) and tool parameters.
  - `📦 Code Diffs`: Syntax-highlighted diffs displaying added (`+`) and removed (`-`) lines cleanly.
  - `⚡ Interactive Confirmation`: Inline action buttons (Approve `Y`, Reject `N`) injected directly into the chat flow.

### 📱 Mobile-First Superpowers
- **🎙️ Voice Dictation (Speech-to-Text):** One-tap microphone with multi-language support (English, Italian, Spanish, French, German) powered by native Web Speech APIs.
- **📷 Vision & Camera Uploads:** Directly attach photos of wireframes, diagrams, or UI mockups using your device camera, injecting them straight into the agent's prompt.
- **🎛️ Quick Action Chips:** A fast-scrolling horizontal carousel for common terminal commands (`✓ Y`, `✗ N`, `⛔ Ctrl+C`, `⎋ Esc`, `⇥ Tab`, `/plan`, `/test`, `/compact`).
- **📳 Haptic Feedback:** Native micro-vibrations for touch events and distinct notification patterns when an agent is awaiting human input.

### 🧭 Fullscreen Native App Experience
- **Slide-over Drawer Menu (`☰`):** Maximizes vertical screen real-estate for conversation and composer while keeping workspaces, tabs, agents, and settings accessible in 1 tap.
- **Dynamic Viewport Height (`100dvh`):** Fully integrated with mobile virtual keyboards (`interactive-widget=resizes-content`) and iOS Safe Area insets (`env(safe-area-inset-bottom)`).
- **Instant Console Toggle (`💬 / 💻`):** Switch between the intelligent parsed chat view and the raw CLI terminal stream on the fly.

### 🔒 Enterprise-Grade Security
- **Zero-Config HTTPS:** Automatically generates a dedicated Root Certificate Authority (CA) and SSL/SAN certificates for local network IPs and localhost.
- **Encrypted Authentication:** SHA-256 + Salt password hashing with full support for Apple Keychain, Face ID, and Touch ID auto-fill.
- **Hardened Local Server:** Strict path containment against directory traversal vulnerabilities and memory-safe token storage.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- [Herdr](https://github.com/herdr/herdr) daemon running locally on your Mac / Linux host.

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

### 2. Access from your Smartphone

Open your mobile browser (Safari on iOS or Chrome on Android) and navigate to:

```text
https://<YOUR-LOCAL-IP>:8088
```

> **Tip:** You can connect over your local Wi-Fi or via mesh VPNs like [Tailscale](https://tailscale.com/).

### 3. Install as Native PWA

- **iOS:** Tap **Share** (`⎙`) → **Add to Home Screen** (`➕`).
- **Android:** Tap **Menu** (`⋮`) → **Install App** / **Add to Home screen**.

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
│   ├── ca.crt             # Root CA cert for iOS profile trust
│   ├── cert.pem           # Server certificate with SAN
│   └── key.pem            # Server private key
├── herdr_client.py        # Unix Domain Socket JSON-RPC v20 Client
├── server.py              # Zero-dependency HTTPS Server, SSE Engine & Auth Manager
├── set_password.py        # Interactive CLI password utility
├── static/                # Ultra-lightweight Frontend PWA Assets
│   ├── index.html         # Semantic app shell with Drawer & Safe Area layout
│   ├── style.css          # Cyber-Dark Linear Design System & Theme Presets
│   ├── app.js             # Client Controller, Semantic Parser, STT & Sync Engine
│   ├── login.html         # Cyber-Dark Authentication view (FaceID / Keychain ready)
│   ├── manifest.json      # PWA Manifest configuration
│   ├── favicon.svg        # Vector app icon
│   └── icon-192.png       # PWA Home Screen icons
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
