#!/usr/bin/env bash
set -euo pipefail

mkdir -p output

TITLE="${GAME_TITLE:-New HTML5 Game}"
DURATION="${RECORD_SECONDS:-15}"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

if [[ ! -f output/gameplay.webm ]]; then
  echo "output/gameplay.webm bulunamadi."
  exit 1
fi

SAFE_TITLE="${TITLE//:/\\:}"
SAFE_TITLE="${SAFE_TITLE//\'/\\\'}"

ffmpeg -y \
  -f lavfi -i color=c=0x071426:s=1080x1920:d=1.5:r=30 \
  -vf "drawtext=fontfile=${FONT_BOLD}:text='GamexlabTR':fontcolor=white:fontsize=92:x=(w-text_w)/2:y=760,\
drawtext=fontfile=${FONT_REGULAR}:text='NEW GAME':fontcolor=0x6EA8FF:fontsize=50:x=(w-text_w)/2:y=900" \
  -an -c:v libx264 -pix_fmt yuv420p -r 30 output/intro.mp4

ffmpeg -y -i output/gameplay.webm \
  -t "${DURATION}" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,\
drawbox=x=0:y=0:w=iw:h=170:color=black@0.50:t=fill,\
drawtext=fontfile=${FONT_BOLD}:text='${SAFE_TITLE}':fontcolor=white:fontsize=48:x=50:y=55,\
drawtext=fontfile=${FONT_BOLD}:text='GamexlabTR':fontcolor=white@0.72:fontsize=34:x=w-text_w-45:y=h-text_h-45" \
  -an -r 30 -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p output/gameplay-vertical.mp4

ffmpeg -y \
  -f lavfi -i color=c=0x071426:s=1080x1920:d=3:r=30 \
  -vf "drawtext=fontfile=${FONT_BOLD}:text='GamexlabTR':fontcolor=white:fontsize=88:x=(w-text_w)/2:y=520,\
drawtext=fontfile=${FONT_BOLD}:text='PLAY FREE NOW':fontcolor=0x6EA8FF:fontsize=58:x=(w-text_w)/2:y=730,\
drawtext=fontfile=${FONT_REGULAR}:text='gamexlabtr.com':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=890,\
drawtext=fontfile=${FONT_REGULAR}:text='Like and Follow for Daily New Games':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=1080" \
  -an -c:v libx264 -pix_fmt yuv420p -r 30 output/outro.mp4

printf "file '%s'\nfile '%s'\nfile '%s'\n" \
  "$(pwd)/output/intro.mp4" \
  "$(pwd)/output/gameplay-vertical.mp4" \
  "$(pwd)/output/outro.mp4" > output/concat.txt

ffmpeg -y -f concat -safe 0 -i output/concat.txt \
  -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p \
  -movflags +faststart output/gamexlabtr-final.mp4

echo "Hazir: output/gamexlabtr-final.mp4"
