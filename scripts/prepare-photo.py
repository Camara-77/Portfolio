"""
Préparation du portrait (à lancer une seule fois).

  1. (optionnel) redresse la photo           --rotate DEG
  2. détoure le sujet avec le modèle ISNet de rembg (isnet-general-use.onnx)
     exécuté directement avec onnxruntime (version légère de rembg)
  3. recadre en portrait 4:5 autour du sujet
  4. exporte deux images transparentes, alignées, de même taille :
       public/images/portrait-nb.webp      noir et blanc contrasté
       public/images/portrait-orange.webp  duotone ombres noires -> lumières #FF6B1A

Installation (depuis la racine du projet) :
  python -m venv scripts/.venv
  scripts/.venv/Scripts/pip install --no-cache-dir onnxruntime pillow numpy
  curl -L -o scripts/.models/isnet-general-use.onnx \
    https://github.com/danielgatis/rembg/releases/download/v0.0.0/isnet-general-use.onnx

Utilisation :
  scripts/.venv/Scripts/python scripts/prepare-photo.py
"""

from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "source" / "photo-originale.png"
MODEL = ROOT / "scripts" / ".models" / "isnet-general-use.onnx"
OUT = ROOT / "public" / "images"
MAX_BYTES = 300 * 1024
ACCENT = np.array([0xFF, 0x6B, 0x1A], dtype=np.float32)


# ---------------------------------------------------------------- détourage
def segment(img: Image.Image) -> Image.Image:
    """Masque alpha (L) du sujet — même pré/post-traitement que rembg/ISNet."""
    sess = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
    size = 1024
    x = np.asarray(img.convert("RGB").resize((size, size), Image.LANCZOS), dtype=np.float32)
    x = x / max(x.max(), 1e-6)
    x = (x - 0.5) / 1.0
    x = x.transpose(2, 0, 1)[None]
    pred = sess.run(None, {sess.get_inputs()[0].name: x})[0][:, 0, :, :]
    pred = (pred - pred.min()) / max(pred.max() - pred.min(), 1e-6)
    mask = Image.fromarray((np.squeeze(pred) * 255).astype(np.uint8), "L")
    mask = mask.resize(img.size, Image.LANCZOS)

    # Nettoie les bords : courbe douce (supprime le halo beige résiduel)
    m = np.asarray(mask, dtype=np.float32) / 255.0
    m = np.clip((m - 0.12) / 0.76, 0, 1)
    m = m * m * (3 - 2 * m)  # smoothstep
    return Image.fromarray((m * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6))


def decontaminate(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Retire la teinte beige du fond dans les pixels de bord semi-transparents."""
    a = alpha[..., None]
    bg = np.median(rgb[alpha < 0.02], axis=0) if (alpha < 0.02).any() else np.zeros(3)
    edge = (a > 0.02) & (a < 0.98)
    fixed = (rgb - (1 - a) * bg) / np.clip(a, 0.15, 1)
    return np.where(edge, np.clip(fixed, 0, 255), rgb)


# ---------------------------------------------------------------- recadrage
def crop_box(alpha: Image.Image, ratio: float = 4 / 5, spread: float = 1.12) -> tuple[int, int, int, int]:
    """Cadre portrait 4:5 : tête en haut avec un peu d'air, centré sur le sujet."""
    a = np.asarray(alpha) > 40
    ys, xs = np.where(a)
    top, bottom = ys.min(), ys.max()
    left, right = xs.min(), xs.max()
    w_img, h_img = alpha.size

    pad_top = int((bottom - top) * 0.05)
    y0 = max(0, top - pad_top)
    width = min(w_img, int((right - left) * spread))
    height = int(width / ratio)
    if y0 + height > h_img:
        height = h_img - y0
        width = int(height * ratio)
    cx = (left + right) // 2
    x0 = int(np.clip(cx - width // 2, 0, w_img - width))
    return x0, y0, x0 + width, y0 + height


# ---------------------------------------------------------------- étalonnage
def luminance(rgb: np.ndarray) -> np.ndarray:
    return (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255.0


def contrast(l: np.ndarray, lo: float, hi: float, gamma: float) -> np.ndarray:
    """Étire l'histogramme entre les percentiles lo/hi, gamma, puis courbe en S."""
    a, b = np.percentile(l, [lo, hi])
    l = np.clip((l - a) / max(b - a, 1e-6), 0, 1) ** gamma
    return l * l * (3 - 2 * l) * 0.55 + l * 0.45


def to_bw(l: np.ndarray) -> np.ndarray:
    v = (l * 255).astype(np.uint8)
    return np.stack([v, v, v], axis=-1)


def to_orange(l: np.ndarray) -> np.ndarray:
    """Duotone : ombres noires -> #FF6B1A -> lumières orange claires."""
    hi = np.array([0xFF, 0xC4, 0x96], dtype=np.float32)
    l = l[..., None]
    lo_part = np.clip(l / 0.72, 0, 1) * ACCENT
    hi_part = ACCENT + np.clip((l - 0.72) / 0.28, 0, 1) * (hi - ACCENT)
    return np.where(l <= 0.72, lo_part, hi_part).astype(np.uint8)


# ---------------------------------------------------------------- export
def save_webp(rgb: np.ndarray, alpha: np.ndarray, path: Path) -> int:
    img = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
    for q in range(88, 40, -4):
        buf = BytesIO()
        img.save(buf, "WEBP", quality=q, alpha_quality=90, method=6)
        if buf.tell() <= MAX_BYTES:
            break
    path.write_bytes(buf.getvalue())
    return buf.tell()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rotate", type=float, default=0.0, help="angle de redressement (degrés)")
    ap.add_argument("--spread", type=float, default=1.3, help="largeur du cadre / largeur du sujet")
    ap.add_argument("--fade", type=float, default=0.62, help="début du fondu bas (0-1)")
    ap.add_argument("--width", type=int, default=720, help="largeur de sortie (px)")
    args = ap.parse_args()

    if not MODEL.exists():
        raise SystemExit(f"Modèle introuvable : {MODEL}\nVoir les instructions en tête de fichier.")

    img = Image.open(SRC).convert("RGB")
    if args.rotate:
        img = img.rotate(args.rotate, resample=Image.BICUBIC, expand=True, fillcolor=(0, 0, 0))

    print("Détourage…")
    alpha_img = segment(img)
    box = crop_box(alpha_img, spread=args.spread)
    img, alpha_img = img.crop(box), alpha_img.crop(box)

    if img.width > args.width:
        h = round(img.height * args.width / img.width)
        img = img.resize((args.width, h), Image.LANCZOS)
        alpha_img = alpha_img.resize((args.width, h), Image.LANCZOS)

    rgb = np.asarray(img, dtype=np.float32)
    alpha = np.asarray(alpha_img, dtype=np.float32) / 255.0
    rgb = decontaminate(rgb, alpha)

    # Fondu vers le bas : le buste se fond dans le fond noir (masque aussi la chaise)
    h = alpha.shape[0]
    t = np.clip((np.arange(h) / h - args.fade) / (1 - args.fade), 0, 1)
    fade = 1 - t * t * (3 - 2 * t)
    alpha = alpha * fade[:, None]

    # Coin bas-gauche : estompe le dossier de chaise visible derrière le coude
    def smooth(e0: float, e1: float, v: np.ndarray) -> np.ndarray:
        k = np.clip((v - e0) / (e1 - e0), 0, 1)
        return k * k * (3 - 2 * k)

    w = alpha.shape[1]
    ys, xs = np.mgrid[0:h, 0:w]
    corner = smooth(0.55, 0.72, ys / h) * (1 - smooth(0.13, 0.30, xs / w))
    alpha = alpha * (1 - corner)

    # Étalonnage calculé sur le sujet seulement
    l = luminance(rgb)
    subject = alpha > 0.5
    a, b = np.percentile(l[subject], [1.5, 99.5])
    l = np.clip((l - a) / max(b - a, 1e-6), 0, 1)

    bw = contrast(l, 0, 100, 0.95)
    orange = contrast(l, 0, 100, 0.85)

    OUT.mkdir(parents=True, exist_ok=True)
    a8 = (alpha * 255).astype(np.uint8)
    n1 = save_webp(to_bw(bw), a8, OUT / "portrait-nb.webp")
    n2 = save_webp(to_orange(orange), a8, OUT / "portrait-orange.webp")
    print(f"Taille : {img.width}x{img.height}")
    print(f"portrait-nb.webp     {n1 / 1024:.0f} Ko")
    print(f"portrait-orange.webp {n2 / 1024:.0f} Ko")


if __name__ == "__main__":
    main()
