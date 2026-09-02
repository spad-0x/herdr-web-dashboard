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

    def read_pane(self, pane_id, lines=2000, source="recent_unwrapped"):
        """Read full scrollback buffer content from a pane without truncation."""
        resp = self.call("pane.read", {
            "pane_id": pane_id,
            "lines": lines,
            "source": source
        })
        text = ""
        if "result" in resp and "read" in resp["result"]:
            raw_text = resp["result"]["read"].get("text", "")
            text = strip_ansi(raw_text)
        return {
            "pane_id": pane_id,
            "raw_text": text,
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

if __name__ == "__main__":
    client = HerdrClient()
    connected, msg = client.is_connected()
    print(f"Connected: {connected} ({msg})")
