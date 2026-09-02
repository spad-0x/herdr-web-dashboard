# Herdr Mobile WebGUI 🐏 ⚡ 🔒

Una Web Dashboard mobile-first, ad alte prestazioni, con design **Cyber-Dark / Linear** e architettura PWA a zero dipendenze esterne. Progettata specificamente per orchestrare **Herdr** e i suoi agenti autonomi (`Antigravity CLI / agy`, `Claude Code`, `Codex`) da smartphone e tablet senza perdere la reattività del terminale.

---

## 🌟 Caratteristiche Principali

### 💬 Esperienza Chat-Centrica & Parser Semantico
- **Conversione Terminale → Chat**: trasforma in tempo reale l'output raw dei terminali in schede conversazionali chiare.
- **Accordion Intelligenti per Tool & Thinking**:
  - `🧠 Ragionamento Agente`: blocchi di pensiero espandibili per non intasare la schermata.
  - `⚙️ Tool Call Execution`: box collassabili con anteprima di stato (in esecuzione, completato, errore) e parametri.
  - `📦 Diff di Codice`: evidenziazione sintattica delle righe aggiunte (`+`) e rimosse (`-`).
  - `⚡ Conferma Interattiva`: bottoni di azione immediata (Approva `Y`, Rifiuta `N`) direttamente nel messaggio.

### 📱 Superpoteri Mobile-First
- **🎙️ Dettatura Vocale (Speech-to-Text)**: microfono one-tap con supporto multilingua (Italiano, Inglese, Spagnolo, Francese, Tedesco) basato su Web Speech API.
- **📷 Vision & Upload Fotocamera**: pulsante fotocamera e galleria per allegare foto di diagrammi, screenshot o mockup e iniettarli direttamente nel prompt dell'agente.
- **🎛️ Action Chips Rapidi**: carosello orizzontale a scorrimento rapido con comandi (`✓ Y`, `✗ N`, `⛔ Ctrl+C`, `⎋ Esc`, `⇥ Tab`, `/plan`, `/test`, `/compact`).
- **📳 Feedback Aptico**: micro-vibrazioni native sui tocchi e pattern di notifica quando un agente attende input.

### 🧭 Navigazione Stile iOS Nativo (Fixed Bottom Bar)
1. 💬 **Chat**: conversazione attiva con l'agente e pannello di controllo rapido.
2. 🗂️ **Spazi (Workspaces)**: panoramica di tutte le directory di lavoro, creazione nuovi workspace e gestione tab.
3. 🤖 **Agenti Hub**: monitoraggio dello stato di tutti gli agenti con badge dinamico in tempo reale.
4. 💻 **Console**: visualizzazione raw del terminale con copia rapida negli appunti, auto-scroll e tasti virtuali.
5. ⚙️ **Opzioni**: selettore temi (Cyber Dark, Tokyo Night, Obsidian OLED, Synthwave, Matrix) e gestione sessione.

### 🔒 Sicurezza & Rivendibilità
- **HTTPS & Certificati SSL/SAN Automatici**: genera automaticamente Root CA e certificati server per IP locale e localhost.
- **Autenticazione con Sessioni Crittografate**: hashing SHA-256 + Salt con supporto Portachiavi e FaceID/TouchID.
- **PWA Standalone Installabile**: manifest e icone ottimizzate per l'installazione su schermata Home iOS/Android.

---

## 🚀 Avvio Rapido

1. **Avvia il demone Herdr** (se non già attivo):
   ```bash
   herdr
   ```

2. **Avvia il server sicuro HTTPS**:
   ```bash
   python3 server.py
   ```

3. **Apri dal tuo smartphone** (tramite Wi-Fi locale o Tailscale):
   ```text
   https://<IP-DEL-TUO-MAC>:8088
   ```
   *(Al primo accesso accetta il certificato e inserisci le credenziali create al primo avvio).*

4. **Per aggiornare le credenziali di accesso**:
   ```bash
   python3 set_password.py
   ```

---

## 📂 Struttura del Progetto

```text
herdr-web-dashboard/
├── certs/                 # Certificati SSL/TLS generati automaticamente (gitignored)
│   ├── ca.crt             # Certificato Root CA scaricabile per trust iOS
│   ├── cert.pem           # Certificato server con SAN
│   └── key.pem            # Chiave privata server
├── auth.json              # Credenziali crittografate SHA-256 + Salt (gitignored)
├── sessions.json          # Sessioni attive crittografate (gitignored)
├── herdr_client.py        # Client JSON-RPC per socket Unix Herdr (Protocol v20)
├── server.py              # Server HTTPS multi-thread, SSE Streaming & Upload API
├── set_password.py        # Script rapido per aggiornare nome utente e password
├── static/                # Frontend PWA Ultra-Leggera
│   ├── index.html         # Shell semantica con Bottom Tab Bar e Viewport Safe Area
│   ├── style.css          # Design System Cyber-Dark, Glassmorphism, Temi e Transizioni
│   ├── app.js             # Controller, Parser Semantico, Speech-to-Text, Upload & Sync
│   ├── login.html         # Schermata di login con FaceID / Portachiavi
│   ├── manifest.json      # Manifest PWA
│   ├── favicon.svg        # Favicon vettoriale
│   └── icon-192.png       # Icone PWA
├── .gitignore
└── README.md
```
