#!/usr/bin/env python3
"""生成扩展图标 (16x16 / 48x48 / 128x128) PNG，无任何第三方依赖。

设计：模仿二维码外观——三个角的 finder pattern + 中心若干装饰点。
颜色：Edge 风格的蓝色前景 + 白底。
运行：`python3 tools/generate-icons.py`
"""

import struct
import zlib
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ICONS_DIR = ROOT / "icons"
ICONS_DIR.mkdir(exist_ok=True)

SIZES = [16, 48, 128]
BG = (0xFF, 0xFF, 0xFF)        # 白底
FG = (0x0E, 0x6B, 0xDF)        # 蓝色前景（接近 Edge 蓝 #0E6BDF）

# 11x11 网格：1 = 前景方块，0 = 留白
GRID = 11
P = [[0] * GRID for _ in range(GRID)]


def draw_finder(x0, y0):
    """在 (x0, y0) 处画 5x5 的 QR finder pattern。"""
    pat = [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1],
    ]
    for i in range(5):
        for j in range(5):
            P[y0 + i][x0 + j] = pat[i][j]


# 三个角的 finder pattern
draw_finder(0, 0)               # 左上
draw_finder(GRID - 5, 0)        # 右上
draw_finder(0, GRID - 5)        # 左下
# 中心 + 装饰点，让小图标不至于空荡荡
P[5][5] = 1
P[6][7] = 1
P[7][6] = 1
P[8][8] = 1
P[7][9] = 1
P[9][7] = 1


def render_rgb(size: int) -> bytes:
    """把网格栅格化到 size x size 的 RGB 像素流（已带 PNG filter byte）。"""
    pad = max(1, size // 16)
    inner = size - 2 * pad
    cell = inner / GRID

    rows = []
    for y in range(size):
        row = bytearray()
        row.append(0)  # PNG filter type = None
        for x in range(size):
            gx = (x - pad) / cell
            gy = (y - pad) / cell
            if 0 <= gx < GRID and 0 <= gy < GRID:
                lit = P[int(gy)][int(gx)]
            else:
                lit = 0
            r, g, b = FG if lit else BG
            row += bytes((r, g, b))
        rows.append(bytes(row))
    return b''.join(rows)


def write_png(path: pathlib.Path, size: int) -> None:
    """手工编码一个最简单的 PNG（8-bit RGB，不带 alpha）。"""
    raw = render_rgb(size)

    def chunk(typ: bytes, payload: bytes) -> bytes:
        length = struct.pack('>I', len(payload))
        crc = struct.pack('>I', zlib.crc32(typ + payload) & 0xFFFFFFFF)
        return length + typ + payload + crc

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)  # color-type 2 = RGB
    idat = zlib.compress(raw, 9)

    with open(path, 'wb') as f:
        f.write(sig)
        f.write(chunk(b'IHDR', ihdr))
        f.write(chunk(b'IDAT', idat))
        f.write(chunk(b'IEND', b''))


if __name__ == '__main__':
    for sz in SIZES:
        out = ICONS_DIR / f"icon{sz}.png"
        write_png(out, sz)
        print(f"wrote {out.relative_to(ROOT)}  ({sz}x{sz})")
