"""Replace the reviewed film's Gemini corner mark with grayscale Prometa branding.

Local editing only: Python standard library plus FFmpeg/FFprobe. Uses the
previously corrected YOUR master and the user's existing transparent logo.
Rejects unknown inputs and existing outputs. Original files are never modified.
"""

import argparse
import hashlib
import json
import subprocess
from pathlib import Path

SOURCE_SHA256 = '9fa048a98c2d1cbed5b78ab799269eac242d1b234925a54a62bc57bf5d4da1a5'
LOGO_SHA256 = '33b9668f7af2295b11146293a8f5cbef80f072d6e662f48cd6e49943744d2946'
# Source-specific, fixed mark at x=1132..1188, y=572..628 in a 1280x720 frame.
# Delogo interpolates the small old-mark area; no solid banner covers the film.
# Equal RGB channels retain only the supplied logo silhouette, at 72% opacity.
COMPOSITE = (
    '[0:v]delogo=x=1132:y=572:w=56:h=56[clean];'
    '[1:v]format=rgba,lutrgb=r=192:g=192:b=192,'
    'colorchannelmixer=aa=0.72,scale=150:-1[logo];'
    '[clean][logo]overlay=x=1039:y=575:format=auto,format=yuv420p[film]'
)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('logo', type=Path)
    parser.add_argument('output_directory', type=Path)
    args = parser.parse_args()
    for path, expected in [(args.source, SOURCE_SHA256), (args.logo, LOGO_SHA256)]:
        if digest(path) != expected:
            parser.error(f'Unreviewed input: {path.name}')
    if not args.output_directory.is_dir():
        parser.error('Create a dedicated output directory first.')
    outputs = [
        ('planeon-introduction.mp4', 25, None, 2_000_000),
        ('planeon-introduction-mobile.mp4', 26, 768, 800_000),
        ('planeon-introduction-poster.jpg', None, None, 100_000),
    ]
    if any((args.output_directory / item[0]).exists() for item in outputs):
        parser.error('Output exists; choose a new directory to retain earlier renders.')
    for name, crf, width, budget in outputs:
        output = args.output_directory / name
        graph = COMPOSITE
        label = '[film]'
        if width:
            graph += f';[film]scale={width}:-2[mobile]'
            label = '[mobile]'
        command = [
            'ffmpeg', '-v', 'error', '-n', '-i', str(args.source),
            '-i', str(args.logo), '-filter_complex', graph, '-map', label, '-an',
        ]
        if crf is None:
            command += ['-frames:v', '1', '-q:v', '5']
        else:
            command += [
                '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
            ]
        subprocess.run(command + [str(output)], check=True)
        if output.stat().st_size >= budget:
            raise RuntimeError(f'{name} exceeds the existing website size budget')
        if crf is not None:
            info = json.loads(subprocess.check_output([
                'ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(output),
            ]))['streams']
            assert len(info) == 1 and info[0]['codec_type'] == 'video'
            assert info[0]['nb_frames'] == '240'
            assert info[0]['r_frame_rate'] == '24/1'
            assert float(info[0]['duration']) == 10
            assert info[0]['width'] == (width or 1280)
            assert info[0]['height'] == (432 if width else 720)
        print(f'{name}: {output.stat().st_size} bytes; SHA-256 {digest(output)}')


if __name__ == '__main__':
    main()
