"""Generates the sound effects in public/sfx (WAV, 44.1 kHz, mono, 16-bit).

Every sound is synthesized from scratch (sines, noise and envelopes), so there
are no licensing issues. Run: python3 tools/make-sfx.py
Requires numpy.
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
RNG = np.random.default_rng(7)


def t_axis(seconds):
    return np.arange(int(SR * seconds)) / SR


def lowpass_sweep(x, cutoff_hz):
    """One-pole low-pass whose cutoff changes over time (cutoff_hz per sample)."""
    alpha = 1 - np.exp(-2 * np.pi * cutoff_hz / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, a in enumerate(alpha):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff_hz):
    return x - lowpass_sweep(x, np.full_like(x, cutoff_hz))


def bell(t, freq, decay, ratios=(1.0, 2.76, 5.4, 8.93), amps=(1.0, 0.45, 0.22, 0.1)):
    out = np.zeros_like(t)
    for ratio, amp in zip(ratios, amps):
        out += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * decay * (1 + 0.6 * ratio))
    return out


def finish(x, name):
    fade = int(SR * 0.004)
    x = x.copy()
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    peak = np.max(np.abs(x))
    x = x / peak * 0.85
    data = (x * 32767).astype(np.int16)
    path = OUT / name
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())
    rms = float(np.sqrt(np.mean(x**2)))
    print(f"{name:18s} {len(x)/SR:4.2f}s  peak 0.85  rms {rms:.3f}")


def whoosh():
    t = t_axis(0.75)
    noise = RNG.standard_normal(len(t))
    shape = np.sin(np.pi * np.clip(t / 0.75, 0, 1) ** 0.8) ** 2
    cutoff = 400 + 5200 * np.sin(np.pi * np.clip(t / 0.75, 0, 1)) ** 1.5
    y = lowpass_sweep(noise, cutoff) * shape
    return highpass(y, 180)


def impact():
    t = t_axis(0.95)
    freq = 38 + 90 * np.exp(-t * 14)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 4.2)
    burst = lowpass_sweep(RNG.standard_normal(len(t)), np.full(len(t), 3500.0)) * np.exp(-t * 22)
    click = np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 90) * 0.3
    return body * 1.0 + burst * 0.55 + click


def sparkle():
    t = t_axis(1.0)
    out = np.zeros_like(t)
    for i, freq in enumerate([1568, 2093, 2637, 3136, 4186]):
        start = 0.08 * i
        local = np.clip(t - start, 0, None)
        mask = (t >= start).astype(float)
        out += mask * np.sin(2 * np.pi * freq * local) * np.exp(-local * 7) * (0.8 - 0.1 * i)
    return out


def riser():
    t = t_axis(1.5)
    k = t / 1.5
    freq = 180 * (1 + 7 * k**2)
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    saw = 2 * ((np.cumsum(freq) / SR) % 1) - 1
    noise = lowpass_sweep(RNG.standard_normal(len(t)), 300 + 7000 * k**2)
    amp = (0.15 + 0.85 * k**1.6)
    return (0.5 * tone + 0.25 * saw + 0.6 * noise) * amp


def pop():
    t = t_axis(0.22)
    freq = 240 + 520 * np.exp(-t * 38)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 20)
    click = highpass(RNG.standard_normal(len(t)), 2500) * np.exp(-t * 160) * 0.25
    return body + click


def ding():
    t = t_axis(1.3)
    return bell(t, 1318.5, 3.0)


def notification():
    t = t_axis(0.6)
    first = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 9) * (t < 0.14)
    local = np.clip(t - 0.12, 0, None)
    second = (np.sin(2 * np.pi * 1318.5 * local) + 0.3 * np.sin(2 * np.pi * 2637 * local)) * np.exp(-local * 6.5) * (t >= 0.12)
    return first + second


def tick():
    t = t_axis(0.07)
    return highpass(RNG.standard_normal(len(t)), 1800) * np.exp(-t * 90)


def click():
    t = t_axis(0.1)
    return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 70)
            + 0.3 * highpass(RNG.standard_normal(len(t)), 3000) * np.exp(-t * 200))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in [
        ("whoosh.wav", whoosh), ("impact.wav", impact), ("sparkle.wav", sparkle),
        ("riser.wav", riser), ("pop.wav", pop), ("ding.wav", ding),
        ("notification.wav", notification), ("tick.wav", tick), ("click.wav", click),
    ]:
        finish(fn(), name)
