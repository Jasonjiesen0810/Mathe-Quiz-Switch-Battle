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


def main():
    script = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    k = load_kokoro()
    durs, sr, clips = {}, 24000, []
    for line in script['lines']:
        parts = line.get('parts') or [{'text': line['text']}]
        chunks, starts, pos = [], [], 0.0
        for p in parts:
            a, sr = k.create(p['text'], voice=p.get('voice', line.get('voice', script['voice'])),
                             speed=p.get('speed', line.get('speed', script.get('speed', 1.0))), lang='en-us')
            a = trim(a)
            starts.append(round(line.get('at', 0) + pos, 2))
            pos += len(a) / sr + p.get('pause', 0)
            chunks += [a, np.zeros(int(sr * p.get('pause', 0)), dtype=np.float32)]
        audio = np.concatenate(chunks)
        sf.write(os.path.join(out, line['id'] + '.wav'), audio, sr)
        d = round(len(audio) / sr, 2)
        durs[line['id']] = {'at': line.get('at'), 'len': d,
                            'end': round(line['at'] + d, 2) if 'at' in line else None,
                            'parts': starts}
        print(line['id'], durs[line['id']])
        clips.append((line.get('at'), audio))
    json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)
    if script.get('duration'):
        mix = np.zeros(int(sr * script['duration']), dtype=np.float32)
        for at, a in clips:
            s = int(sr * at)
            n = min(len(a), len(mix) - s)
            mix[s:s + n] += a[:n]
        sf.write(os.path.join(out, 'voiceover_raw.wav'), mix, sr)


if __name__ == '__main__':
    main()
