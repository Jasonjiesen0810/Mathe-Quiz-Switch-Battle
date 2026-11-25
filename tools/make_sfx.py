#!/usr/bin/env python3
"""Erzeugt eine eigene, lizenzfreie Soundeffekt-Bibliothek (synthetisch) in materials/sfx/.
Aufruf: python3 tools/make_sfx.py"""
import numpy as np, wave, os

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "materials", "sfx")
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def noise(d):
    return rng.uniform(-1, 1, int(SR * d))


def band(x, lo, hi):
    """statischer Bandpass per FFT"""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def sweep_band(x, lo0, lo1, width=1.6, chunk=1024):
    """zeitlich wandernder Bandpass (Whoosh/Riser)"""
    out = np.zeros_like(x)
    n = len(x)
    win = np.hanning(chunk * 2)
    for s in range(0, n, chunk):
        seg = x[max(0, s - chunk // 2):s + chunk * 2 - chunk // 2]
        if len(seg) < 64:
            continue
        k = s / n
        c = lo0 * (lo1 / lo0) ** k
        y = band(seg, c / width, c * width)
        w = np.hanning(len(y))
        a = max(0, s - chunk // 2)
        out[a:a + len(y)] += y * w
    return out


def env(d, att, dec_pow=1.0, shape="exp", k=6):
    t = t_(d)
    a = np.clip(t / max(att, 1e-4), 0, 1)
    if shape == "exp":
        r = np.exp(-k * np.clip(t - att, 0, None))
    else:  # glocke
        r = np.sin(np.pi * np.clip(t / d, 0, 1)) ** dec_pow
    return a * r


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def sine_sweep(d, f0, f1, k):
    t = t_(d)
    f = f1 + (f0 - f1) * np.exp(-k * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


os.makedirs(OUT, exist_ok=True)

# Whoosh – Kamera-Whip / schnelle Bewegung
d = .55
save("whoosh", norm(sweep_band(noise(d), 300, 2600) * env(d, 0, 2.2, "bell"), .8))

# Impact – großer Schlag (Hook / Twist)
d = 1.4; t = t_(d)
x = .9 * sine_sweep(d, 150, 38, 9) * np.exp(-3.2 * t) + .35 * band(noise(d), 40, 4000) * np.exp(-28 * t)
save("impact", norm(x, .95))

# Thud – kleiner dumpfer Schlag
d = .4; t = t_(d)
x = sine_sweep(d, 140, 55, 18) * np.exp(-11 * t) + .25 * band(noise(d), 60, 1500) * np.exp(-45 * t)
save("thud", norm(x, .9))

# Brick – Ziegel landet (dumpf + Körnung)
d = .45; t = t_(d)
x = .8 * sine_sweep(d, 180, 70, 20) * np.exp(-13 * t) + .55 * band(noise(d), 200, 3500) * np.exp(-24 * t)
save("brick", norm(x, .9))

# Pop – Element erscheint
d = .16; t = t_(d)
x = sine_sweep(d, 1100, 320, 55) * np.exp(-26 * t) * np.clip(t / .003, 0, 1)
save("pop", norm(x, .7))

# Tick – kleiner Klick (Zähler, Striche)
d = .05; t = t_(d)
x = band(noise(d), 1800, 6000) * np.exp(-140 * t) + .5 * np.sin(2 * np.pi * 2400 * t) * np.exp(-90 * t)
save("tick", norm(x, .6))

# Ding – Erfolg / Gold
d = 1.6; t = t_(d)
x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-k * t) for f, a, k in [(1318.5, 1, 2.6), (2637, .35, 4), (1975.5, .25, 3.2), (3951, .12, 6)])
save("ding", norm(x * np.clip(t / .002, 0, 1), .6))

# Shimmer – Lichtblitz / Erkenntnis
d = 1.5; t = t_(d)
x = sum(np.sin(2 * np.pi * f * t + i) * (1 + .5 * np.sin(2 * np.pi * (6 + i) * t)) for i, f in enumerate([1760, 2217, 2637, 3520, 4434]))
x = x * np.exp(-2.4 * t) * np.clip(t / .02, 0, 1) + .25 * band(noise(d), 5000, 12000) * np.exp(-3.5 * t)
save("shimmer", norm(x, .55))

# Riser – Spannung vor dem Twist (endet am Ende der Datei)
d = 1.6
x = sweep_band(noise(d), 250, 5000, 1.4) * (t_(d) / d) ** 2.2
save("riser", norm(x, .6))

# Clang – Ball trifft Ring (metallisch)
d = .7; t = t_(d)
x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-k * t) for f, a, k in [(523, 1, 7), (1387, .6, 9), (2093, .45, 11), (3310, .25, 14)])
x += .3 * band(noise(d), 1500, 7000) * np.exp(-60 * t)
save("clang", norm(x, .6))

# Swish – Ball durchs Netz
d = .35
save("swish", norm(band(noise(d), 2500, 9000) * env(d, 0, 1.4, "bell"), .55))

# Glass – Glas zersplittert
d = 1.1; t = t_(d)
x = .6 * band(noise(d), 3000, 12000) * np.exp(-9 * t)
for i in range(14):
    s = rng.uniform(0, .45); f = rng.uniform(2500, 7000)
    m = t >= s
    x[m] += rng.uniform(.2, .5) * np.sin(2 * np.pi * f * (t[m] - s)) * np.exp(-30 * (t[m] - s))
save("glass", norm(x, .7))

# Shutter – Kamera-Klick (Foto)
d = .25; t = t_(d)
x = band(noise(d), 800, 8000) * (np.exp(-80 * t) + .7 * np.exp(-80 * np.clip(t - .09, 0, None)) * (t > .09))
save("shutter", norm(x, .65))

# Scratch – Stift streicht durch
d = .4; t = t_(d)
x = band(noise(d), 1200, 5000) * (.6 + .4 * np.sin(2 * np.pi * 38 * t)) * env(d, 0, 1, "bell")
save("scratch", norm(x, .5))

# Heartbeat – tiefer Herzschlag (Spannung)
d = .9; t = t_(d)
b = lambda s: sine_sweep(d, 90, 45, 14) * np.exp(-14 * np.clip(t - s, 0, None)) * (t >= s)
save("heartbeat", norm(b(0) + .7 * np.roll(b(0), int(.22 * SR)), .85))

# Clap – kurzer Applaus (viele Klatscher)
d = 1.6; t = t_(d); x = np.zeros_like(t)
for i in range(70):
    s0 = rng.uniform(0, 1.1); m = t >= s0
    x[m] += rng.uniform(.4, 1) * band(noise(d), 900, 5000)[m] * np.exp(-90 * (t[m] - s0))
save("clap", norm(x * np.clip((d - t) / .5, 0, 1), .6))

# Alarm – Wecker-Piepen
d = .9; t = t_(d)
gate = ((t * 8) % 1 < .5) * (t < .75)
save("alarm", norm(np.sign(np.sin(2 * np.pi * 2000 * t)) * .5 * gate * np.exp(-.8 * t), .35))

# Switch – Licht aus/an
d = .12; t = t_(d)
save("switch", norm(band(noise(d), 600, 6000) * np.exp(-120 * t) + .6 * np.sin(2 * np.pi * 180 * t) * np.exp(-60 * t), .7))

print("SFX erstellt:", sorted(os.listdir(OUT)))
