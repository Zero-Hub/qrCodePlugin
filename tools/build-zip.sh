#!/usr/bin/env bash
# 一键打包 Edge Add-ons 提交用的 zip。
# 输出: dist/qr-code-for-mobile-vX.Y.Z.zip
# 自动从 manifest.json 读取版本号；自动排除开发期文件。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 从 manifest.json 读版本号（不依赖 jq，用 grep+sed）
VERSION=$(grep -E '"version"' manifest.json \
  | head -n 1 \
  | sed -E 's/.*"version"[^"]*"([^"]+)".*/\1/')

if [[ -z "$VERSION" ]]; then
  echo "✘ 无法从 manifest.json 解析 version" >&2
  exit 1
fi

OUT_DIR="$ROOT/dist"
OUT_FILE="$OUT_DIR/qr-code-for-mobile-v${VERSION}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

# 排除清单：
#  - dist/ 自身
#  - tools/  仅开发期使用，不需要分发
#  - .idea/, .vscode/, .git*  IDE / 版本控制
#  - .DS_Store macOS 元数据
#  - *.md  说明文件不必上架（PRIVACY.md 是单独提交的 URL，不必塞进 zip）
#  - 旧 zip
zip -r "$OUT_FILE" . \
  -x "dist/*" \
  -x "tools/*" \
  -x ".idea/*" \
  -x ".vscode/*" \
  -x ".git/*" \
  -x ".gitignore" \
  -x "**/.DS_Store" \
  -x ".DS_Store" \
  -x "*.zip" \
  -x "*.md"

echo
echo "✔ 打包完成：$OUT_FILE"
echo
echo "压缩包内容（前 25 项）："
unzip -l "$OUT_FILE" | head -n 30
echo
echo "→ 把上面这个 zip 上传到 Microsoft Partner Center 即可。"
