#!/usr/bin/env bash
# Starts the Expo dev server inside the container, reachable from phones on
# the same Wi-Fi (Expo Go). Extra args go to `expo start`, e.g. --clear.
set -euo pipefail
cd "$(dirname "$0")/.."
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [ -z "$IP" ]; then
  echo "No encuentro la IP de la wifi del Mac (en0/en1)." >&2
  exit 1
fi
echo "Servidor en exp://$IP:8081 — ábrelo con Expo Go"
REACT_NATIVE_PACKAGER_HOSTNAME=$IP exec docker compose run --rm --service-ports dev npx expo start "$@"
