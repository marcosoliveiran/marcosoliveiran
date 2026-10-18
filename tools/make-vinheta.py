"""Gera as vinhetas de sitcom da publi Hering em public/sfx (WAV,
44,1 kHz, mono, 16 bits). Tudo sintetizado do zero, sem direitos autorais.

Uso: python3 tools/make-vinheta.py      (precisa de numpy)

  vinheta.wav        ~2,3 s, melodia alegre tipo marimba (abertura da "série")
  vinheta-curta.wav  ~0,9 s, passagem entre cenas

Palmas e risada de plateia não são geradas aqui (sintético soa falso, testado):
usar arquivos reais do CapCut ou de banco livre de uso comercial.
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
RNG = np.random.default_rng(11)


def pluck(freq, seconds, decay=7.0):
    t = np.arange(int(SR * seconds)) / SR
    tone = (
        np.sin(2 * np.pi * freq * t)
        + 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 10)
        + 0.12 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t * 18)
    )
    return tone * np.exp(-t * decay) * np.minimum(1, t / 0.004)


def place(buf, sound, at):
    i = int(SR * at)
    buf[i : i + len(sound)] += sound[: len(buf) - i]


def finish(x, name):
    x = x.copy()
    fade = int(SR * 0.01)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade * 4 :] *= np.linspace(1, 0, fade * 4)
    x = x / np.max(np.abs(x)) * 0.85
    with wave.open(str(OUT / name), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((x * 32767).astype(np.int16).tobytes())
    print(f"{name:18s} {len(x) / SR:4.2f}s")


NOTE = {"C3": 130.81, "G3": 196.0, "C4": 261.63, "E4": 329.63, "G4": 392.0,
        "C5": 523.25, "E5": 659.25, "G5": 783.99, "C6": 1046.5}


def vinheta():
    buf = np.zeros(int(SR * 2.3))
    melody = [("G4", 0.0), ("C5", 0.16), ("E5", 0.32), ("G5", 0.48),
              ("E5", 0.72), ("G5", 0.88), ("C6", 1.04)]
    for name, at in melody:
        place(buf, 0.7 * pluck(NOTE[name], 0.9), at)
    for name in ("C4", "E4", "G4", "C5"):
        place(buf, 0.45 * pluck(NOTE[name], 1.2, decay=3.5), 1.04)
    place(buf, 0.9 * pluck(NOTE["C3"], 1.4, decay=3.0), 0.0)
    place(buf, 0.9 * pluck(NOTE["G3"], 1.2, decay=3.0), 0.72)
    place(buf, 0.9 * pluck(NOTE["C3"], 1.4, decay=2.5), 1.04)
    finish(buf, "vinheta.wav")


def vinheta_curta():
    buf = np.zeros(int(SR * 0.95))
    for name, at in [("G4", 0.0), ("C5", 0.1), ("E5", 0.2), ("G5", 0.3)]:
        place(buf, 0.7 * pluck(NOTE[name], 0.6, decay=9), at)
    for name in ("C4", "E4", "G4"):
        place(buf, 0.4 * pluck(NOTE[name], 0.6, decay=6), 0.3)
    place(buf, 0.8 * pluck(NOTE["C3"], 0.6, decay=6), 0.3)
    finish(buf, "vinheta-curta.wav")


if __name__ == "__main__":
    vinheta()
    vinheta_curta()
