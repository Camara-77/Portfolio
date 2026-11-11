#!/usr/bin/env bash
# Mixage d'une note vocale : voix nettoyée + musique de fond avec ducking.
#
#   scripts/mixer-note.sh VOIX.wav MUSIQUE.wav SORTIE.mp3 VOIX_ALIGNEE.mp3
#
# - la voix est décalée de LEAD s : la musique entre en fondu 1 s avant la 1re phrase
# - musique de base à MUSIC_LUFS, baissée par la voix (sidechaincompress)
# - la musique continue 2 s après la fin de la voix (fondu sur les 1,5 dernières secondes)
# - normalisation du mélange à -16 LUFS (2 passes), MP3 192 kbps
# - VOIX_ALIGNEE : la voix seule, calée sur la même timeline (sert à animer les rubans)
set -euo pipefail

VOICE="$1"; MUSIC="$2"; OUT="$3"; VOICE_OUT="$4"
LEAD=0.7            # voix nettoyée : 0,3 s de silence + 0,7 s → 1re phrase à 1,0 s
MUSIC_LUFS=-30      # musique hors parole (≈ -14 dB sous la voix), ≈ -22 dB sous la voix pendant la parole
TAIL=2.0            # musique après la fin de la voix
FADE_OUT=1.5

dur() { ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$1"; }
VD=$(dur "$VOICE"); MD=$(dur "$MUSIC")
# Fin de la dernière phrase = fin de la voix - 0,27 s de silence final
LAST=$(python -c "print(round($LEAD + $VD - 0.27, 3))")
TOTAL=$(python -c "print(round(min($MD, $LAST + $TAIL), 3))")
FADE_START=$(python -c "print(round($TOTAL - $FADE_OUT, 3))")

# Gain de la musique pour atteindre MUSIC_LUFS
MI=$(ffmpeg -hide_banner -nostats -i "$MUSIC" -af loudnorm=print_format=summary -f null - 2>&1 | grep "Input Integrated" | grep -oE '\-?[0-9.]+')
GAIN=$(python -c "print(round($MUSIC_LUFS - ($MI), 2))")

GRAPH="
[0:a]aformat=channel_layouts=stereo,adelay=${LEAD}s:all=1,apad=whole_dur=${TOTAL},asplit=2[v][key];
[1:a]atrim=0:${TOTAL},volume=${GAIN}dB,afade=t=in:st=0:d=1,afade=t=out:st=${FADE_START}:d=${FADE_OUT}[m];
[m][key]sidechaincompress=threshold=0.03:ratio=2.2:attack=40:release=900:knee=6[md];
[v][md]amix=inputs=2:normalize=0:duration=first"

# Passe 1 : mesure
J=$(ffmpeg -hide_banner -nostats -i "$VOICE" -i "$MUSIC" -filter_complex "$GRAPH,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | grep -oE '\-?[0-9.]+'; }

# Passe 2 : export
ffmpeg -hide_banner -loglevel error -y -i "$VOICE" -i "$MUSIC" -filter_complex \
  "$GRAPH,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -c:a libmp3lame -b:a 192k "$OUT"

# Voix seule calée sur la même timeline (analyse des rubans)
ffmpeg -hide_banner -loglevel error -y -i "$VOICE" -af "adelay=${LEAD}s:all=1,apad=whole_dur=${TOTAL}" \
  -ac 1 -c:a libmp3lame -b:a 192k "$VOICE_OUT"

echo "mélange : $OUT (${TOTAL} s) · musique ${GAIN} dB · dernière phrase à ${LAST} s · fin de la musique ${TOTAL} s"
