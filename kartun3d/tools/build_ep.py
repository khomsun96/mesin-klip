# Menyusun src/ep.json dari episodes/<slug>/{words.json,spec.py}.  Pakai: python3 tools/build_ep.py episodes/<slug>
import json, sys, importlib.util
D=sys.argv[1].rstrip('/'); FPS=30; OFF=1.15; GAP=0.35
sp=importlib.util.spec_from_file_location('spec',D+'/spec.py'); spec=importlib.util.module_from_spec(sp); sp.loader.exec_module(spec)
words=json.load(open(D+'/words.json'))
sh=0; out=[]
for i,w in enumerate(words):
    if i in spec.BREAKS: sh+=GAP
    out.append({"w":w["w"],"s":round(w["s"]+OFF+sh,3),"e":round(w["e"]+OFF+sh,3)})
json.dump({"off":OFF,"gap":GAP,"breaks":spec.BREAKS,"src":[w["s"] for w in words]},open(D+'/gaps.json','w'))
W=lambda i:out[i]["s"]; S=lambda i:round(W(i)-0.22,3); END=round(out[-1]["e"]+2.2,2)
# Preset kamera yang sudah teruji (karakter di tengah-bawah, judul di atas kepala)
CAMS={
 "hook":{"from":[0.3,2.5,10.8],"to":[0,2.2,9.5],"look":[0,1.95,0],"fov":34},          # 1 tokoh berdiri, teks hook di atas
 "berdiri":{"from":[-1.6,2.5,11.2],"to":[-0.5,2.2,9.6],"look":[0,2.05,0],"fov":34},   # 1 tokoh berdiri
 "berdiri2":{"from":[1.6,2.5,11.2],"to":[0.5,2.2,9.8],"look":[0,2.05,0],"fov":34},
 "tiga":{"from":[-0.5,2.5,12.2],"to":[0.4,2.4,11.3],"look":[0,2.2,0],"fov":34},        # 3 tokoh sejajar (x=-1.3, 0, 1.3)
 "berhadapan":{"from":[-3.4,2.5,11.4],"to":[-2.0,2.4,10.4],"look":[-0.45,2.15,0],"fov":34}, # 2 tokoh (x=-0.9 & 1.3), dari samping kiri
 "berhadapan2":{"from":[-2.4,2.5,11.8],"to":[-1.2,2.4,10.6],"look":[0.05,2.15,0],"fov":34},  # 2 tokoh (x=-0.9 & 1.0)
 "duduk":{"from":[2.4,3.3,8.6],"to":[1.5,3.0,7.7],"look":[0,1.75,0],"fov":34},         # 1 tokoh duduk, kamera agak dari atas
 "duduk2":{"from":[2.2,3.4,9.4],"to":[1.0,3.1,8.5],"look":[0.15,1.8,0],"fov":34},
 "dalil":{"from":[0.6,2.9,11.4],"to":[-0.2,2.7,10.2],"look":[-0.2,2.0,0],"fov":34},    # teks Arab di atas, tokoh x=0.45 (boleh berbaring)
}
scenes=spec.scenes(W,S,END)
for sc in scenes:
    if isinstance(sc["cam"],str): sc["cam"]=CAMS[sc["cam"]]
scenes[-1]["end"]=END
ep={"fps":FPS,"dur":END,**spec.META,"hook":{"hits":[0.05,0.5,0.95],"lines":spec.HOOK},"poll":spec.poll(W,S),"words":out,"scenes":scenes}
json.dump(ep,open('src/ep.json','w'),ensure_ascii=False,indent=1)
print("durasi",END,"dtk |",[(s["id"],s["start"]) for s in scenes])
assert 55.0<=END<=60.0, "DURASI DI LUAR 55-60 dtk: ubah naskah/jeda"
