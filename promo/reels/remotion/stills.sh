#!/bin/bash
# 使い方: ./stills.sh <Composition> <秒...>  → out/st/<Comp>_<秒>.png と out/<Comp>_sheet.png
cd "$(dirname "$0")"
comp=$1; shift
for sec in "$@"; do
  f=$(python3 -c "print(round($sec*30))")
  npx remotion still $comp out/st/${comp}_$(printf %05.2f $sec).png --frame=$f --log=error >/dev/null 2>&1 || echo "fail $sec"
done
ffmpeg -v error -y -pattern_type glob -i "out/st/${comp}_*.png" -vf "scale=270:480,tile=8x2:padding=6:color=white" -frames:v 1 out/${comp}_sheet.png
