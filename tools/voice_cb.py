"""Hörspiel-Stimme mit Chatterbox (kostenlos, MIT) – jeder Satz mit eigener Regieanweisung.

Aufruf (mit der Chatterbox-Umgebung):
  HF_HUB_DISABLE_XET=1 <cbenv>/bin/python tools/voice_cb.py <script.json> <ausgabe-ordner>

script.json:
  {"ref": "materials/tts/ref_liam.wav", "duration": "auto",
   "lines": [{"id": "a", "at": 0.4, "parts": [
       {"text": "Listen to me.", "dir": "intense", "before": 0.6, "pause": 0.8},
       {"text": "They're not!", "dir": "shout", "speed": 0.95, "pitch": 1.5}]}]}

dir:   whisper | soft | calm | normal | story | intense | shout
speed: Tempo-Faktor (0.8 langsam … 1.2 schnell), pitch: Halbtöne (−3 … +3), gain: Lautstärke
before/pause: Pause vor/nach dem Satz in Sekunden
"""
import json, os, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
import torch
from chatterbox.tts import ChatterboxTTS

DIRS = {  # exaggeration, cfg_weight, gain, speed, pitch, temperature
    'whisper': (0.30, 0.55, 0.55, 0.94, -1.0, 0.7),
    'soft':    (0.38, 0.50, 0.75, 0.96, -0.5, 0.75),
    'calm':    (0.45, 0.50, 0.90, 1.00, 0.0, 0.8),
    'normal':  (0.55, 0.50, 1.00, 1.03, 0.0, 0.8),
    'story':   (0.55, 0.55, 0.95, 1.12, 0.0, 0.8),
    'intense': (0.85, 0.35, 1.12, 0.95, 0.5, 0.85),
    'shout':   (1.15, 0.30, 1.35, 1.00, 1.5, 0.9),
}


def fx(audio, sr, speed, pitch):
    """Tempo & Tonhöhe getrennt verändern (rubberband, klingt natürlich)."""
    if abs(speed - 1) < 1e-3 and abs(pitch) < 1e-3:
        return audio
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, 'a.wav'), os.path.join(d, 'b.wav')
        sf.write(a, audio, sr)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a, '-af',
                        f'rubberband=tempo={speed}:pitch={2 ** (pitch / 12):.5f}:formant=preserved', b], check=True)
        out, _ = sf.read(b, dtype='float32')
    return out


def trim(a, thr=0.006):
    idx = np.where(np.abs(a) > thr)[0]
    return a[max(0, idx[0] - 200):idx[-1] + 1800] if len(idx) else a


def main():
    script = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    torch.manual_seed(script.get('seed', 7))
    m = ChatterboxTTS.from_pretrained(device='cpu')
    sr = m.sr
    ref = script.get('ref')
    durs, clips, prev_end, tags = {}, [], 0.0, {}
    for line in script['lines']:
        if line.get('at') == 'auto':
            line['at'] = round(max(prev_end + line.get('gap', 0.8), line.get('min_at', 0)), 2)
        chunks, starts, pos = [], [], 0.0
        for p in line['parts']:
            ex, cfg, g, sp, pt, temp = DIRS[p.get('dir', 'normal')]
            ex = p.get('ex', ex); cfg = p.get('cfg', cfg)
            before = p.get('before', 0)
            if before:
                chunks.append(np.zeros(int(sr * before), np.float32)); pos += before
            starts.append(round(line['at'] + pos, 2))
            if p.get('tag'): tags[p['tag']] = starts[-1]
            w = m.generate(p['text'], audio_prompt_path=ref, exaggeration=ex, cfg_weight=cfg, temperature=temp)
            a = trim(w.squeeze(0).numpy().astype(np.float32))
            a = fx(a, sr, p.get('speed', sp), p.get('pitch', pt)) * p.get('gain', g)
            gap = p.get('pause', 0.7)
            chunks += [a, np.zeros(int(sr * gap), np.float32)]
            pos += len(a) / sr + gap
            print(f"  {p.get('dir','normal'):8s} {len(a)/sr:5.2f}s  {p['text'][:60]}", flush=True)
        audio = np.concatenate(chunks)
        sf.write(os.path.join(out, line['id'] + '.wav'), audio, sr)
        d = round(len(audio) / sr, 2)
        durs[line['id']] = {'at': line['at'], 'len': d, 'end': round(line['at'] + d, 2), 'parts': starts}
        print(line['id'], durs[line['id']], flush=True)
        clips.append((line['at'], audio))
        prev_end = line['at'] + d - line['parts'][-1].get('pause', 0.7)
    dur = script.get('duration', 'auto')
    if dur == 'auto':
        dur = round(prev_end + script.get('tail', 2.8), 1)
    durs['_duration'] = dur
    durs['_tags'] = tags
    json.dump(durs, open(os.path.join(out, 'durations.json'), 'w'), indent=1)
    mix = np.zeros(int(sr * dur), np.float32)
    for at, a in clips:
        s = int(sr * at); n = min(len(a), len(mix) - s)
        mix[s:s + n] += a[:n]
    peak = np.abs(mix).max()
    if peak > 0.98:
        mix *= 0.98 / peak
    sf.write(os.path.join(out, 'voiceover_raw.wav'), mix, sr)


if __name__ == '__main__':
    main()
