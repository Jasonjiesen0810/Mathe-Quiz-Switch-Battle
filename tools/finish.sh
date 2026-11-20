#!/bin/bash
# Aufruf: tools/finish.sh <nr> <name> <html> <dauer> <song.mp3> <song-start> <lautstärke> <boost-ab-sek>
set -e
N=$1; NAME=$2; HTML=$3; DUR=$4; SONG=$5; OFF=$6; VOL=$7; BOOST=$8
cd "$(dirname "$0")/.."
VO=drafts/${N}_vo
PRE=""; [ -f $VO/confident ] && PRE="asetrate=24000*0.955,aresample=24000,atempo=1.047,equalizer=f=140:t=q:w=1:g=3,"
ffmpeg -loglevel error -y -i $VO/voiceover_raw.wav -af "${PRE}highpass=f=70,equalizer=f=200:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=1.5,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,aecho=0.8:0.85:40|70:0.12|0.08,loudnorm=I=-16:TP=-1.5,apad,atrim=0:$DUR" -ar 48000 $VO/voiceover.wav
FO=$(python3 -c "print($DUR-1.6)")
ffmpeg -loglevel error -y -ss $OFF -t $DUR -i materials/musik/$SONG -i $VO/voiceover.wav -filter_complex "[0]aresample=48000,volume=$(python3 -c "print(round($VOL*2.0,3))"),volume='if(gte(t,$BOOST),1.35,1)':eval=frame,afade=t=in:st=0:d=0.3,afade=t=out:st=$FO:d=1.6[m];[1]aresample=48000,asplit=2[v][sc];[m][sc]sidechaincompress=threshold=0.06:ratio=2.5:attack=30:release=400[md];[v][md]amix=inputs=2:normalize=0:duration=longest,atrim=0:$DUR,alimiter=limit=0.95,loudnorm=I=-13:TP=-1.2[o]" -map "[o]" -ar 48000 $VO/mix.wav
NODE_PATH=$(npm root -g) node tools/export.js $HTML output/${N}_${NAME}_UPLOAD_ohne-musik.mp4 60 $VO/voiceover.wav | tail -1
ffmpeg -loglevel error -y -i output/${N}_${NAME}_UPLOAD_ohne-musik.mp4 -i $VO/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart output/${N}_${NAME}_VORSCHAU_musik.mp4
ffmpeg -loglevel error -y -i $VO/voiceover.wav -codec:a libmp3lame -q:a 2 output/${N}_${NAME}_nur-stimme.mp3
echo "fertig $N"
