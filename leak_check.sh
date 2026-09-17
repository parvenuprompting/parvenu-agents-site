#!/usr/bin/env bash
# leak_check.sh — Strikte Zero-Trust & Amnesia scanner voor publieke repositories.
# Blokkeert commits of pushes als er ook maar 1 byte aan interne data lekt.

set -euo pipefail

FAIL=0

echo "🔍 Draai Amnesia & Zero-Trust lek-detectie..."

# 1. Lokale systeempaden
if grep -rn -E "/Users/|/home/|/root/" . \
  --exclude-dir=".git" --exclude="leak_check.sh" >/dev/null 2>&1; then
    echo "❌ FOUT: Lokale systeempaden (/Users/, /home/, /root/) gevonden!"
    grep -rn -E "/Users/|/home/|/root/" . --exclude-dir=".git" --exclude="leak_check.sh"
    FAIL=1
fi

# 2. IP adressen & interne netwerken
if grep -rn -E "100\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|168\.119\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}" . \
  --exclude-dir=".git" --exclude="leak_check.sh" >/dev/null 2>&1; then
    echo "❌ FOUT: Hardcoded IP-adressen (Tailscale / VPS / LAN) gevonden!"
    grep -rn -E "100\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|168\.119\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}" . --exclude-dir=".git" --exclude="leak_check.sh"
    FAIL=1
fi

# 3. Interne specifieke poorten
if grep -rn -E "8788|8787" . \
  --exclude-dir=".git" --exclude="leak_check.sh" >/dev/null 2>&1; then
    echo "❌ FOUT: Interne servicepoorten (8788/8787) gevonden in publieke bestanden!"
    grep -rn -E "8788|8787" . --exclude-dir=".git" --exclude="leak_check.sh"
    FAIL=1
fi

# 4. API keys & secrets
if grep -rn -E "(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|Bearer [a-zA-Z0-9_\-\.]{20,})" . \
  --exclude-dir=".git" --exclude="leak_check.sh" >/dev/null 2>&1; then
    echo "❌ FOUT: Mogelijke API-tokens of Bearer-secrets gevonden!"
    FAIL=1
fi

# 5. Taboo namen (strikte sanering)
if grep -rni -E "eefje|evy|angie" . \
  --exclude-dir=".git" --exclude="*.jpg" --exclude="*.png" --exclude="*.mp4" --exclude="leak_check.sh" >/dev/null 2>&1; then
    echo "❌ FOUT: Taboe-namen gevonden in bestanden!"
    grep -rni -E "eefje|evy|angie" . --exclude-dir=".git" --exclude="*.jpg" --exclude="*.png" --exclude="*.mp4" --exclude="leak_check.sh"
    FAIL=1
fi

if [ "$FAIL" -eq 1 ]; then
    echo "🚨 SCAN GEFAALD: Commit of push geblokkeerd door Amnesia-filter!"
    exit 1
fi

echo "✅ AMNESIA CHECK 100% GROEN: Geen systeempaden, geen interne IPs/poorten, geen tokens, geen taboe-data."
exit 0
