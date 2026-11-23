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


import re, difflib
_WH = None
def whisper():
    global _WH
    if _WH is None:
        from faster_whisper import WhisperModel
        _WH = WhisperModel('small.en', device='cpu', compute_type='int8')
    return _WH

def words_of(t):
    return re.findall(r"[a-z0-9']+", t.lower().replace("’", "'"))

def analyse(a, sr, text):
    """Bewertet eine Aufnahme: fehlende/falsche Wörter, Stocken, unsichere Wörter, Geräusche."""
    x = np.interp(np.arange(0, len(a), sr / 16000), np.arange(len(a)), a).astype(np.float32)
    segs, _ = whisper().transcribe(x, language='en', word_timestamps=True, beam_size=5)
    W = [w for sg in segs for w in sg.words]
    if not W:
        return 999, W
    hyp = words_of(' '.join(w.word for w in W)); ref = words_of(text)
    sm = difflib.SequenceMatcher(None, ref, hyp)
    errs = sum(max(i2 - i1, j2 - j1) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != 'equal')
    allowed = text.count(',') + text.count('...') + text.count('…') + text.count('.') + text.count('?')
    gaps = sorted([W[i].start - W[i - 1].end for i in range(1, len(W))], reverse=True)
    stutter = sum(max(0, g - 0.3) for g in gaps[allowed:]) + sum(max(0, g - 0.9) for g in gaps[:allowed])
    unsure = sum(1 for w in W if w.probability < 0.55)
    # Geräusch in Lücken (Rascheln/Atmen): Pegel zwischen den Wörtern
    noise = 0.0
    for i in range(1, len(W)):
        s0, s1 = int(W[i - 1].end * sr) + 240, int(W[i].start * sr) - 240
        if s1 - s0 > sr * 0.08:
            noise = max(noise, float(np.sqrt(np.mean(a[s0:s1] ** 2))))
    score = errs * 10 + stutter * 6 + unsure * 1.5 + max(0, noise - 0.01) * 80
    return score, W

def clean(a, sr, W, text):
    """Schneidet Atmen/Rascheln an den Rändern weg und ersetzt Lücken durch echte Stille (Zögern gekürzt)."""
    if not W:
        return a
    fade = int(sr * 0.012)
    start = max(0, int((W[0].start - 0.06) * sr)); end = min(len(a), int((W[-1].end + 0.16) * sr))
    pieces, cur = [], start
    for i in range(1, len(W)):
        g0, g1 = int((W[i - 1].end + 0.04) * sr), int((W[i].start - 0.03) * sr)
        if g1 - g0 > sr * 0.06:
            pieces.append(a[cur:g0].copy())
            pun = W[i - 1].word.strip()[-1:] in ',.?!…'
            keep = min((g1 - g0) / sr, 0.42 if pun else 0.16)
            pieces.append(np.zeros(int(sr * keep), np.float32))
            cur = g1
    pieces.append(a[cur:end].copy())
    for k, pc in enumerate(pieces):
        if k % 2 == 0 and len(pc) > 2 * fade:          # Sprachstücke weich ein-/ausblenden (keine Klicks)
            if k > 0: pc[:fade] *= np.linspace(0, 1, fade)
            if k < len(pieces) - 1: pc[-fade:] *= np.linspace(1, 0, fade)
    return np.concatenate(pieces).astype(np.float32)


DIRS = {  # exaggeration, cfg_weight, gain, speed, pitch, temperature
    'whisper': (0.30, 0.55, 0.55, 0.94, -1.0, 0.55),
    'soft':    (0.38, 0.55, 0.78, 0.96, -0.5, 0.6),
    'calm':    (0.45, 0.55, 0.90, 1.00, 0.0, 0.6),
    'normal':  (0.52, 0.55, 1.00, 1.03, 0.0, 0.6),
    'story':   (0.52, 0.58, 0.95, 1.10, 0.0, 0.6),
    'intense': (0.70, 0.45, 1.10, 0.95, 0.5, 0.65),
    'shout':   (0.95, 0.40, 1.30, 1.00, 1.5, 0.7),
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
            best = None
            for take in range(p.get('takes', script.get('takes', 3))):
                w = m.generate(p['text'], audio_prompt_path=ref, exaggeration=ex, cfg_weight=cfg, temperature=temp)
                raw = w.squeeze(0).numpy().astype(np.float32)
                sc, W = analyse(raw, sr, p['text'])
                if best is None or sc < best[0]:
                    best = (sc, raw, W)
                if sc < 0.5:
                    break
            sc, raw, W = best
            a = clean(raw, sr, W, p['text']) if W else trim(raw)
            print(f"    Auswahl: Wertung {sc:.2f} (0 = fehlerfrei) nach {take + 1} Versuch(en)", flush=True)
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
