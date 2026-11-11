"""
Musique de fond originale pour la note vocale d'introduction.
Tout est synthétisé ici (aucun échantillon, aucun morceau existant) :

  - piano doux : synthèse additive (partiels légèrement inharmoniques,
    double corde désaccordée, décroissance en deux temps, attaque feutrée),
    notes espacées de la mineur 9 / do majeur 7, sans rythme marqué ;
  - réverbération : réponse impulsionnelle synthétique (~3 s) en stéréo ;
  - oiseaux (option) : quelques gazouillis lointains, rares et légers.

Utilisation :
  scripts/.venv/Scripts/python scripts/compose-musique.py DUREE_S SORTIE.wav [--sans-oiseaux]
"""

from __future__ import annotations

import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(2026)


def midi_hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def piano_note(midi: int, vel: float, length: float) -> np.ndarray:
    """Note de piano douce (mono)."""
    n = int(length * SR)
    t = np.arange(n) / SR
    f0 = midi_hz(midi)
    B = 0.00035  # inharmonicité des cordes
    # Notes graves plus longues
    t60 = np.interp(midi, [40, 76], [7.0, 3.2])
    out = np.zeros(n)
    for k in range(1, 14):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        # Feutre doux : peu d'harmoniques aiguës, plus si la vélocité est forte
        amp = (1 / k**1.35) * np.exp(-(k - 1) * (0.55 - 0.25 * vel))
        decay_fast = t60 / (6 + 2.2 * k)
        decay_slow = t60 / (1.6 + 0.35 * k)
        env = 0.55 * np.exp(-t / decay_fast) + 0.45 * np.exp(-t / decay_slow)
        for det in (-0.9, 0.9):  # deux cordes légèrement désaccordées → battement
            f = fk * 2 ** (det / 1200)
            out += amp * env * np.sin(2 * np.pi * f * t + rng.uniform(0, 2 * np.pi)) * 0.5
    # Attaque feutrée (8 ms) et petit bruit de marteau très discret
    att = np.minimum(1, t / 0.008)
    hammer = rng.normal(0, 1, n) * np.exp(-t / 0.006) * 0.02
    out = (out * att + hammer) * vel
    # Douceur : passe-bas simple (moyenne mobile)
    k = 6
    out = np.convolve(out, np.ones(k) / k, mode='same')
    return out


def bird_call(duration: float) -> np.ndarray:
    """Gazouillis : 3 à 5 petites montées de fréquence rapides."""
    parts = []
    for _ in range(rng.integers(3, 6)):
        d = rng.uniform(0.05, 0.11)
        n = int(d * SR)
        t = np.arange(n) / SR
        f_start = rng.uniform(3200, 4200)
        f_end = f_start * rng.uniform(1.25, 1.6)
        f = f_start * (f_end / f_start) ** (t / d)  # balayage exponentiel
        vib = 1 + 0.03 * np.sin(2 * np.pi * rng.uniform(28, 45) * t)
        phase = 2 * np.pi * np.cumsum(f * vib) / SR
        env = np.sin(np.pi * t / d) ** 2
        tone = (np.sin(phase) + 0.12 * np.sin(2 * phase)) * env
        parts.append(tone)
        parts.append(np.zeros(int(rng.uniform(0.06, 0.14) * SR)))
    call = np.concatenate(parts)
    out = np.zeros(int(duration * SR))
    out[: min(len(call), len(out))] = call[: len(out)]
    return out


def reverb_ir(seconds: float = 3.0) -> np.ndarray:
    """Réponse impulsionnelle stéréo synthétique : bruit à décroissance exponentielle,
    de plus en plus sombre avec le temps, prédélai 22 ms."""
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        noise = rng.normal(0, 1, n)
        # Assombrissement progressif : mélange bruit brut / bruit lissé
        smooth = np.convolve(noise, np.ones(24) / 24, mode='same')
        mix = np.exp(-t / 0.35)
        tail = (mix * noise + (1 - mix) * smooth) * np.exp(-t / 0.75)
        tail[: int(0.022 * SR)] = 0
        ir[:, c] = tail
    return ir / np.sqrt(np.sum(ir**2, axis=0, keepdims=True))


def convolve(x: np.ndarray, ir: np.ndarray) -> np.ndarray:
    n = len(x) + len(ir) - 1
    size = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, size)
    return np.fft.irfft(X * np.fft.rfft(ir, size), size)[:n]


def band_limit(x: np.ndarray, low: float = 85.0, high: float = 9000.0) -> np.ndarray:
    """Coupe douce des graves (grondement de la réverbération) et de l'extrême aigu."""
    n = len(x)
    size = 1 << (n - 1).bit_length()
    X = np.fft.rfft(x, size, axis=0)
    f = np.fft.rfftfreq(size, 1 / SR)
    gain = np.clip((f - (low - 25)) / 50, 0, 1)  # rampe 60 → 110 Hz
    gain = 0.5 - 0.5 * np.cos(np.pi * gain)
    gain *= np.clip((high + 2000 - f) / 4000, 0, 1)
    X *= gain[:, None] if X.ndim == 2 else gain
    return np.fft.irfft(X, size, axis=0)[:n]


def main() -> None:
    duration = float(sys.argv[1])
    out_path = sys.argv[2]
    birds = '--sans-oiseaux' not in sys.argv
    total = int(duration * SR)
    dry = np.zeros(total)

    # Notes espacées, irrégulières (temps, notes MIDI, vélocité) — la mineur 9 / do majeur 7
    score = [
        (0.15, [45, 52], 0.42),       # la2 + mi3
        (1.7, [60], 0.36),            # do4
        (3.5, [59], 0.33),            # si3
        (5.9, [55, 64], 0.38),        # sol3 + mi4
        (8.4, [60], 0.32),            # do4
        (10.7, [45, 55], 0.40),       # la2 + sol3
        (13.0, [64], 0.30),           # mi4
        (15.3, [59], 0.33),           # si3
        (17.8, [48, 55, 59], 0.36),   # do3 + sol3 + si3 (do majeur 7)
        (20.1, [64], 0.30),           # mi4
        (22.2, [59], 0.30),           # si3
        (23.9, [45, 52, 60], 0.38),   # la2 + mi3 + do4 (résolution)
    ]
    # Morceaux plus longs : la phrase revient, variée (voicings et temps légèrement
    # différents), sans boucle mécanique
    period = 24.6
    variants = {64: 67, 59: 62, 60: 64, 55: 57}
    k = 1
    base = list(score)
    while k * period < duration - 3:
        for start, notes, vel in base:
            t = start + k * period + rng.uniform(-0.35, 0.35)
            if t > duration - 3:
                break
            moved = [variants.get(m, m) if rng.random() < 0.35 else m for m in notes]
            score.append((t, moved, vel * rng.uniform(0.88, 1.0)))
        k += 1
    # Accord de résolution final (la mineur 9) juste avant la fin de la musique
    score = [e for e in score if e[0] < duration - 3.5]
    score.append((max(0.2, duration - 3.2), [45, 52, 59, 60], 0.34))
    for start, notes, vel in score:
        for i, m in enumerate(notes):
            s = int((start + i * rng.uniform(0.015, 0.05)) * SR)  # léger arpège humain
            if s >= total:
                continue
            note = piano_note(m, vel * rng.uniform(0.92, 1.05), min(7.5, duration - start + 0.5))
            end = min(total, s + len(note))
            dry[s:end] += note[: end - s]

    ir = reverb_ir(3.0)
    wet = np.stack([convolve(dry, ir[:, c])[:total] for c in range(2)], axis=1)
    piano = 0.62 * np.stack([dry, dry], axis=1) + 0.55 * wet

    mix = piano
    if birds:
        layer = np.zeros((total, 2))
        starts = [4.6 + 7.2 * i for i in range(int(duration // 7.2) + 1)]
        for start in starts:  # rares
            if start + 1.2 > duration:
                continue
            call = bird_call(1.2)
            pan = rng.uniform(0.2, 0.8)
            s = int(start * SR)
            e = s + len(call)
            layer[s:e, 0] += call * (1 - pan)
            layer[s:e, 1] += call * pan
        # Lointain : très bas, adouci, avec beaucoup de réverbération
        layer = np.stack([np.convolve(layer[:, c], np.ones(5) / 5, mode='same') for c in range(2)], axis=1)
        far = np.stack([convolve(layer[:, c], ir[:, c])[:total] for c in range(2)], axis=1)
        mix = mix + 0.035 * layer + 0.05 * far

    mix = band_limit(mix)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.7
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{out_path} : {duration:.2f} s, oiseaux = {birds}')


if __name__ == '__main__':
    main()
