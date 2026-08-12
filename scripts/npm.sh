#!/usr/bin/env bash
# scripts/npm.sh — запуск npm в Docker контейнере
# Использование: ./scripts/npm.sh ci | install | run <script> | exec ...
# Зачем: lockfile может содержать platform-specific deps (darwin-arm64, wasm32),
# которые не нужны на linux. Docker всегда дает linux-only окружение.

set -e

# Параметры
IMAGE="node:22-slim"
PLATFORM="linux/amd64"
WORKDIR="$(pwd)"

# Проверяем Docker
if ! command -v docker &> /dev/null; then
  echo "ERROR: docker не найден. Установите Docker Desktop или docker CLI." >&2
  exit 1
fi

# Проверяем daemon
if ! docker info &> /dev/null; then
  echo "ERROR: Docker daemon не отвечает. Запустите Docker Desktop." >&2
  exit 1
fi

# Запускаем
docker run --rm \
  --platform "$PLATFORM" \
  -v "$WORKDIR:/app" \
  -w /app \
  -e HOME=/tmp \
  -e npm_config_fund=false \
  -e npm_config_audit=false \
  --network host \
  node:22-slim \
  npm "$@"
