# Waktu tiap kata naskah dari VO.  Pakai: python3 tools/words.py episodes/<slug>   (butuh vo.wav 48 kHz mono + naskah.txt)
import numpy as np, wave, json, re, sys, subprocess, difflib
from faster_whisper import WhisperModel
D=sys.argv[1].rstrip('/')
subprocess.run(['ffmpeg','-v','error','-y','-i',D+'/vo.wav','-ac','1','-ar','16000',D+'/vo16.wav'],check=True)
w=wave.open(D+'/vo16.wav'); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
segs,_=WhisperModel('small',device='cpu',compute_type='int8').transcribe(a,language='id',word_timestamps=True,vad_filter=False)
ws=[(x.word.strip(),x.start,x.end) for s in segs for x in s.words]
script=open(D+'/naskah.txt').read().split(); norm=lambda s: re.sub(r'[^a-z0-9]','',s.lower())
A=[norm(x) for x in script]; B=[norm(x[0]) for x in ws]; t=[None]*len(A)
for tag,i1,i2,j1,j2 in difflib.SequenceMatcher(None,A,B,autojunk=False).get_opcodes():
    if tag=='equal':
        for k in range(i2-i1): t[i1+k]=(ws[j1+k][1],ws[j1+k][2])
    elif tag=='replace' and j2>j1:
        s0,e0=ws[j1][1],ws[j2-1][2]; n=i2-i1
        for k in range(n): t[i1+k]=(s0+(e0-s0)*k/n, s0+(e0-s0)*(k+1)/n)
ok=sum(x is not None for x in t)
for i,x in enumerate(t):
    if x is None:
        p=next((t[j][1] for j in range(i-1,-1,-1) if t[j]),0); nx=next((t[j][0] for j in range(i+1,len(t)) if t[j]),p+0.3); t[i]=(p,nx)
json.dump([{"w":script[i],"s":round(t[i][0],3),"e":round(t[i][1],3)} for i in range(len(script))],open(D+'/words.json','w'),ensure_ascii=False)
print('cocok',ok,'/',len(A)); print(' | '.join(f"{i} {script[i]} {t[i][0]:.2f}" for i in range(len(script))))
