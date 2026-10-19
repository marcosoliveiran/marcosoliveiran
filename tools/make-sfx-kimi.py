"""Gera os efeitos sonoros do vídeo do Kimi em public/sfx (WAV, 44,1 kHz, mono).

Tudo sintetizado do zero (sem direitos autorais), curto e baixo, para ficar por
baixo da voz. Uso: python3 tools/make-sfx-kimi.py   (precisa de numpy)

  k-corte.wav   swish curtíssimo com batida grave leve (cada corte de câmera)
  k-zoom.wav    aproximação: ar subindo e fechando (corte para plano mais fechado)
  k-card.wav    deslize suave com um toque (cartão de foto entrando / trocando)
  k-dot.wav     blip curto (cada bolinha que acende; o código sobe o tom)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
RNG = np.random.default_rng(5)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def highpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev_x = prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = a * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


def lowpass(x, cutoff):
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def finish(x, name, peak=0.8):
    x = x.copy()
    fade = int(SR * 0.004)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    x = x / np.max(np.abs(x)) * peak
    with wave.open(str(OUT / name), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((x * 32767).astype(np.int16).tobytes())
    print(f"{name:14s} {len(x) / SR:4.2f}s")


def corte():
    t = t_axis(0.16)
    air = lowpass(highpass(RNG.standard_normal(len(t)), 1200), 6500)
    air *= np.sin(np.pi * np.clip(t / 0.16, 0, 1)) ** 1.5
    thump = np.sin(2 * np.pi * (140 - 70 * t / 0.16) * t) * np.exp(-t * 38)
    finish(air * 0.7 + thump * 0.9, "k-corte.wav")


def zoom():
    d = 0.34
    t = t_axis(d)
    noise = RNG.standard_normal(len(t))
    sweep = lowpass(highpass(noise, 500), 4200)
    env = (t / d) ** 2 * np.exp(-((t / d) ** 6) * 0.2)
    env[int(len(t) * 0.88):] *= np.linspace(1, 0, len(t) - int(len(t) * 0.88))
    tone = np.sin(2 * np.pi * (260 + 900 * (t / d) ** 2) * t) * env * 0.25
    finish(sweep * env + tone, "k-zoom.wav")


def card():
    d = 0.3
    t = t_axis(d)
    noise = RNG.standard_normal(len(t))
    swept = lowpass(highpass(noise, 900), 3600)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    tap = np.sin(2 * np.pi * 620 * t) * np.exp(-t * 55) * 0.35
    finish(swept * env * 0.8 + tap, "k-card.wav", peak=0.7)


def dot():
    t = t_axis(0.12)
    blip = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 36)
    blip += np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 60) * 0.25
    finish(blip, "k-dot.wav", peak=0.7)


if __name__ == "__main__":
    corte()
    zoom()
    card()
    dot()
