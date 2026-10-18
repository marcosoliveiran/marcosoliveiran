"""Gera os efeitos sonoros da publi Hering em public/sfx (WAV, 44,1 kHz, mono).

Tudo sintetizado do zero (sem direitos autorais), curto, agudo e suave, para ficar
por baixo da narração sem cobrir a voz. Uso: python3 tools/make-sfx-hering.py
Precisa de numpy.

  h-tecla.wav      toque de tecla (a barra de busca digitando, a contagem do preço)
  h-suave.wav      deslize leve (entrada de painéis e troca de peça)
  h-ping.wav       ping limpo (cada ícone que aparece)
  h-nome.wav       duas notas curtas (o nome "Camiseta Brasil" aparecendo)
  h-esticar.wav    glissando elástico (a gola esticando e voltando)
  h-claquete.wav   estalo de claquete (a claquete fechando)
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
RNG = np.random.default_rng(23)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def highpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    prev_x = 0.0
    prev_y = 0.0
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


def finish(x, name, peak=0.85):
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
    print(f"{name:16s} {len(x) / SR:4.2f}s")


def tecla():
    t = t_axis(0.05)
    click = highpass(RNG.standard_normal(len(t)), 2500) * np.exp(-t * 180)
    tick = np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 220) * 0.6
    finish(click + tick, "h-tecla.wav")


def suave():
    t = t_axis(0.5)
    noise = RNG.standard_normal(len(t))
    swept = lowpass(highpass(noise, 700), 3200)
    env = np.sin(np.pi * np.clip(t / 0.5, 0, 1)) ** 2
    finish(swept * env, "h-suave.wav")


def ping():
    t = t_axis(0.7)
    tone = np.sin(2 * np.pi * 1318.5 * t) + 0.3 * np.sin(2 * np.pi * 2637 * t)
    env = np.exp(-t * 7) * np.minimum(1, t / 0.003)
    finish(tone * env, "h-ping.wav")


def nome():
    t = t_axis(0.95)
    out = np.zeros_like(t)
    for freq, at in ((784.0, 0.0), (1174.7, 0.1)):
        i = int(at * SR)
        tt = t[: len(t) - i]
        tone = np.sin(2 * np.pi * freq * tt) + 0.25 * np.sin(2 * np.pi * freq * 2 * tt)
        out[i:] += tone * np.exp(-tt * 5) * np.minimum(1, tt / 0.004)
    finish(out, "h-nome.wav")


def esticar():
    t = t_axis(0.95)
    # sobe e volta, como um elástico que estica e solta
    glide = np.where(t < 0.5, 300 + 520 * (t / 0.5), 820 - 500 * ((t - 0.5) / 0.45))
    phase = 2 * np.pi * np.cumsum(glide) / SR
    tone = np.sin(phase) + 0.2 * np.sin(2 * phase)
    env = np.sin(np.pi * np.clip(t / 0.95, 0, 1)) ** 1.5
    finish(tone * env, "h-esticar.wav")


def claquete():
    t = t_axis(0.22)
    snap = lowpass(highpass(RNG.standard_normal(len(t)), 900), 5000) * np.exp(-t * 90)
    thump = np.sin(2 * np.pi * 170 * t) * np.exp(-t * 60) * 0.9
    finish(snap + thump, "h-claquete.wav")


if __name__ == "__main__":
    tecla()
    suave()
    ping()
    nome()
    esticar()
    claquete()
