"""Sprechertext mit Kokoro (kostenlos, lokal) erzeugen und auf die Video-Zeitleiste legen.

Aufruf:
  python3 tools/tts.py <script.json> <ausgabe-ordner>

script.json:
  {"voice": "af_bella", "speed": 0.95, "duration": 39,
   "lines": [{"id": "s1", "at": 0.3, "parts": [
       {"text": "Only about three percent of adults...", "speed": 0.9, "pause": 0.35},
       {"text": "have clear, written goals."}]}]}

Mehr Gefühl entsteht durch: kurze Satzteile, Pausen dazwischen, langsameres Tempo
bei wichtigen Stellen, Satzzeichen (… ! —).

Ergebnis: eine WAV pro Zeile, durations.json und voiceover.wav (falls "duration" gesetzt).
"""
import json, sys, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.join(os.path.dirname(__file__), '..', 'materials', 'tts')


def load_kokoro():
    vdir = os.path.join(ROOT, 'voices')
    voices = {f[:-4]: np.fromfile(os.path.join(vdir, f), dtype=np.float32).reshape(-1, 1, 256)
              for f in os.listdir(vdir) if f.endswith('.bin')}
    npz = os.path.join(ROOT, 'voices.npz')
    np.savez(npz, **voices)
    return Kokoro(os.path.join(ROOT, 'model_q8f16.onnx'), npz)


def trim(a, thr=0.004):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 240):idx[-1] + 2400] if len(idx) else a


def voice_of(k, spec):
    """spec: "am_liam" oder {"am_liam":0.7,"am_puck":0.3} (Stimmen mischen)"""
    if isinstance(spec, str):
        return spec
    return sum(k.voices[n] * w for n, w in spec.items()).astype(np.float32)


def pitch_shift(a, f):
    """Tonhöhe ×f (Dauer ändert sich mit 1/f – höher = etwas schneller, wie bei aufgeregter Sprache)."""
    if abs(f - 1) < 1e-3:
        return a
    n = int(len(a) / f)
    return np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)


def split_sentences(text):
    import re
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', text) if x.strip()]


def main():
    script = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    k = load_kokoro()
    durs, sr, clips = {}, 24000, []
    prev_end = 0.0
    for line in script['lines']:
        if line.get('at') == 'auto' or 'after' in line:
            line['at'] = round(max(prev_end + line.get('gap', 0.8), line.get('min_at', 0)), 2)
        parts = line.get('parts') or [{'text': line['text']}]
        chunks, starts, pos = [], [], 0.0
        for p in parts:
            v = voice_of(k, p.get('voice', line.get('voice', script['voice'])))
            sp = p.get('speed', line.get('speed', script.get('speed', 1.0)))
            sents = split_sentences(p['text']) if script.get('sentence_pause') else [p['text']]
            pitches = p.get('pitches') or [p.get('pitch', 1.0)] * len(sents)
            gains = p.get('gains') or [p.get('gain', 1.0)] * len(sents)
            starts.append(round(line.get('at', 0) + pos, 2))
            for si, st in enumerate(sents):
                a, sr = k.create(st, voice=v, speed=sp, lang='en-us')
                a = pitch_shift(trim(a), pitches[min(si, len(pitches) - 1)]) * gains[min(si, len(gains) - 1)]
                gap = script.get('sentence_pause', 0) if si < len(sents) - 1 else p.get('pause', 0)
                pos += len(a) / sr + gap
                chunks += [a, np.zeros(int(sr * gap), dtype=np.float32)]
        audio = np.concatenate(chunks)
        sf.write(os.path.join(out, line['id'] + '.wav'), audio, sr)
        d = round(len(audio) / sr, 2)
        durs[line['id']] = {'at': line.get('at'), 'len': d,
                            'end': round(line['at'] + d, 2) if 'at' in line else None,
                            'parts': starts}
        print(line['id'], durs[line['id']])
        clips.append((line.get('at'), audio))
        prev_end = line['at'] + d
    json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)
    if script.get('duration') == 'auto':
        script['duration'] = round(prev_end + script.get('tail', 2.6), 1)
        durs['_duration'] = script['duration']
        json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)
    if script.get('duration'):
        mix = np.zeros(int(sr * script['duration']), dtype=np.float32)
        for at, a in clips:
            s = int(sr * at)
            n = min(len(a), len(mix) - s)
            mix[s:s + n] += a[:n]
        sf.write(os.path.join(out, 'voiceover_raw.wav'), np.clip(mix, -1, 1), sr)


if __name__ == '__main__':
    main()
