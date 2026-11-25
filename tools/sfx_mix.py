#!/usr/bin/env python3
"""Mischt Soundeffekte in die Stimmspur: sfx_mix.py <events.json> <voiceover.wav> [sfx-gain]"""
import json, sys, wave, numpy as np, os
SR = 48000
SFX = os.path.join(os.path.dirname(__file__), "..", "materials", "sfx")
GAIN = {"whoosh": .45, "impact": .7, "thud": .5, "brick": .55, "pop": .32, "tick": .3, "ding": .35, "shimmer": .3,
        "riser": .4, "clang": .45, "swish": .45, "glass": .5, "shutter": .45, "scratch": .4, "heartbeat": .6}
def rd(p):
    with wave.open(p) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        return a.reshape(-1, w.getnchannels()).mean(1), w.getframerate(), w.getnchannels()
ev = json.load(open(sys.argv[1])); vo_p = sys.argv[2]; g = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
vo, sr, ch = rd(vo_p); assert sr == SR
track = np.zeros_like(vo); cache = {}
for e in ev:
    n = e["n"]
    if n not in cache: cache[n] = rd(os.path.join(SFX, n + ".wav"))[0]
    s = cache[n]; at = e["at"] - (len(s) / SR if n == "riser" else 0)  # Riser endet auf dem Ereignis
    i = int(max(0, at) * SR); j = min(len(track), i + len(s))
    if j > i: track[i:j] += s[:j - i] * GAIN.get(n, .4) * e.get("v", 1) * g
mix = vo + track
mix /= max(1.0, np.max(np.abs(mix)) / .97)
with wave.open(vo_p, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("SFX:", len(ev), "Ereignisse:", ", ".join(sorted({e['n'] for e in ev})))
