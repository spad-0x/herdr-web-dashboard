#!/usr/bin/env python3
"""
Herdr API Client - Protocol v20 Compliant
Communicates with Herdr daemon via Unix Domain Socket (~/.config/herdr/herdr.sock)
"""

import os
import sys
import json
import socket
import re
import uuid
import signal

# Avoid SIGTTOU / SIGTTIN when manipulating slave PTYs from background threads
try:
    signal.signal(signal.SIGTTOU, signal.SIG_IGN)
    signal.signal(signal.SIGTTIN, signal.SIG_IGN)
except Exception:
    pass

DEFAULT_SOCKET_PATH = os.path.expanduser("~/.config/herdr/herdr.sock")

def strip_ansi(text):
    """Remove ANSI escape sequences from terminal output."""
    if not isinstance(text, str):
        return ""
    ansi_regex = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_regex.sub('', text)

class HerdrClient:
    def __init__(self, socket_path=None):
        self.socket_path = socket_path or os.environ.get("HERDR_SOCKET", DEFAULT_SOCKET_PATH)

    def is_connected(self):
        """Check if Herdr Unix socket is available and responsive."""
        if not os.path.exists(self.socket_path):
            return False, f"Socket non trovato in {self.socket_path}"
        try:
            res = self.call("ping")
            if res and res.get("result", {}).get("type") == "pong":
                ver = res.get("result", {}).get("version", "0.8.2")
                return True, f"Herdr v{ver} attivo"
            return False, res.get("error", {}).get("message", "Ping fallito")
        except Exception as e:
            return False, str(e)

    def call(self, method, params=None, timeout=2.5):
        """Send a JSON-RPC request to Herdr socket and return parsed response."""
        if not os.path.exists(self.socket_path):
            return {"error": {"code": -1, "message": f"Socket non trovato in {self.socket_path}"}}
            
        req_id = f"req_{uuid.uuid4().hex[:8]}"
        payload = {
            "id": req_id,
            "method": method,
            "params": params or {}
        }
        
        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            sock.connect(self.socket_path)
            
            raw_req = json.dumps(payload) + "\n"
            sock.sendall(raw_req.encode('utf-8'))
            
            chunks = []
            while True:
                chunk = sock.recv(131072)
                if not chunk:
                    break
                chunks.append(chunk)
                if b"\n" in chunk:
                    break
                    
            sock.close()
            raw_resp = b"".join(chunks).decode('utf-8').strip()
            if not raw_resp:
                return {"error": {"code": -2, "message": "Risposta vuota da Herdr socket"}}
                
            return json.loads(raw_resp)
        except Exception as e:
            return {"error": {"code": -3, "message": f"Errore comunicazione socket: {str(e)}"}}

    def get_snapshot(self):
        """Fetch session.snapshot containing full tree of workspaces, tabs, panes and agents."""
        res = self.call("session.snapshot")
        if "result" in res and "snapshot" in res["result"]:
            return res["result"]["snapshot"]
        return res.get("result", {})

    def read_pane(self, pane_id, lines=2000, source="recent_unwrapped", format="ansi"):
        """Read full scrollback buffer content from a pane."""
        resp = self.call("pane.read", {
            "pane_id": pane_id,
            "lines": lines,
            "source": source,
            "format": format
        })
        text = ""
        revision = 0
        if "result" in resp and "read" in resp["result"]:
            read_obj = resp["result"]["read"]
            text = read_obj.get("text", "")
            revision = read_obj.get("revision", 0)
        return {
            "pane_id": pane_id,
            "raw_text": text,
            "clean_text": strip_ansi(text) if format == "ansi" else text,
            "revision": revision,
            "lines": text.splitlines() if text else []
        }

    def send_text(self, pane_id, text, auto_enter=True):
        """Send plain text to a pane and optionally press Enter."""
        res1 = self.call("pane.send_text", {
            "pane_id": pane_id,
            "text": text
        })
        if auto_enter:
            self.send_keys(pane_id, ["enter"])
        return res1

    def send_keys(self, pane_id, keys_list):
        """Send key combinations like ['enter'], ['ctrl+c'], ['esc'], ['up'], ['down']."""
        if isinstance(keys_list, str):
            keys_list = [keys_list]
        return self.call("pane.send_keys", {
            "pane_id": pane_id,
            "keys": keys_list
        })

    def prompt_agent(self, agent_id, prompt_text):
        """Send prompt to a designated agent."""
        return self.call("agent.prompt", {
            "agent_id": agent_id,
            "prompt": prompt_text
        })

    def workspace_create(self, cwd, label=None):
        params = {"cwd": os.path.abspath(cwd)}
        if label:
            params["label"] = label
        return self.call("workspace.create", params)

    def workspace_close(self, workspace_id):
        return self.call("workspace.close", {"workspace_id": workspace_id})

    def workspace_focus(self, workspace_id):
        return self.call("workspace.focus", {"workspace_id": workspace_id})

    def tab_create(self, workspace_id, label=None):
        params = {"workspace_id": workspace_id}
        if label:
            params["label"] = label
        return self.call("tab.create", params)

    def tab_close(self, tab_id):
        return self.call("tab.close", {"tab_id": tab_id})

    def tab_focus(self, tab_id):
        return self.call("tab.focus", {"tab_id": tab_id})

    def pane_split(self, pane_id, direction="right"):
        return self.call("pane.split", {"pane_id": pane_id, "direction": direction})

    def pane_close(self, pane_id):
        return self.call("pane.close", {"pane_id": pane_id})

    def pane_focus(self, pane_id):
        return self.call("pane.focus", {"pane_id": pane_id})

    def pane_rename(self, pane_id, label=None):
        return self.call("pane.rename", {"pane_id": pane_id, "label": label})

    def agent_rename(self, target, name=None):
        return self.call("agent.rename", {"target": target, "name": name})

    def resize_pane_pty(self, pane_id, cols, rows):
        """Resize the underlying PTY for a pane via ioctl(TIOCSWINSZ) with SIGWINCH."""
        try:
            import os, fcntl, termios, struct, subprocess
            proc_info = self.call("pane.process_info", {"pane_id": pane_id})
            shell_pid = proc_info.get("result", {}).get("process_info", {}).get("shell_pid")
            if not shell_pid:
                fg_procs = proc_info.get("result", {}).get("process_info", {}).get("foreground_processes", [])
                if fg_procs:
                    shell_pid = fg_procs[0].get("pid")
            
            if shell_pid:
                out = subprocess.check_output(["ps", "-p", str(shell_pid), "-o", "tty="]).decode().strip()
                if out and out != "?":
                    dev_path = f"/dev/{out}"
                    if os.path.exists(dev_path):
                        fd = os.open(dev_path, os.O_RDWR | os.O_NONBLOCK | os.O_NOCTTY)
                        try:
                            new_ws = struct.pack("HHHH", int(rows), int(cols), 0, 0)
                            fcntl.ioctl(fd, termios.TIOCSWINSZ, new_ws)
                            return True, f"Resized {dev_path} to {cols}x{rows}"
                        finally:
                            os.close(fd)
            return False, f"Could not determine tty for pane {pane_id}"
        except Exception as e:
            return False, str(e)

if __name__ == "__main__":
    client = HerdrClient()
    connected, msg = client.is_connected()
    print(f"Connected: {connected} ({msg})")
