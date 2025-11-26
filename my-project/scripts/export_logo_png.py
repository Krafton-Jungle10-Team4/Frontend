"""
Pure-Python SnapAgent 로고 PNG 익스포터.
- 외부 의존성 없이 SVG와 동일한 도형을 픽셀로 래스터라이즈합니다.
- 출력: public/snapagent-logo.png (기본 4000x4000, 투명 배경)
"""

import math
import os
import struct
import zlib


# 기본 설정
SCALE = 100  # 1 SVG 단위당 픽셀 수 → 40 * 100 = 4000px
SIZE = int(40 * SCALE)
# UI에서 로고에 기본으로 쓰는 퍼플(#5f5bff)과 맞춤
BASE_COLOR = (95, 91, 255)


def clamp01(value: float) -> float:
    return 0.0 if value < 0.0 else 1.0 if value > 1.0 else value


def blend_pixel(buf: bytearray, width: int, x: int, y: int, color: tuple[int, int, int], alpha: float) -> None:
    """RGBA 알파 블렌딩."""
    if alpha <= 0.0 or x < 0 or y < 0 or x >= width or y >= SIZE:
        return

    idx = (y * width + x) * 4
    dst_r, dst_g, dst_b, dst_a = buf[idx], buf[idx + 1], buf[idx + 2], buf[idx + 3]

    src_a = clamp01(alpha)
    dst_af = dst_a / 255.0
    out_a = src_a + dst_af * (1.0 - src_a)
    if out_a <= 0:
        return

    src_rf, src_gf, src_bf = (c / 255.0 for c in color)
    dst_rf, dst_gf, dst_bf = dst_r / 255.0, dst_g / 255.0, dst_b / 255.0

    out_r = int(((src_rf * src_a + dst_rf * dst_af * (1.0 - src_a)) / out_a) * 255 + 0.5)
    out_g = int(((src_gf * src_a + dst_gf * dst_af * (1.0 - src_a)) / out_a) * 255 + 0.5)
    out_b = int(((src_bf * src_a + dst_bf * dst_af * (1.0 - src_a)) / out_a) * 255 + 0.5)
    out_af = int(out_a * 255 + 0.5)

    buf[idx:idx + 4] = bytes((out_r, out_g, out_b, out_af))


def dist2_point_to_segment(px: float, py: float, x1: float, y1: float, x2: float, y2: float) -> float:
    """점-선분까지의 거리 제곱."""
    dx = x2 - x1
    dy = y2 - y1
    if dx == 0 and dy == 0:
        return (px - x1) ** 2 + (py - y1) ** 2
    t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
    t = clamp01(t)
    proj_x = x1 + t * dx
    proj_y = y1 + t * dy
    return (px - proj_x) ** 2 + (py - proj_y) ** 2


def draw_line(
    buf: bytearray,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    width_px: float,
    color: tuple[int, int, int],
    base_alpha: float,
    alpha_func=None,
) -> None:
    """폭이 있는 라인(둥근 캡 포함) 그리기."""
    half = width_px / 2.0
    half2 = half * half
    min_x = max(int(math.floor(min(x1, x2) - half)) - 1, 0)
    max_x = min(int(math.ceil(max(x1, x2) + half)) + 1, SIZE - 1)
    min_y = max(int(math.floor(min(y1, y2) - half)) - 1, 0)
    max_y = min(int(math.ceil(max(y1, y2) + half)) + 1, SIZE - 1)

    for y in range(min_y, max_y + 1):
        py = y + 0.5
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            if dist2_point_to_segment(px, py, x1, y1, x2, y2) <= half2:
                alpha = base_alpha * (alpha_func(px, py) if alpha_func else 1.0)
                if alpha > 0:
                    blend_pixel(buf, SIZE, x, y, color, alpha)

    # 둥근 캡
    draw_circle(buf, x1, y1, half, color, base_alpha, alpha_func)
    draw_circle(buf, x2, y2, half, color, base_alpha, alpha_func)


def draw_circle(
    buf: bytearray,
    cx: float,
    cy: float,
    radius_px: float,
    color: tuple[int, int, int],
    base_alpha: float,
    alpha_func=None,
) -> None:
    r2 = radius_px * radius_px
    min_x = max(int(math.floor(cx - radius_px)) - 1, 0)
    max_x = min(int(math.ceil(cx + radius_px)) + 1, SIZE - 1)
    min_y = max(int(math.floor(cy - radius_px)) - 1, 0)
    max_y = min(int(math.ceil(cy + radius_px)) + 1, SIZE - 1)

    for y in range(min_y, max_y + 1):
        py = y + 0.5
        dy2 = (py - cy) ** 2
        if dy2 > r2:
            continue
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            if dy2 + (px - cx) ** 2 <= r2:
                alpha = base_alpha * (alpha_func(px, py) if alpha_func else 1.0)
                if alpha > 0:
                    blend_pixel(buf, SIZE, x, y, color, alpha)


def write_png(buf: bytearray, path: str) -> None:
    """간단한 RGBA PNG 작성."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)
    scanlines = bytearray()
    row_bytes = SIZE * 4
    for y in range(SIZE):
        scanlines.append(0)  # 필터 타입 0 (None)
        start = y * row_bytes
        scanlines.extend(buf[start:start + row_bytes])

    compressed = zlib.compress(bytes(scanlines), level=9)

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", compressed))
        f.write(chunk(b"IEND", b""))


def outer_gradient_alpha(px: float, py: float) -> float:
    """SVG linearGradient(4,4)-(36,36)의 알파(0.9 → 0.4) 계산."""
    start_x, start_y = 4 * SCALE, 4 * SCALE
    end_x, end_y = 36 * SCALE, 36 * SCALE
    dx = end_x - start_x
    dy = end_y - start_y
    t = ((px - start_x) * dx + (py - start_y) * dy) / (dx * dx + dy * dy)
    t = clamp01(t)
    return 0.9 - 0.5 * t


def main() -> None:
    buf = bytearray(SIZE * SIZE * 4)  # 투명 배경

    # 좌표를 픽셀 단위로 변환
    def p(x: float, y: float) -> tuple[float, float]:
        return x * SCALE, y * SCALE

    # --- Outer hexagon ---
    hex_points = [
        p(20, 2),
        p(35.5885, 11),
        p(35.5885, 29),
        p(20, 38),
        p(4.41154, 29),
        p(4.41154, 11),
    ]
    outer_width = 2.5 * SCALE
    for i in range(len(hex_points)):
        x1, y1 = hex_points[i]
        x2, y2 = hex_points[(i + 1) % len(hex_points)]
        draw_line(buf, x1, y1, x2, y2, outer_width, BASE_COLOR, 1.0, outer_gradient_alpha)

    # --- Inner connections ---
    inner_width = 2.0 * SCALE
    inner_alpha = 0.8
    lines = [
        (p(20, 11), p(20, 17)),
        (p(20, 23), p(20, 29)),
        (p(14.8038, 14), p(20, 17)),
        (p(25.1962, 14), p(20, 17)),
        (p(14.8038, 26), p(20, 23)),
        (p(25.1962, 26), p(20, 23)),
    ]
    for (x1, y1), (x2, y2) in lines:
        draw_line(buf, x1, y1, x2, y2, inner_width, BASE_COLOR, inner_alpha)

    # --- Central node + glow ---
    center = p(20, 20)
    center_radius = 3 * SCALE
    glow_radius = 5.5 * SCALE
    draw_circle(buf, *center, glow_radius, BASE_COLOR, 0.12)
    draw_circle(buf, *center, center_radius, BASE_COLOR, 1.0)

    # --- Orbiting nodes ---
    orbit_radius = 1.5 * SCALE
    orbit_points = [p(20, 2), p(35.5, 29), p(4.5, 29)]
    for op in orbit_points:
        draw_circle(buf, *op, orbit_radius * 1.3, BASE_COLOR, 0.16)
        draw_circle(buf, *op, orbit_radius, BASE_COLOR, 1.0)

    output_path = os.path.join(os.path.dirname(__file__), "..", "public", "snapagent-logo.png")
    output_path = os.path.abspath(output_path)
    write_png(buf, output_path)
    print(f"PNG saved to: {output_path}")


if __name__ == "__main__":
    main()
