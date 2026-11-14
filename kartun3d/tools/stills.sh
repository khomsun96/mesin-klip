#!/bin/bash
# pakai: ./stills.sh "detik detik ..." nama
i=0; for t in $1; do f=$(python3 -c "print(round($t*30))"); npx remotion still src/index.tsx Kartun out/st/$2_$i.jpg --frame=$f --scale=0.33 --image-format=jpeg --log=error 2>&1 | grep -iE "error|cannot|failed" | head -5; i=$((i+1)); done
ffmpeg -v error -y -pattern_type glob -i "out/st/$2_*.jpg" -vf "tile=5x2" out/sheet_$2.jpg
