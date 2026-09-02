#!/usr/bin/env python3
"""
Herdr Dashboard - Credential Management Tool
Allows setting or updating the admin username and password.
"""

import os
import sys
import json
import secrets
import hashlib
import time
import getpass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AUTH_FILE = os.path.join(BASE_DIR, "auth.json")

def set_credentials(username=None, password=None):
    if not username:
        default_user = "admin"
        if os.path.exists(AUTH_FILE):
            try:
                with open(AUTH_FILE, "r") as f:
                    default_user = json.load(f).get("username", "admin")
            except Exception:
                pass
        input_user = input(f"Inserisci Nome Utente [{default_user}]: ").strip()
        username = input_user if input_user else default_user

    if not password:
        password = getpass.getpass("Inserisci Nuova Password: ").strip()
        if not password:
            print("❌ Errore: la password non può essere vuota.")
            sys.exit(1)
        confirm_pwd = getpass.getpass("Conferma Nuova Password: ").strip()
        if password != confirm_pwd:
            print("❌ Errore: le password non corrispondono.")
            sys.exit(1)

    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

    auth_data = {
        "username": username,
        "salt": salt,
        "hash": pwd_hash,
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    with open(AUTH_FILE, "w") as f:
        json.dump(auth_data, f, indent=2)
    os.chmod(AUTH_FILE, 0o600)

    print("\n✅ Credenziali aggiornate con successo!")
    print(f"   👤 Utente  : {username}")
    print(f"   📁 File    : {AUTH_FILE}\n")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        set_credentials(username=sys.argv[1], password=sys.argv[2])
    elif len(sys.argv) == 2:
        set_credentials(username="admin", password=sys.argv[1])
    else:
        set_credentials()
