# Campuran audio: VO (dengan jeda) + musik sintetis + SFX, musik mengecil saat VO.
import numpy as np, wave, json, sys
D=sys.argv[1].rstrip('/')
SR=48000; ep=json.load(open('src/ep.json')); g=json.load(open(D+'/gaps.json')); N=int(ep['dur']*SR)
def rd(p):
    w=wave.open(p); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    return a.reshape(-1,w.getnchannels()).mean(1)
vo=rd(D+'/vo.wav'); words=ep['words']
# sisipkan jeda di batas bagian
cuts=[0]+[int((g['src'][i]-0.06)*SR) for i in g['breaks']]+[len(vo)]
voT=np.zeros(N,np.float32); pos=int(g['off']*SR)
for a,b in zip(cuts[:-1],cuts[1:]):
    seg=vo[a:b]; n=min(len(seg),N-pos); voT[pos:pos+n]+=seg[:n]; pos+=len(seg)+int(g['gap']*SR)
t=np.arange(N)/SR
def add(buf,sig,at,gain=1.0):
    i=int(at*SR); n=min(len(sig),len(buf)-i)
    if n>0 and i>=0: buf[i:i+n]+=sig[:n]*gain
def env(n,a=0.005,d=0.2): x=np.arange(n)/SR; return np.minimum(x/a,1)*np.exp(-x/d)
rng=np.random.default_rng(7)
def kick(): n=int(.32*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*(48*x+38*(1-np.exp(-x*28))/28*8))*np.exp(-x/0.11)
def snare(): n=int(.2*SR); x=np.arange(n)/SR; return (rng.standard_normal(n)*0.6+np.sin(2*np.pi*190*x)*0.5)*np.exp(-x/0.05)
def hat(): n=int(.05*SR); x=np.arange(n)/SR; z=rng.standard_normal(n); z=z-np.concatenate([[0],z[:-1]]); return z*np.exp(-x/0.012)
def tone(f,d,dec=0.25,h=(1,.35,.12)): n=int(d*SR); x=np.arange(n)/SR; return sum(a*np.sin(2*np.pi*f*(k+1)*x) for k,a in enumerate(h))*env(n,0.004,dec)
def hit(): n=int(.45*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*(40*x+70*(1-np.exp(-x*22))/22*6))*np.exp(-x/0.16)*1.3+rng.standard_normal(n)*np.exp(-x/0.03)*0.7
def whoosh(): n=int(.42*SR); x=np.arange(n)/SR; z=rng.standard_normal(n); k=np.ones(60)/60; z=np.convolve(z,k,'same')*6; return z*np.sin(np.pi*x/0.42)**2*(0.5+x)
def pop(f=660): n=int(.14*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*(f*x+f*0.9*x*x/0.14))*np.exp(-x/0.035)
def stamp(): n=int(.3*SR); x=np.arange(n)/SR; return np.sin(2*np.pi*70*x)*np.exp(-x/0.07)*1.2+rng.standard_normal(n)*np.exp(-x/0.02)*0.5
def ding(f): return tone(f,0.6,0.22,(1,.5,.2))
mus=np.zeros(N,np.float32); sfx=np.zeros(N,np.float32)
bpm=96; beat=60/bpm; t0=1.45  # musik masuk setelah 3 pukulan hook
A=440.0; nt=lambda s:A*2**(s/12)
chords=[[-9,-5,-2,3],[-14,-5,-2,2],[-12,-9,-5,2],[-10,-7,-2,0]]  # Cmaj7, Am7, Fmaj7, G6 (hangat)
bass=[-33,-36,-40,-38]
mel=[3,7,10,7,2,7,10,12,0,3,7,3,2,5,7,5]
b=0
while t0+b*beat<ep['dur']-0.3:
    tt=t0+b*beat; bar=(b//4)%4; inb=b%4
    add(mus,kick(),tt,0.9 if inb in(0,2) else 0)
    if inb==2 and b%8==6: add(mus,kick(),tt+beat*0.5,0.6)
    if inb in(1,3): add(mus,snare(),tt,0.5)
    add(mus,hat(),tt,0.22); add(mus,hat(),tt+beat/2,0.3)
    if inb==0:
        for s in chords[bar]: add(mus,tone(nt(s),beat*4,1.6,(1,.25,.08)),tt,0.11)
    if inb in(0,2): add(mus,tone(nt(bass[bar]),beat*1.6,0.5,(1,.5,.15)),tt,0.5)
    if inb==3: add(mus,tone(nt(bass[bar]),beat*0.5,0.2,(1,.5,.15)),tt+beat/2,0.4)
    add(mus,tone(nt(mel[(b*2)%16]+12),0.35,0.12,(1,.2)),tt,0.16)
    if b%2: add(mus,tone(nt(mel[(b*2+1)%16]+12),0.3,0.1,(1,.2)),tt+beat/2,0.1)
    b+=1
# SFX
for h in ep['hook']['hits']: add(sfx,hit(),h,1.0)
for sc in ep['scenes'][1:]:
    add(sfx,whoosh(),sc['start']-0.12,0.55)
    for hk in ('heading','heading2'):
        if sc.get(hk): add(sfx,pop(520),sc[hk]['t'],0.42); add(sfx,pop(700),sc[hk]['t']+0.16,0.42)
    for it in sc.get('items',[]): add(sfx,stamp() if it['kind']=='stamp' else pop(880),it['t'],0.75 if it['kind']=='stamp' else 0.45)
    if sc.get('arab'): add(sfx,ding(nt(3)),sc['arab']['t'],0.3); add(sfx,pop(880),sc['arab']['srcT'],0.4)
    for pr in sc.get('props',[]): add(sfx,pop(990),pr['t'],0.4)
P=ep['poll']; add(sfx,pop(600),P['start']+0.05,0.5)
for i,o in enumerate(P['opts']): add(sfx,ding(nt([3,7,10][i]+12)),o['t'],0.4)
add(sfx,stamp(),P['ctaT'],0.6)
# musik lebih pelan di adegan dalil
lvl=np.ones(N,np.float32)
for sc in ep['scenes']:
    if sc['set']=='malam': lvl[int(sc['start']*SR):int(sc['end']*SR)]=0.6
k=np.ones(int(.3*SR))/int(.3*SR); lvl=np.convolve(lvl,k,'same')
# sidechain
e=np.sqrt(np.convolve(voT**2,np.ones(int(.05*SR))/int(.05*SR),'same')); e=np.minimum(e/0.05,1)
e=np.convolve(e,np.ones(int(.18*SR))/int(.18*SR),'same')
mus=mus*lvl*(1-0.62*e)
fade=np.minimum(1,(ep['dur']-t)/1.2).clip(0,1)
mix=voT*1.0+mus*0.34*fade+sfx*0.5
mix=np.tanh(mix*1.1)/1.1
w=wave.open(D+'/mix.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767*0.9).astype(np.int16).tobytes()); w.close()
print('ok',len(mix)/SR)
