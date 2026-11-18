"""Sprechertext mit Kokoro (kostenlos, lokal) erzeugen.

Aufruf:
  python3 tools/tts.py <script.json> <ausgabe-ordner>

script.json:
  {"voice": "am_michael", "speed": 0.95,
   "lines": [{"id": "s1", "text": "..."}, ...]}

Ergebnis: eine WAV-Datei pro Zeile und durations.json (Länge in Sekunden).
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


def main():
    script = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    k = load_kokoro()
    durs = {}
    for line in script['lines']:
        audio, sr = k.create(line['text'], voice=line.get('voice', script['voice']),
                             speed=line.get('speed', script.get('speed', 1.0)), lang='en-us')
        sf.write(os.path.join(out, line['id'] + '.wav'), audio, sr)
        durs[line['id']] = round(len(audio) / sr, 2)
        print(line['id'], durs[line['id']], 's')
    json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
