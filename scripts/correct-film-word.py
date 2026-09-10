"""Source-specific video composite: append the missing r without covering footage.

Requires local FFmpeg, NumPy and Pillow; these are editing tools, not site/runtime
dependencies. The glyph is sampled from 'organization' in the same film. Source
camera motion and title reveal are matched with measured position/scale curves.
The remaining frames, words, duration, watermark and original audio are retained.
"""

import argparse
import hashlib
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SOURCE_SHA256 = 'af659fb5e77b9ee8dd74cdcc777a333ccbd2d4f997535f5897bd2ece8e8674c7'
WIDTH, HEIGHT, FPS, FRAMES = 1280, 720, 24, 240
FRAME_BYTES = WIDTH * HEIGHT * 3


def smoothstep(start, end, value):
    amount = np.clip((value - start) / (end - start), 0, 1)
    return amount * amount * (3 - 2 * amount)


def composite(frame, glyph, t):
    """Only the added letter's translucent pixels are changed, in the opening."""
    if t < 0.25 or t >= 2.75:
        return frame
    scale = 1 + 0.18 * (t - 1.5)
    width = round(glyph.width * scale)
    height = round(glyph.height * scale)
    resized = glyph.resize((width, height), Image.Resampling.LANCZOS)
    alpha = np.asarray(resized, dtype=np.float32) / 255
    eroded = np.asarray(resized.filter(ImageFilter.MinFilter(3)), dtype=np.float32) / 255
    outline = np.clip(alpha - eroded, 0, 1)
    fill = smoothstep(1.18, 1.36, t)
    fade = 1 - smoothstep(2.58, 2.73, t)
    outline_reveal = smoothstep(0.25, 0.65, t)
    matte = (alpha * fill + outline * 0.5 * (1 - fill) * outline_reveal) * fade
    # Measured right edge of u, baseline, and perspective growth at 24 fps.
    right_u = 804 + 20 * t + 3.4 * t * t
    x = round(right_u + 5 * scale)
    baseline = 357.1 + 1.9 * t
    y = round(baseline - 36 * scale)
    color = np.array([119, 154, 149]) * (1 - fill) + np.array([237, 247, 244]) * fill
    edited = frame.copy()
    target = edited[y:y + height, x:x + width]
    target[:] = np.rint(target * (1 - matte[..., None]) + color * matte[..., None]).astype(np.uint8)
    return edited


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    if hashlib.sha256(args.source.read_bytes()).hexdigest() != SOURCE_SHA256:
        parser.error('Source does not match the reviewed film; do not apply this motion track.')
    if args.output.exists():
        parser.error('Output exists; use a new path to preserve earlier renders.')
    sample = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-ss', '1.5', '-i', str(args.source),
        '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
    ])
    frame = np.frombuffer(sample, np.uint8).reshape(HEIGHT, WIDTH, 3)
    # Isolate the existing r from organization, including its anti-aliased edge.
    crop = frame[395:434, 484:509]
    luminance = crop.min(axis=2).astype(np.float32)
    matte = np.clip((luminance - 90) / 140, 0, 1)
    glyph = Image.fromarray(np.rint(matte * 255).astype(np.uint8))
    reader = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-i', str(args.source), '-map', '0:v:0',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
    ], stdout=subprocess.PIPE)
    writer = subprocess.Popen([
        'ffmpeg', '-v', 'error', '-n', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
        '-s', f'{WIDTH}x{HEIGHT}', '-r', str(FPS), '-i', '-', '-i', str(args.source),
        '-map', '0:v:0', '-map', '1:a:0?', '-c:v', 'libx264', '-preset', 'slow',
        '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart',
        str(args.output),
    ], stdin=subprocess.PIPE)
    changed_frames, changed_pixels = 0, 0
    try:
        for index in range(FRAMES):
            raw = reader.stdout.read(FRAME_BYTES)
            if len(raw) != FRAME_BYTES:
                raise RuntimeError(f'Unexpected video length at frame {index}')
            original = np.frombuffer(raw, np.uint8).reshape(HEIGHT, WIDTH, 3)
            edited = composite(original, glyph, index / FPS)
            changed = np.any(edited != original, axis=2)
            count = int(changed.sum())
            if count:
                ys, xs = np.nonzero(changed)
                # Fail closed if the patch moves outside the reviewed glyph area.
                assert 300 <= ys.min() and ys.max() < 375
                assert 810 <= xs.min() and xs.max() < 930
                assert count < 1500
                changed_frames += 1
                changed_pixels += count
            if index >= 66:
                assert not count, 'Later titles must not change'
            writer.stdin.write(edited.tobytes())
        assert reader.stdout.read(1) == b'', 'Unexpected extra frames'
        writer.stdin.close()
        if reader.wait() or writer.wait():
            raise RuntimeError('FFmpeg did not complete successfully')
    finally:
        if reader.poll() is None:
            reader.terminate()
        if writer.poll() is None:
            writer.terminate()
    print(f'Rendered {FRAMES} frames; added-letter pixels only in {changed_frames} opening frames ({changed_pixels} pixel changes before encoding).')
    print(args.output)


if __name__ == '__main__':
    main()
