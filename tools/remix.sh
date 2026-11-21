#!/bin/bash
# Musik neu mischen (lauter) und in die Vorschau legen – Video wird nicht neu gerendert.
# Aufruf: tools/remix.sh <nr> <name> <dauer> <song.mp3> <song-start> <lautstärke> <boost-ab> [boost-faktor]
set -e
N=$1; NAME=$2; DUR=$3; SONG=$4; OFF=$5; VOL=$6; BOOST=$7; BF=${8:-1.35}
cd "$(dirname "$0")/.."
VO=drafts/${N}_vo; GAIN=${MUSIC_GAIN:-1.25}
V=$(python3 -c "print(round($VOL*$GAIN,3))"); FO=$(python3 -c "print($DUR-1.6)")
ffmpeg -loglevel error -y -ss $OFF -t $DUR -i materials/musik/$SONG -i $VO/voiceover.wav -filter_complex "[0]aresample=48000,volume=$V,volume='if(gte(t,$BOOST),$BF,1)':eval=frame,afade=t=in:st=0:d=0.3,afade=t=out:st=$FO:d=1.6[m];[1]aresample=48000,asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.035:ratio=4:attack=20:release=450[md];[v][md]amix=inputs=2:normalize=0:duration=longest,atrim=0:$DUR,alimiter=limit=0.95,loudnorm=I=-13:TP=-1.2[o]" -map "[o]" -ar 48000 $VO/mix.wav
ffmpeg -loglevel error -y -i output/${N}_${NAME}_UPLOAD_ohne-musik.mp4 -i $VO/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart output/${N}_${NAME}_VORSCHAU_musik.mp4
echo "remix $N"
