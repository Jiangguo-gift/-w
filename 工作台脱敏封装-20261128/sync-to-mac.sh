#!/bin/bash
# 脱敏交付包同步脚本（设备重连后使用）。
# 本脚本不含任何真实内部标识：目标路径通过环境变量传入，未设置时使用占位默认值。
#
# 用法（在已连接的 Mac 上，Local Bash 执行）：
#   VAULT_DIR="$HOME/Documents/你的Obsidian目录" bash sync-to-mac.sh
set -euo pipefail

VAULT="${VAULT_DIR:-$HOME/obsidian-vault-demo}"
DEST="$VAULT/99-Aime产出/工作台脱敏封装-20261128"
DIR="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$DEST"
cp -f "$DIR"/*.zip "$DIR"/*.tar.gz "$DIR"/MANIFEST.json "$DIR"/MANIFEST.sha256 "$DEST/"

cd "$DEST"
shasum -a 256 -c MANIFEST.sha256
echo "同步完成：$DEST"
ls -la "$DEST"
