#!/usr/bin/env python3
"""
Herdr Mobile-First Web Dashboard Server (Multi-threaded HTTPS + Cookie Sessions + SSE Streaming)
Directly integrates with Herdr's Unix Socket API.
"""

import os
import sys
import json
import time
import ssl
import subprocess
import secrets
import hashlib
import base64
try:
    import tomllib
except ImportError:
    import tomli as tomllib
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from http.cookies import SimpleCookie
from herdr_client import HerdrClient

PORT = 8088
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
CERTS_DIR = os.path.join(BASE_DIR, "certs")
AUTH_FILE = os.path.join(BASE_DIR, "auth.json")
HERDR_CONFIG_FILE = os.path.expanduser("~/.config/herdr/config.toml")
SESSIONS_FILE = os.path.join(BASE_DIR, "sessions.json")
CERT_FILE = os.path.join(CERTS_DIR, "cert.pem")
KEY_FILE = os.path.join(CERTS_DIR, "key.pem")
CA_CERT_FILE = os.path.join(CERTS_DIR, "ca.crt")
CA_KEY_FILE = os.path.join(CERTS_DIR, "ca_key.pem")

herdr = HerdrClient()

def send_web_push(title, body, data=None):
    """Send push notification to all registered subscriptions using pywebpush."""
    v_path = os.path.join(BASE_DIR, "vapid_keys.json")
    s_path = os.path.join(BASE_DIR, "push_subscriptions.json")
    if not os.path.exists(v_path) or not os.path.exists(s_path):
        return 0
    try:
        from pywebpush import webpush, WebPushException
        with open(v_path) as f:
            v_keys = json.load(f)
        with open(s_path) as f:
            subs = json.load(f)
        
        priv_key = os.path.join(BASE_DIR, v_keys.get("private_key_file", "private_key.pem"))
        payload_data = json.dumps({
            "title": title,
            "body": body,
            "icon": "/icon-192.png",
            "data": data or {}
        })

        success_count = 0
        valid_subs = []
        for sub in subs:
            try:
                webpush(
                    subscription_info=sub,
                    data=payload_data,
                    vapid_private_key=priv_key,
                    vapid_claims={"sub": "mailto:admin@herdr.local"}
                )
                success_count += 1
                valid_subs.append(sub)
            except WebPushException as ex:
                if ex.response is not None and ex.response.status_code in (404, 410):
                    pass
                else:
                    valid_subs.append(sub)
            except Exception:
                valid_subs.append(sub)

        with open(s_path, "w") as f:
            json.dump(valid_subs, f, indent=2)
        return success_count
    except Exception as e:
        print("[WebPush Error]", e)
        return 0


def ensure_ssl_certificates():
    """Generate Root CA and SAN SSL certificates if they don't already exist."""
    os.makedirs(CERTS_DIR, exist_ok=True)
    
    # 1. Root CA
    if not os.path.exists(CA_CERT_FILE) or not os.path.exists(CA_KEY_FILE):
        print("\n🔒 [SSL] Generazione Root Certificate Authority (CA)...")
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes",
            "-keyout", CA_KEY_FILE, "-out", CA_CERT_FILE, "-days", "3650",
            "-subj", "/CN=Herdr Local CA/O=Herdr/C=IT"
        ], check=True, capture_output=True)
        os.chmod(CA_KEY_FILE, 0o600)
        os.chmod(CA_CERT_FILE, 0o644)

    # 2. Server Certificate signed by CA with SAN IP & localhost
    if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
        print("🔒 [SSL] Generazione certificato Server con SAN per IP locale...")
        ext_file = os.path.join(CERTS_DIR, "san.ext")
        csr_file = os.path.join(CERTS_DIR, "srv.csr")
        
        local_ip = "127.0.0.1"
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
        except Exception:
            pass

        san_content = f"""
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = herdr.local
DNS.3 = *.local
IP.1 = 127.0.0.1
IP.2 = {local_ip}
"""
        with open(ext_file, "w") as f:
            f.write(san_content.strip())

        subprocess.run([
            "openssl", "req", "-newkey", "rsa:2048", "-nodes",
            "-keyout", KEY_FILE, "-out", csr_file,
            "-subj", f"/CN={local_ip}/O=Herdr/C=IT"
        ], check=True, capture_output=True)

        subprocess.run([
            "openssl", "x509", "-req", "-in", csr_file, "-CA", CA_CERT_FILE,
            "-CAkey", CA_KEY_FILE, "-CAcreateserial", "-out", CERT_FILE,
            "-days", "3650", "-extfile", ext_file
        ], check=True, capture_output=True)

        os.chmod(KEY_FILE, 0o600)
        os.chmod(CERT_FILE, 0o644)
        print("✅ [SSL] Certificati pronti.")

def ensure_auth_credentials():
    """Generate admin credentials on first run if auth.json does not exist."""
    if not os.path.exists(AUTH_FILE):
        generated_user = "admin"
        generated_password = "herdr" + secrets.token_hex(4)
        salt = secrets.token_hex(16)
        pwd_hash = hashlib.sha256((salt + generated_password).encode('utf-8')).hexdigest()
        
        auth_data = {
            "username": generated_user,
            "salt": salt,
            "hash": pwd_hash,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        with open(AUTH_FILE, "w") as f:
            json.dump(auth_data, f, indent=2)
        os.chmod(AUTH_FILE, 0o600)

        print("\n" + "=" * 60)
        print("🔐 [SICUREZZA] PRIMO AVVIO - CREDENZIALI CREATE")
        print(f"   👤 Utente: {generated_user} | 🔑 Pwd: {generated_password}")
        print("=" * 60 + "\n")

# Session Storage
def load_sessions():
    if os.path.exists(SESSIONS_FILE):
        try:
            with open(SESSIONS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_sessions(sessions):
    try:
        with open(SESSIONS_FILE, "w") as f:
            json.dump(sessions, f, indent=2)
        os.chmod(SESSIONS_FILE, 0o600)
    except Exception:
        pass

def create_session(username, remember_days=365):
    token = secrets.token_urlsafe(36)
    expires_at = time.time() + (remember_days * 86400)
    sessions = load_sessions()
    sessions[token] = {
        "username": username,
        "expires_at": expires_at,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
    save_sessions(sessions)
    return token, expires_at

def invalidate_session(token):
    sessions = load_sessions()
    if token in sessions:
        del sessions[token]
        save_sessions(sessions)

def is_valid_session(token):
    if not token:
        return False
    sessions = load_sessions()
    sess = sessions.get(token)
    if not sess:
        return False
    if sess.get("expires_at", 0) < time.time():
        del sessions[token]
        save_sessions(sessions)
        return False
    return True

def verify_user_password(username, password):
    if not os.path.exists(AUTH_FILE):
        return False
    try:
        with open(AUTH_FILE, "r") as f:
            auth_data = json.load(f)
        expected_user = auth_data.get("username")
        salt = auth_data.get("salt", "")
        expected_hash = auth_data.get("hash", "")
        computed_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
        return secrets.compare_digest(username, expected_user) and secrets.compare_digest(computed_hash, expected_hash)
    except Exception:
        return False

def get_git_branch(cwd):
    """Fast lookup of current git branch from directory path without subprocess latency."""
    if not cwd or cwd == "~":
        return None
    try:
        curr = os.path.abspath(os.path.expanduser(cwd))
        while curr and curr != "/":
            head_file = os.path.join(curr, ".git", "HEAD")
            if os.path.isfile(head_file):
                with open(head_file, "r") as f:
                    ref = f.read().strip()
                    if ref.startswith("ref: refs/heads/"):
                        return ref.replace("ref: refs/heads/", "")
                    return ref[:8]
            git_file = os.path.join(curr, ".git")
            if os.path.isfile(git_file):
                with open(git_file, "r") as f:
                    c = f.read().strip()
                    if c.startswith("gitdir:"):
                        gitdir = c.split(":", 1)[1].strip()
                        if not os.path.isabs(gitdir):
                            gitdir = os.path.normpath(os.path.join(curr, gitdir))
                        hf = os.path.join(gitdir, "HEAD")
                        if os.path.isfile(hf):
                            with open(hf, "r") as h:
                                ref = h.read().strip()
                                if ref.startswith("ref: refs/heads/"):
                                    return ref.replace("ref: refs/heads/", "")
                                return ref[:8]
            curr = os.path.dirname(curr)
    except Exception:
        pass
    return None

def load_herdr_config():
    """Load ~/.config/herdr/config.toml as dictionary."""
    if not os.path.exists(HERDR_CONFIG_FILE):
        return {}
    try:
        with open(HERDR_CONFIG_FILE, "rb") as f:
            return tomllib.load(f)
    except Exception as e:
        print(f"Error reading {HERDR_CONFIG_FILE}: {e}")
        return {}

def save_herdr_config(cfg):
    """Save dictionary to ~/.config/herdr/config.toml and trigger herdr server reload-config."""
    os.makedirs(os.path.dirname(HERDR_CONFIG_FILE), exist_ok=True)
    lines = []
    
    # Root scalars
    if "onboarding" in cfg:
        lines.append(f"onboarding = {'true' if cfg['onboarding'] else 'false'}")
    
    # [theme]
    theme_sec = cfg.get("theme", {})
    if theme_sec:
        lines.append("\n[theme]")
        if "name" in theme_sec:
            lines.append(f'name = "{theme_sec["name"]}"')
        if "auto_switch" in theme_sec:
            lines.append(f"auto_switch = {'true' if theme_sec['auto_switch'] else 'false'}")
            
    # [ui]
    ui_sec = cfg.get("ui", {})
    if ui_sec:
        lines.append("\n[ui]")
        if "status_indicators" in ui_sec:
            lines.append(f'status_indicators = "{ui_sec["status_indicators"]}"')
        if "pane_borders" in ui_sec:
            lines.append(f"pane_borders = {'true' if ui_sec['pane_borders'] else 'false'}")
        if "pane_outer_borders" in ui_sec:
            lines.append(f"pane_outer_borders = {'true' if ui_sec['pane_outer_borders'] else 'false'}")
        if "pane_scrollbars" in ui_sec:
            lines.append(f"pane_scrollbars = {'true' if ui_sec['pane_scrollbars'] else 'false'}")
        if "pane_gaps" in ui_sec:
            lines.append(f"pane_gaps = {'true' if ui_sec['pane_gaps'] else 'false'}")
        if "show_agent_labels_on_pane_borders" in ui_sec:
            lines.append(f"show_agent_labels_on_pane_borders = {'true' if ui_sec['show_agent_labels_on_pane_borders'] else 'false'}")
        if "agent_panel_sort" in ui_sec:
            lines.append(f'agent_panel_sort = "{ui_sec["agent_panel_sort"]}"')
        if "accent" in ui_sec:
            lines.append(f'accent = "{ui_sec["accent"]}"')

    # [ui.sound]
    sound_sec = ui_sec.get("sound", {})
    if sound_sec or "sound" in cfg:
        s = sound_sec or cfg.get("sound", {})
        lines.append("\n[ui.sound]")
        if "enabled" in s:
            lines.append(f"enabled = {'true' if s['enabled'] else 'false'}")
            
    # [ui.toast]
    toast_sec = ui_sec.get("toast", {})
    if toast_sec or "toast" in cfg:
        t = toast_sec or cfg.get("toast", {})
        lines.append("\n[ui.toast]")
        if "delivery" in t:
            lines.append(f'delivery = "{t["delivery"]}"')
        if "delay_seconds" in t:
            lines.append(f"delay_seconds = {int(t['delay_seconds'])}")

    content = "\n".join(lines).strip() + "\n"
    with open(HERDR_CONFIG_FILE, "w") as f:
        f.write(content)
        
    # Reload herdr running server
    reload_res = {"status": "unsupported"}
    try:
        proc = subprocess.run(["herdr", "server", "reload-config"], capture_output=True, text=True, timeout=5)
        if proc.returncode == 0 and proc.stdout:
            try:
                reload_res = json.loads(proc.stdout)
            except Exception:
                reload_res = {"status": "ok", "raw": proc.stdout}
        else:
            reload_res = {"status": "error", "error": proc.stderr or proc.stdout}
    except Exception as e:
        reload_res = {"status": "error", "error": str(e)}
        
    return reload_res

def get_herdr_integrations():
    """Query herdr integration status for all supported AI agents."""
    try:
        proc = subprocess.run(["herdr", "integration", "status"], capture_output=True, text=True, timeout=5)
        items = []
        for line in proc.stdout.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            name, rest = line.split(":", 1)
            name = name.strip()
            rest = rest.strip()
            installed = not rest.startswith("not installed")
            path = ""
            if "(" in rest and ")" in rest:
                # Get the last parenthesized block which contains the file path
                last_open = rest.rfind("(")
                last_close = rest.rfind(")")
                if last_open != -1 and last_close > last_open:
                    path = rest[last_open + 1:last_close]
            items.append({
                "name": name,
                "installed": installed,
                "path": path,
                "status_text": rest
            })
        return items
    except Exception as e:
        print(f"Error fetching integrations: {e}")
        return []

def get_herdr_plugins():
    """Query herdr plugin list and return list of installed plugins."""
    plugins = []
    try:
        proc = subprocess.run(["herdr", "plugin", "list"], capture_output=True, text=True, timeout=5)
        for line in proc.stdout.splitlines():
            line = line.strip()
            if not line or "No plugins installed" in line or line.startswith("Install and run") or line.startswith("usage:"):
                continue
            plugins.append(line)
    except Exception as e:
        print(f"Error fetching plugins: {e}")

    # Also inspect ~/.config/herdr/plugins
    p_dir = os.path.expanduser("~/.config/herdr/plugins")
    if os.path.isdir(p_dir):
        for item in os.listdir(p_dir):
            if not item.startswith(".") and item not in plugins:
                plugins.append(item)

    return plugins

def check_is_agent(p, p_title, agent_pane_ids):
    """Determine with high confidence whether a pane is running an AI agent or is a raw shell."""
    if p.get("agent"):
        return True
    if p.get("pane_id") in agent_pane_ids:
        return True
    status = p.get("agent_status", "")
    if status in ("working", "blocked"):
        return True
    title_lower = (p_title or "").lower().strip()
    if title_lower in ["zsh", "bash", "fish", "sh", "login", "-zsh", "-bash"]:
        return False
    if "@" in title_lower and ":" in title_lower:
        return False
    for kw in ["agy", "claude", "codex", "gemini", "cursor", "aider", "openhands", "herdr agent"]:
        if kw in title_lower:
            return True
    return False

def get_aggregated_state(lines=1500, source="recent_unwrapped"):
    """Fetch full aggregated state of workspaces, tabs, panes, and detected agents."""
    connected, msg = herdr.is_connected()
    if not connected:
        return {
            "connected": False,
            "socket_path": herdr.socket_path,
            "error": msg,
            "workspaces": [],
            "agents": []
        }

    snapshot = herdr.get_snapshot()
    raw_workspaces = snapshot.get("workspaces", [])
    raw_tabs = snapshot.get("tabs", [])
    raw_panes = snapshot.get("panes", [])
    raw_agents = snapshot.get("agents", [])
    daemon_agent_pane_ids = {a.get("pane_id") for a in raw_agents if a.get("pane_id")}

    focused_ws_id = snapshot.get("focused_workspace_id")
    focused_tab_id = snapshot.get("focused_tab_id")
    focused_pane_id = snapshot.get("focused_pane_id")

    workspaces = []
    all_detected_agents = []

    for ws in raw_workspaces:
        ws_id = ws.get("workspace_id") or ws.get("id")
        ws_label = ws.get("label") or f"Workspace {ws.get('number', 1)}"
        
        ws_tabs = []
        ws_all_panes = []

        ws_matching_tabs = [t for t in raw_tabs if t.get("workspace_id") == ws_id]
        if not ws_matching_tabs:
            ws_matching_tabs = [{"tab_id": f"{ws_id}:t1", "workspace_id": ws_id, "label": "1", "focused": True}]

        for t in ws_matching_tabs:
            t_id = t.get("tab_id")
            t_label = t.get("label") or f"Tab {t.get('number', 1)}"
            t_focused = t.get("focused", False) or (t_id == focused_tab_id)
            
            tab_panes = []
            for p in raw_panes:
                if p.get("workspace_id") == ws_id and (p.get("tab_id") == t_id or not p.get("tab_id")):
                    p_id = p.get("pane_id")
                    p_title = p.get("terminal_title_stripped") or p.get("terminal_title") or f"Pane {p_id}"
                    p_status = p.get("agent_status", "idle")
                    p_agent = p.get("agent")
                    p_cwd = p.get("foreground_cwd") or p.get("cwd") or "~"
                    p_branch = get_git_branch(p_cwd)
                    is_agent = check_is_agent(p, p_title, daemon_agent_pane_ids)
                    
                    p_read = herdr.read_pane(p_id, lines=lines, source=source, format="ansi")
                    raw_content = p_read.get("raw_text", "")
                    clean_content = p_read.get("clean_text", "")
                    revision = p_read.get("revision", 0)

                    clean_tail = clean_content[-400:].lower() if clean_content else ""
                    waiting_confirm = any(kw in clean_tail for kw in [
                        "[y/n]", "(y/n)", "[y,n]", "approve?", "proceed?", "apply these changes", "(yes/no)", "enter to confirm"
                    ])

                    pane_obj = {
                        "pane_id": p_id,
                        "workspace_id": ws_id,
                        "tab_id": t_id,
                        "title": p_title,
                        "command": p.get("terminal_title_stripped") or p.get("terminal_title"),
                        "cwd": p_cwd,
                        "branch": p_branch,
                        "agent": p_agent,
                        "is_agent": is_agent,
                        "status": p_status,
                        "status_label": p_status,
                        "focused": p.get("focused", False) or (p_id == focused_pane_id),
                        "raw_text": raw_content,
                        "clean_text": clean_content,
                        "revision": revision,
                        "waiting_confirm": waiting_confirm,
                        "screen_text": raw_content,
                        "history": raw_content,
                        "lines": p_read.get("lines", [])
                    }
                    tab_panes.append(pane_obj)
                    ws_all_panes.append(pane_obj)

                    if is_agent:
                        all_detected_agents.append({
                            "id": f"agent_{p_id}",
                            "pane_id": p_id,
                            "workspace_id": ws_id,
                            "tab_id": t_id,
                            "ws_name": ws_label,
                            "name": p_agent or p_title,
                            "title": p_title,
                            "status": p_status,
                            "cwd": p_cwd,
                            "branch": p_branch
                        })

            ws_tabs.append({
                "tab_id": t_id,
                "label": t_label,
                "focused": t_focused,
                "panes": tab_panes
            })

        # Derive real workspace CWD from focused pane or any pane in workspace
        ws_cwd = ws.get("cwd")
        if not ws_cwd or ws_cwd == "~":
            for p in raw_panes:
                if p.get("workspace_id") == ws_id and p.get("focused"):
                    ws_cwd = p.get("foreground_cwd") or p.get("cwd")
                    if ws_cwd:
                        break
            if not ws_cwd or ws_cwd == "~":
                for p in raw_panes:
                    if p.get("workspace_id") == ws_id:
                        ws_cwd = p.get("foreground_cwd") or p.get("cwd")
                        if ws_cwd:
                            break
        ws_cwd = ws_cwd or "~"
        ws_branch = get_git_branch(ws_cwd)

        workspaces.append({
            "id": ws_id,
            "name": ws_label,
            "cwd": ws_cwd,
            "branch": ws_branch,
            "focused": ws.get("focused", False) or (ws_id == focused_ws_id),
            "tabs": ws_tabs,
            "panes": ws_all_panes
        })

    return {
        "connected": True,
        "socket_path": herdr.socket_path,
        "version": snapshot.get("version", "0.8.2"),
        "focused_workspace_id": focused_ws_id,
        "focused_tab_id": focused_tab_id,
        "focused_pane_id": focused_pane_id,
        "workspaces": workspaces,
        "agents": all_detected_agents
    }

class DashboardHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, BrokenPipeError, ssl.SSLError):
            pass

    def get_token_from_request(self):
        # 1. URL Query parameter (e.g. for SSE EventSource / iOS Web Clip)
        try:
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)
            if "token" in query and query["token"]:
                return query["token"][0].strip()
        except Exception:
            pass

        # 2. Cookie header
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            cookie = SimpleCookie()
            try:
                cookie.load(cookie_header)
                if "herdr_session" in cookie:
                    return cookie["herdr_session"].value
            except Exception:
                pass

        # 3. Authorization Bearer
        auth_header = self.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header.split(" ", 1)[1].strip()

        # 4. Custom X-Session-Token header
        token_header = self.headers.get("X-Session-Token")
        if token_header:
            return token_header.strip()

        return None

    def check_auth(self):
        token = self.get_token_from_request()
        if is_valid_session(token):
            return True

        auth_header = self.headers.get("Authorization")
        if auth_header and auth_header.startswith("Basic "):
            try:
                encoded = auth_header.split(" ", 1)[1].strip()
                decoded = base64.b64decode(encoded).decode('utf-8')
                u, p = decoded.split(":", 1)
                return verify_user_password(u, p)
            except Exception:
                return False

        return False

    def send_json(self, data, status=200, headers=None):
        try:
            body = json.dumps(data).encode('utf-8')
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token")
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            if headers:
                for k, v in headers.items():
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)
        except (ConnectionResetError, BrokenPipeError):
            pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # Download Root CA Certificate (Cross-Platform Trust)
        if path == "/ca.crt":
            if os.path.isfile(CA_CERT_FILE):
                try:
                    with open(CA_CERT_FILE, "rb") as f:
                        data = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/x-x509-ca-cert")
                    self.send_header("Content-Disposition", "attachment; filename=herdr-ca.crt")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                except Exception:
                    pass
                return

        # Public Apple Touch Icons & Favicons (All variations for iOS Home Screen)
        if path.startswith("/apple-touch-icon"):
            return self.serve_static_file("apple-touch-icon.png")
        if path == "/favicon.ico":
            return self.serve_static_file("icon-192.png")

        # Public Login Page & Static Assets
        if path in ("/login", "/login.html"):
            if self.check_auth():
                self.send_response(302)
                self.send_header("Location", "/")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            return self.serve_static_file("login.html")

        if path in ("/manifest.json", "/style.css", "/app.js", "/favicon.svg", "/icon-192.png", "/icon-512.png") or path.endswith(".js") or path.endswith(".css") or path.endswith(".png") or path.endswith(".svg"):
            return self.serve_static_file(path.lstrip("/"))

        # Authentication Check
        if not self.check_auth():
            if path.startswith("/api/"):
                return self.send_json({"error": "Unauthorized", "message": "Effettua il login."}, status=401)
            else:
                self.send_response(302)
                self.send_header("Location", "/login")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        # API: SSE Live Stream
        if path == "/api/stream":
            try:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache, no-transform")
                self.send_header("Connection", "keep-alive")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Accel-Buffering", "no")
                self.end_headers()

                last_hash = None
                while True:
                    state = get_aggregated_state(lines=1500)
                    state_json = json.dumps(state)
                    cur_hash = hashlib.md5(state_json.encode('utf-8')).hexdigest()

                    # Send update if state changed or heartbeat
                    if cur_hash != last_hash:
                        last_hash = cur_hash
                        msg = f"event: state\ndata: {state_json}\n\n"
                        self.wfile.write(msg.encode('utf-8'))
                        self.wfile.flush()
                    else:
                        # Ping keep-alive
                        self.wfile.write(b": keepalive\n\n")
                        self.wfile.flush()

                    time.sleep(0.3)
            except (ConnectionResetError, BrokenPipeError, ssl.SSLError):
                pass
            return

        # API: Serve Local Files (Images/Uploads) - Hardened against Path Traversal
        if path == "/api/file":
            file_path = query.get("path", [None])[0]
            if file_path:
                norm_path = os.path.realpath(os.path.abspath(file_path))
                allowed_uploads_dir = os.path.realpath(os.path.expanduser("~/.config/herdr/uploads"))
                allowed_static_dir = os.path.realpath(STATIC_DIR)
                
                # Check path containment
                is_safe = norm_path.startswith(allowed_uploads_dir) or norm_path.startswith(allowed_static_dir)
                if is_safe and os.path.isfile(norm_path):
                    try:
                        with open(norm_path, "rb") as f:
                            data = f.read()
                        self.send_response(200)
                        if norm_path.endswith(".png"):
                            self.send_header("Content-Type", "image/png")
                        elif norm_path.endswith(".jpg") or norm_path.endswith(".jpeg"):
                            self.send_header("Content-Type", "image/jpeg")
                        elif norm_path.endswith(".gif"):
                            self.send_header("Content-Type", "image/gif")
                        elif norm_path.endswith(".webp"):
                            self.send_header("Content-Type", "image/webp")
                        elif norm_path.endswith(".svg"):
                            self.send_header("Content-Type", "image/svg+xml")
                        else:
                            self.send_header("Content-Type", "application/octet-stream")
                        self.send_header("Content-Length", str(len(data)))
                        self.send_header("Cache-Control", "private, max-age=3600")
                        self.end_headers()
                        self.wfile.write(data)
                        return
                    except Exception:
                        pass
            self.send_response(404)
            self.end_headers()
            return

        # API: Status
        if path == "/api/status":
            connected, msg = herdr.is_connected()
            return self.send_json({
                "connected": connected,
                "socket_path": herdr.socket_path,
                "message": msg
            })

        # API: Read single pane output
        if path == "/api/pane/read":
            pane_id = query.get("pane_id", [None])[0]
            lines = int(query.get("lines", [2000])[0])
            source = query.get("source", ["recent_unwrapped"])[0]
            if not pane_id:
                return self.send_json({"error": "Missing pane_id"}, status=400)
            
            read_data = herdr.read_pane(pane_id, lines=lines, source=source)
            return self.send_json(read_data)

        # API: Aggregated state for mobile app
        if path == "/api/push/public-key":
            if os.path.exists("vapid_keys.json"):
                with open("vapid_keys.json") as f:
                    keys = json.load(f)
                return self.send_json({"publicKey": keys.get("public_key", "")})
            return self.send_json({"error": "VAPID keys not configured"}, status=404)

        if path == "/api/state":
            lines = int(query.get("lines", [1500])[0])
            source = query.get("source", ["recent_unwrapped"])[0]
            state = get_aggregated_state(lines=lines, source=source)
            return self.send_json(state)

        # API: Herdr Configuration & Settings
        if path == "/api/config":
            cfg = load_herdr_config()
            return self.send_json({
                "config": cfg,
                "config_path": HERDR_CONFIG_FILE,
                "supported_themes": [
                    "catppuccin", "terminal", "tokyo-night", "dracula", "nord",
                    "gruvbox", "one-dark", "solarized", "kanagawa", "rose-pine",
                    "vesper"
                ]
            })

        # API: Integrations Status
        if path == "/api/integrations":
            items = get_herdr_integrations()
            return self.send_json({"integrations": items})

        # API: Plugins List
        if path == "/api/plugins":
            plugins = get_herdr_plugins()
            return self.send_json({"plugins": plugins})

        # Serve Application Dashboard
        if path in ("/", "/index.html"):
            return self.serve_static_file("index.html")

        return self.serve_static_file(path.lstrip("/"))

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        payload = json.loads(body) if body else {}

        # API: Login
        if parsed.path == "/api/login":
            username = payload.get("username", "").strip()
            password = payload.get("password", "")
            remember = payload.get("remember", True)

            if verify_user_password(username, password):
                token, expires_at = create_session(username, remember_days=365 if remember else 1)
                cookie_max_age = 31536000 if remember else 86400
                cookie_header = f"herdr_session={token}; Path=/; Max-Age={cookie_max_age}; SameSite=Lax; Secure; HttpOnly"
                
                return self.send_json({
                    "success": True,
                    "token": token,
                    "username": username,
                    "expires_at": expires_at
                }, headers={"Set-Cookie": cookie_header})
            else:
                return self.send_json({"success": False, "message": "Nome utente o password errati."}, status=401)

        # API: Logout
        if parsed.path == "/api/logout":
            token = self.get_token_from_request()
            if token:
                invalidate_session(token)
            cookie_header = "herdr_session=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly"
            return self.send_json({"success": True}, headers={"Set-Cookie": cookie_header})

        # Protected POST routes
        if not self.check_auth():
            return self.send_json({"error": "Unauthorized"}, status=401)

        # Push Notifications Subscription & Test
        if parsed.path == "/api/push/subscribe":
            sub = payload.get("subscription")
            if not sub or not sub.get("endpoint"):
                return self.send_json({"error": "Invalid subscription"}, status=400)
            
            subs = []
            if os.path.exists("push_subscriptions.json"):
                try:
                    with open("push_subscriptions.json") as f:
                        subs = json.load(f)
                except Exception:
                    subs = []
            
            # Avoid duplicate endpoints
            subs = [s for s in subs if s.get("endpoint") != sub.get("endpoint")]
            subs.append(sub)
            with open("push_subscriptions.json", "w") as f:
                json.dump(subs, f, indent=2)
            return self.send_json({"success": True, "count": len(subs)})

        if parsed.path == "/api/push/test":
            title = payload.get("title", "⚡ Herdr Test")
            body = payload.get("body", "Questo è un test push inviato direttamente dal server!")
            sent = send_web_push(title, body)
            return self.send_json({"success": True, "sent": sent})

        # Send text to a pane
        if parsed.path in ("/api/pane/text", "/api/pane/input"):
            pane_id = payload.get("pane_id")
            text = payload.get("text", payload.get("input", ""))
            auto_enter = payload.get("auto_enter", True)
            if not pane_id:
                return self.send_json({"error": "Missing pane_id"}, status=400)
            
            res = herdr.send_text(pane_id, text, auto_enter=auto_enter)
            return self.send_json(res)

        # Send key chords to a pane
        if parsed.path == "/api/pane/keys":
            pane_id = payload.get("pane_id")
            keys = payload.get("keys", [])
            if not pane_id or not keys:
                return self.send_json({"error": "Missing pane_id or keys"}, status=400)
                
            res = herdr.send_keys(pane_id, keys)
            return self.send_json(res)

        # Workspace Management
        if parsed.path == "/api/workspace/create":
            cwd = payload.get("cwd", os.path.expanduser("~"))
            label = payload.get("label")
            res = herdr.workspace_create(cwd, label)
            return self.send_json(res)

        if parsed.path == "/api/workspace/close":
            ws_id = payload.get("workspace_id")
            res = herdr.workspace_close(ws_id)
            return self.send_json(res)

        if parsed.path == "/api/workspace/focus":
            ws_id = payload.get("workspace_id")
            res = herdr.workspace_focus(ws_id)
            return self.send_json(res)

        # Tab Management
        if parsed.path == "/api/tab/create":
            ws_id = payload.get("workspace_id")
            label = payload.get("label", "tab")
            res = herdr.tab_create(ws_id, label)
            return self.send_json(res)

        if parsed.path == "/api/tab/close":
            tab_id = payload.get("tab_id")
            res = herdr.tab_close(tab_id)
            return self.send_json(res)

        if parsed.path == "/api/tab/focus":
            tab_id = payload.get("tab_id")
            res = herdr.tab_focus(tab_id)
            return self.send_json(res)

        # Pane Management
        if parsed.path == "/api/pane/focus":
            pane_id = payload.get("pane_id")
            res = herdr.pane_focus(pane_id)
            return self.send_json(res)

        if parsed.path == "/api/pane/split":
            pane_id = payload.get("pane_id")
            direction = payload.get("direction", "right")
            res = herdr.pane_split(pane_id, direction=direction)
            return self.send_json(res)

        if parsed.path == "/api/pane/close":
            pane_id = payload.get("pane_id")
            res = herdr.pane_close(pane_id)
            return self.send_json(res)

        # Upload Management (Images/Files)
        if parsed.path == "/api/upload":
            image_data = payload.get("image")
            filename = payload.get("filename", "upload.png")
            
            if not image_data:
                return self.send_json({"error": "Missing image data"}, status=400)
                
            try:
                uploads_dir = os.path.expanduser("~/.config/herdr/uploads")
                os.makedirs(uploads_dir, exist_ok=True)
                
                if "," in image_data:
                    header, base64_str = image_data.split(",", 1)
                else:
                    base64_str = image_data
                    
                ext = ".png"
                if "image/jpeg" in image_data:
                    ext = ".jpg"
                elif "image/gif" in image_data:
                    ext = ".gif"
                elif "image/webp" in image_data:
                    ext = ".webp"
                    
                unique_filename = f"{secrets.token_hex(4)}_{filename}"
                if not unique_filename.endswith(ext):
                    unique_filename += ext
                    
                file_path = os.path.join(uploads_dir, unique_filename)
                
                with open(file_path, "wb") as f:
                    f.write(base64.b64decode(base64_str))
                    
                return self.send_json({
                    "success": True,
                    "file_path": file_path,
                    "filename": unique_filename,
                    "url": f"/api/file?path={file_path}"
                })
            except Exception as e:
                return self.send_json({"error": str(e)}, status=500)

        # API: Update Herdr Configuration
        if parsed.path == "/api/config/update":
            updates = payload.get("config", {})
            if not isinstance(updates, dict):
                return self.send_json({"error": "Invalid config payload"}, status=400)
                
            current_cfg = load_herdr_config()
            # Deep merge sections
            for k, v in updates.items():
                if isinstance(v, dict) and isinstance(current_cfg.get(k), dict):
                    current_cfg[k].update(v)
                else:
                    current_cfg[k] = v
                    
            res = save_herdr_config(current_cfg)
            return self.send_json({"success": True, "config": current_cfg, "reload": res})

        # API: Manage Herdr Agent Integrations (install/uninstall)
        herdr_env = os.environ.copy()
        herdr_env["PATH"] = f"/Library/Developer/CommandLineTools/usr/bin:/Library/Developer/CommandLineTools/usr/libexec/git-core:{os.path.expanduser('~/.local/bin')}:{herdr_env.get('PATH', '')}"
        herdr_env["GIT_EXEC_PATH"] = "/Library/Developer/CommandLineTools/usr/libexec/git-core"

        if parsed.path == "/api/integration/install":
            name = payload.get("name")
            if not name:
                return self.send_json({"error": "Missing agent name"}, status=400)
            try:
                proc = subprocess.run(["herdr", "integration", "install", name], env=herdr_env, capture_output=True, text=True, timeout=15)
                success = (proc.returncode == 0)
                msg = (proc.stdout or proc.stderr or "").strip()
                return self.send_json({"success": success, "output": msg, "error": msg if not success else None})
            except Exception as e:
                return self.send_json({"error": str(e)}, status=500)

        if parsed.path == "/api/integration/uninstall":
            name = payload.get("name")
            if not name:
                return self.send_json({"error": "Missing agent name"}, status=400)
            try:
                proc = subprocess.run(["herdr", "integration", "uninstall", name], env=herdr_env, capture_output=True, text=True, timeout=15)
                success = (proc.returncode == 0)
                msg = (proc.stdout or proc.stderr or "").strip()
                return self.send_json({"success": success, "output": msg, "error": msg if not success else None})
            except Exception as e:
                return self.send_json({"error": str(e)}, status=500)

        # API: Manage Herdr Plugins (install/uninstall)
        if parsed.path == "/api/plugin/install":
            repo = payload.get("repo")
            if not repo:
                return self.send_json({"error": "Missing plugin repository (owner/repo)"}, status=400)
            try:
                proc = subprocess.run(["herdr", "plugin", "install", repo, "-y"], env=herdr_env, capture_output=True, text=True, timeout=30)
                success = (proc.returncode == 0)
                msg = (proc.stdout or proc.stderr or "").strip()
                return self.send_json({"success": success, "output": msg, "error": msg if not success else None})
            except Exception as e:
                return self.send_json({"error": str(e)}, status=500)

        if parsed.path == "/api/plugin/uninstall":
            name = payload.get("name")
            if not name:
                return self.send_json({"error": "Missing plugin name"}, status=400)
            try:
                proc = subprocess.run(["herdr", "plugin", "uninstall", name], env=herdr_env, capture_output=True, text=True, timeout=15)
                success = (proc.returncode == 0)
                msg = (proc.stdout or proc.stderr or "").strip()
                return self.send_json({"success": success, "output": msg, "error": msg if not success else None})
            except Exception as e:
                return self.send_json({"error": str(e)}, status=500)

        self.send_response(404)
        self.end_headers()

    def serve_static_file(self, filename):
        file_path = os.path.join(STATIC_DIR, filename)
        if os.path.isfile(file_path):
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                if file_path.endswith(".html"):
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                elif file_path.endswith(".css"):
                    self.send_header("Content-Type", "text/css; charset=utf-8")
                elif file_path.endswith(".js"):
                    self.send_header("Content-Type", "application/javascript; charset=utf-8")
                elif file_path.endswith(".json"):
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                elif file_path.endswith(".png"):
                    self.send_header("Content-Type", "image/png")
                elif file_path.endswith(".svg"):
                    self.send_header("Content-Type", "image/svg+xml")
                elif file_path.endswith(".ico"):
                    self.send_header("Content-Type", "image/x-icon")
                elif file_path.endswith(".webp"):
                    self.send_header("Content-Type", "image/webp")
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")
                self.end_headers()
                self.wfile.write(content)
            except Exception:
                pass
            return

        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"404 Not Found")


# Background thread to monitor agent states and push notifications to idle/standby devices
_last_pane_states = {}

def monitor_agents_background():
    global _last_pane_states
    while True:
        try:
            state = get_aggregated_state(lines=100)
            workspaces = state.get("workspaces", [])
            current_states = {}
            for ws in workspaces:
                ws_name = ws.get("name") or f"Workspace {ws.get('id')}"
                ws_id = ws.get("id")
                panes = []
                if ws.get("panes"):
                    panes.extend(ws.get("panes"))
                for tab in ws.get("tabs", []):
                    if tab.get("panes"):
                        panes.extend(tab.get("panes"))
                
                for p in panes:
                    pid = p.get("pane_id")
                    if not pid: continue
                    title = p.get("agent") or p.get("title") or p.get("command") or f"Agente {pid}"
                    is_running = bool(p.get("is_running") or p.get("status") == "working")
                    waiting_confirm = bool(p.get("waiting_confirm") or p.get("status") in ("waiting_confirm", "confirm", "blocked"))
                    current_states[pid] = {
                        "title": title,
                        "ws_name": ws_name,
                        "ws_id": ws_id,
                        "is_running": is_running,
                        "waiting_confirm": waiting_confirm
                    }

            for pid, curr in current_states.items():
                prev = _last_pane_states.get(pid)
                if prev:
                    # Case 1: Agent asks confirmation
                    if not prev["waiting_confirm"] and curr["waiting_confirm"]:
                        send_web_push(
                            f"⚠️ Richiesta Conferma: {curr['title']}",
                            "L agente richiede la tua autorizzazione per procedere.",
                            {"paneId": pid, "workspaceId": curr["ws_id"]}
                        )
                    # Case 2: Agent completed task
                    elif prev["is_running"] and not curr["is_running"] and not curr["waiting_confirm"]:
                        send_web_push(
                            f"✅ Task Completato: {curr['title']}",
                            "L agente ha terminato con successo!",
                        )

            _last_pane_states = current_states
        except Exception:
            pass
        time.sleep(1.0)

def run_server():
    import threading
    threading.Thread(target=monitor_agents_background, daemon=True).start()
    ensure_ssl_certificates()
    ensure_auth_credentials()

    server_address = ('0.0.0.0', PORT)
    httpd = ThreadingHTTPServer(server_address, DashboardHandler)
    
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(certfile=CERT_FILE, keyfile=KEY_FILE)
    httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

    print(f"🚀 [HTTPS Multi-Threaded] Server attivo su https://0.0.0.0:{PORT}")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
