#!/usr/bin/env bash
# One-paste quickstart for Naija-Twin.
# Usage: bash scripts/quickstart.sh

set -euo pipefail

echo "=== Naija-Twin Quickstart ==="

echo "[1/5] Installing Node.js dependencies..."
pnpm install

echo "[2/5] Installing Python dependencies..."
cd apps/api && uv sync && cd ../..

echo "[3/5] Starting services..."
docker compose up -d

echo "[4/5] Waiting for services..."
sleep 5

echo "[5/5] Starting development servers..."
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
pnpm dev
