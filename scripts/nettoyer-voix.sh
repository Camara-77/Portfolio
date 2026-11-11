#!/usr/bin/env bash
# Nettoyage d'une note vocale, sans changer la voix.
#
#   scripts/nettoyer-voix.sh BRUT.mp4 SORTIE.wav [FIN_S] [SEUIL_GATE]
#
#   FIN_S       : coupe tout ce qui suit (ex. clic d'arrêt d'enregistrement) ; vide = rien
#   SEUIL_GATE  : seuil du noise gate en amplitude linéaire (défaut 0.006 ≈ -44 dB)
#
# Chaîne : passe-haut 80 Hz → réduction de souffle (afftdn) → noise gate doux
# (baisse le bruit entre les mots de 20 dB max) → compression légère →
# pauses (respirations comprises) > 0,25 s ramenées à 0,22 s → 0,3 s de silence au début et à la fin →
# normalisation -16 LUFS en deux passes.
set -euo pipefail

IN="$1"; OUT="$2"; END="${3:-}"; GATE="${4:-0.006}"

TRIM=""
[ -n "$END" ] && TRIM="atrim=start=0:end=${END},asetpts=PTS-STARTPTS,"

CHAIN="${TRIM}highpass=f=80,\
afftdn=nr=16:nf=-55:tn=1,\
agate=threshold=${GATE}:ratio=3:range=0.1:attack=5:release=160:detection=rms,\
acompressor=threshold=-24dB:ratio=2.5:attack=10:release=180:makeup=2,\
silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0:\
stop_periods=-1:stop_duration=0.25:stop_threshold=-38dB:stop_silence=0.22,\
adelay=300:all=1,apad=pad_dur=0.05"

J=$(ffmpeg -hide_banner -nostats -i "$IN" -af "$CHAIN,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | grep -oE '\-?[0-9.]+'; }

ffmpeg -hide_banner -loglevel error -y -i "$IN" -af \
  "$CHAIN,loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" \
  -ar 48000 -ac 1 "$OUT"

echo "$OUT : $(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT") s"
