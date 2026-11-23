"""Übernimmt die neue Stimme (voice_cb-Ausgabe) in ein Video: Zeiten, Dauer, Studio-Flag."""
import json, re, shutil, sys, os
n, html, src = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(f'{src}/durations.json')); D = d['_duration']; T = d.get('_tags', {})
shutil.copy(f'{src}/voiceover_raw.wav', f'drafts/{n}_vo/voiceover_raw.wav'); shutil.copy(f'{src}/durations.json', f'drafts/{n}_vo/durations.json')
open(f'drafts/{n}_vo/studio', 'w').close()
s = open(html).read()
if 'const NA=' in s:
    s = re.sub(r"const NA=\[[^\]]*\], NB=\[[^\]]*\];", f"const NA={d['a']['parts']}, NB={d['b']['parts']};", s, count=1)
else:
    na = len([k for k in T if k[0] == 'A']); nb = len([k for k in T if k[0] == 'B'])
    A = [T[f'A{i}'] for i in range(na)]; B = [T[f'B{i}'] for i in range(nb)]
    s = re.sub(r"const A=\[[^\]]*\], B=\[[^\]]*\];", f"const A={A}, B={B};", s, count=1)
    if '"WEEK:"' in s:
        mid = round((B[2] + B[3]) / 2, 2)
        s = re.sub(r'b:[0-9.]+,lines:\[\["A","WEEK:"\]', f'b:{round(mid - .1, 2)},lines:[["A","WEEK:"]', s, count=1)
        s = re.sub(r'\{a:[0-9.]+,b:B\[3\]-\.1,lines:\[\["A","YEAR:"\]', f'{{a:{mid},b:B[3]-.1,lines:[["A","YEAR:"]', s, count=1)
s = re.sub(r"const DUR=[0-9.]+;", f"const DUR={D};", s, count=1)
open(html, 'w').write(s)
print(n, 'Dauer', D)
