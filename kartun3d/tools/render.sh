#!/bin/bash
# Pakai: bash tools/render.sh episodes/<slug>   → episodes/<slug>/instagram.mp4 (+ lembar frame untuk QA)
set -e; D=${1%/}
python3 tools/build_ep.py $D
python3 tools/audio.py $D
npx remotion render src/index.tsx Kartun $D/master.mp4 --concurrency=2 --codec=h264 --crf=18 --jpeg-quality=90 --log=error
ffmpeg -v error -y -i $D/master.mp4 -i $D/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -af "loudnorm=I=-14:TP=-1.5:LRA=9" -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart $D/instagram.mp4
ffmpeg -v error -y -i $D/instagram.mp4 -vf "fps=1/4.4,scale=216:384,tile=7x2" -frames:v 1 $D/lembar.jpg
ffprobe -v error -show_entries format=duration -of csv=p=0 $D/instagram.mp4
ffmpeg -hide_banner -i $D/instagram.mp4 -af volumedetect -vn -f null - 2>&1 | grep mean_volume
