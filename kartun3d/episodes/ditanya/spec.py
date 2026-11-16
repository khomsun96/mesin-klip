META={"tag":"PSIKOLOGI × AGAMA","seri":"BERANI TANYA","handle":"@khomsun_barkah"}
BREAKS=[9,22,41,61,75,91,101,113]
HOOK=["SATU PERTANYAAN","BIKIN ANAKMU","BERANI BICARA"]
U="utama"; M="murid"; M2="murid2"
def orb(a0,a1,r0,r1,h0,h1,look,fov=34,punch=None):
    c={"orbit":{"a0":a0,"a1":a1,"r0":r0,"r1":r1,"h0":h0,"h1":h1},"look":look,"fov":fov,"from":[0,0,0],"to":[0,0,0]}
    if punch: c["punch"]=punch
    return c
def scenes(W,S,END):
    return [
     # 1 HOOK: panggung kuis TV, Pak Ithaji lompat masuk sambil berputar, lampu sorot, konfeti
     {"id":"hook","start":0,"end":S(9),"set":"panggung","cam":orb(-0.45,0.35,10.8,9.0,1.3,2.0,[0,2.0,0],36),
      "props":[{"kind":"tanya","t":W(1),"pos":[-1.0,2.4,0.9]},{"kind":"konfeti","t":W(7),"pos":[0,2.6,0]}],
      "actors":[{"look":U,"keys":[{"t":0,"x":0.3,"z":0.8,"yaw":-0.6,"jump":1,"spin":1},
                                  {"t":0.9,"x":0,"z":0,"yaw":0,"spin":0,"jump":0,"point":1,"d":0.4},
                                  {"t":W(4),"point":0,"tilt":1,"d":0.3},
                                  {"t":W(7),"tilt":0,"cheer":1,"jump":1,"d":0.3}]}]},
     # 2 POLLING SINGKAT: 3 podium kuis, pembawa acara menunjuk; anak tekan tombol
     {"id":"tanya","start":S(9),"end":S(22),"set":"panggung","podium":[-1.6,1.6],
      "cam":{"from":[0,3.6,13.0],"to":[0,3.2,11.6],"look":[0,2.75,0],"fov":34},
      "heading":{"t":S(9)+0.1,"lines":[["KE ANAK,",0],["KAMU SERING?",1]]},
      "items":[{"kind":"tile","t":W(14),"icon":"chat","text":"BERTANYA"},{"kind":"tile","t":W(15),"icon":"hand","text":"MENASIHATI"},{"kind":"tile","t":W(17),"icon":"x","text":"MELARANG"}],
      "actors":[{"look":M,"keys":[{"t":0,"x":-1.6,"z":0.2,"yaw":0.15},{"t":W(14),"raise":1,"jump":0.5,"d":0.3},{"t":W(15),"jump":0,"d":0.3}]},
                {"look":U,"keys":[{"t":0,"x":0,"z":-0.3,"yaw":0,"dance":0.6},{"t":W(14),"dance":0,"point":1,"yaw":-0.5,"d":0.3},{"t":W(17),"yaw":0.5,"d":0.4}]},
                {"look":M2,"keys":[{"t":0,"x":1.6,"z":0.2,"yaw":-0.15},{"t":W(17),"cover":1,"shrink":1,"d":0.35}]}]},
     # 3 MASALAH: di kamar, ayah membesar & ceramah, gelembung kata terbang satu arah, anak mengecil
     {"id":"masalah","start":S(22),"end":S(41),"set":"kamar",
      "cam":orb(0.5,0.15,12.5,11.4,1.6,2.0,[0.1,2.75,0],36),
      "heading":{"t":W(24),"lines":[["BICARA",0],["SATU ARAH",1]],"out":W(36)-0.1},
      "heading2":{"t":W(36),"lines":[["TAKUT SALAH",0],["BICARA",1]]},
      "items":[{"kind":"tile","t":W(28),"icon":"chat","text":"PERINTAH"},{"kind":"tile","t":W(29),"icon":"hand","text":"NASIHAT"},{"kind":"tile","t":W(30),"icon":"x","text":"LARANGAN"}],
      "props":[{"kind":"gelembung","t":W(28),"a":[-0.5,2.6,0.2],"b":[1.4,1.7,0.3],"n":5}],
      "actors":[{"look":U,"keys":[{"t":0,"x":-1.0,"z":0,"yaw":0.7,"wave":0.6},{"t":W(26),"big":0.35,"wave":0,"point":1,"anger":0.4,"d":0.6}]},
                {"look":M,"keys":[{"t":0,"x":1.15,"z":0.3,"yaw":-0.8},{"t":W(33),"nod":1,"d":0.3},{"t":W(35),"nod":0,"cover":1,"d":0.35},{"t":W(38),"big":-0.35,"shrink":1,"d":0.7}]}]},
     # 4 RISET: lapangan, bukan kata searah tapi pingpong percakapan
     {"id":"riset","start":S(41),"end":S(61),"set":"lapangan",
      "cam":orb(-0.25,0.4,12.8,11.8,3.6,3.0,[0,2.1,0.2],36),
      "items":[{"kind":"pill","t":W(42),"text":"RISET MIT 2018"},{"kind":"tile","t":W(59),"icon":"chat","text":"BOLAK-BALIK"}],
      "heading":{"t":W(55),"lines":[["BUKAN KATA,",0],["TAPI OBROLAN",1]]},
      "props":[{"kind":"gelembung","t":W(49),"a":[-1.6,2.4,0.2],"b":[1.6,2.0,0.2],"n":4},{"kind":"pingpong","t":W(58),"a":[-1.05,0,0.2],"b":[1.05,0,0.2]}],
      "actors":[{"look":U,"keys":[{"t":0,"x":-1.5,"z":0.2,"yaw":1.35,"hot":0},{"t":W(51),"hot":1,"d":0.4},{"t":W(58),"hot":0,"jump":0.35,"d":0.3}]},
                {"look":M,"keys":[{"t":0,"x":1.5,"z":0.2,"yaw":-1.35},{"t":W(58),"jump":0.5,"d":0.3}]}]},
     # 5 DALIL: halaqah dalam masjid, sahabat mengangkat tangan
     {"id":"dalil","start":S(61),"end":S(75),"set":"masjid",
      "cam":{"from":[1.4,3.2,10.8],"to":[0.2,2.8,9.8],"look":[0.1,1.6,0],"fov":34},
      "heading":{"t":S(61)+0.15,"lines":[["RASULULLAH",0],["BERTANYA DULU",1]],"out":W(66)-0.15},
      "arab":{"t":W(66),"text":"أَتَدْرُونَ مَا الْمُفْلِسُ؟","trans":"“Tahukah kalian, siapakah orang yang bangkrut itu?”","src":"HR. MUSLIM NO. 2581 · SAHIH","srcT":W(72)},
      "itemsY":690,
      "props":[{"kind":"tanya","t":W(66),"pos":[1.05,2.75,0.2]}],
      "actors":[{"look":U,"keys":[{"t":0,"x":0.15,"z":-0.5,"yaw":0,"sit":1},{"t":W(66),"wave":0.6,"tilt":0.6,"d":0.35},{"t":W(72),"wave":0,"tilt":0,"nod":1,"d":0.4}]},
                {"look":M,"keys":[{"t":0,"x":-1.35,"z":0.5,"yaw":0.7,"sit":1},{"t":W(68),"raise":1,"d":0.3}]},
                {"look":M2,"keys":[{"t":0,"x":1.55,"z":0.5,"yaw":-0.7,"sit":1},{"t":W(70),"tilt":-1,"d":0.3}]}]},
     # 6 LANGKAH: panggung lagi (level 1-2-3): tanya, jam pasir 5 detik, telinga raksasa
     {"id":"langkah","start":S(75),"end":S(91),"set":"panggung",
      "cam":orb(0.55,-0.3,12.4,11.4,2.9,2.5,[0.1,2.55,0],36),
      "heading":{"t":W(75),"lines":[["GANTI PERINTAH",0],["JADI TANYA",1]]},
      "items":[{"kind":"tile","t":W(76),"icon":"chat","text":"TANYA"},{"kind":"tile","t":W(81),"icon":"check","text":"TUNGGU 5 DETIK"},{"kind":"tile","t":W(86),"icon":"sound","text":"DENGARKAN"}],
      "props":[{"kind":"jam","t":W(81),"end":W(86),"pos":[0.1,2.2,1.1]},{"kind":"telinga","t":W(86),"pos":[0.1,2.3,1.0]}],
      "actors":[{"look":U,"keys":[{"t":0,"x":-0.7,"z":0,"yaw":0.6},{"t":W(76),"raise":1,"tilt":0.7,"d":0.3},{"t":W(81),"raise":0,"clap":0,"tilt":-0.6,"d":0.4},{"t":W(86),"tilt":1,"cover":0,"d":0.4}]},
                {"look":M,"keys":[{"t":0,"x":0.9,"z":0.3,"yaw":-0.6},{"t":W(83),"wave":0.6,"d":0.3},{"t":W(86),"wave":0,"dance":1,"d":0.4}]}]},
     # 7 AJAKAN: di kamar malam, duduk di tepi ranjang, anak melompat senang
     {"id":"ajakan","start":S(91),"end":S(101),"set":"kamar",
      "cam":{"from":[-2.2,2.4,9.2],"to":[-1.4,2.2,8.0],"look":[-0.6,1.6,0],"fov":36},
      "heading":{"t":W(91),"lines":[["HARI INI,",0],["TANYA ANAKMU",1]]},
      "items":[{"kind":"pill","t":W(95),"text":"BIKIN SENANG?"}],
      "props":[{"kind":"konfeti","t":W(99),"pos":[0.6,1.8,0.4]}],
      "actors":[{"look":U,"keys":[{"t":0,"x":-1.4,"z":0,"yaw":0.9,"sit":1},{"t":W(93),"tilt":0.8,"wave":0.4,"d":0.3}]},
                {"look":M,"keys":[{"t":0,"x":0.6,"z":0.3,"yaw":-0.7},{"t":W(99),"cheer":1,"jump":1,"d":0.25}]}]},
     # 8 TEASER: gerbang sekolah sore, anak berjalan masuk lalu menutup mulut
     {"id":"teaser","start":S(101),"end":S(113),"set":"gerbang",
      "cam":orb(-0.35,0.25,9.4,8.4,1.4,1.9,[0,1.8,0],36),
      "heading":{"t":W(101),"lines":[["BERIKUTNYA:",0],["STOP BERTANYA",1]]},
      "items":[{"kind":"pill","t":W(106),"text":"DI SEKOLAH"},{"kind":"stamp","t":W(109),"text":"FOLLOW"}],
      "actors":[{"look":M,"keys":[{"t":0,"x":0.85,"z":1.6,"yaw":3.14,"walk":1},{"t":S(101)+0.05,"z":0.0,"d":1.8},{"t":W(104),"walk":0,"yaw":0,"cover":1,"shrink":1,"d":0.5}]},
                {"look":U,"keys":[{"t":0,"x":-0.55,"z":0.9,"yaw":0.5},{"t":W(104),"tilt":0.9,"d":0.4},{"t":W(109),"tilt":0,"point":1,"yaw":0,"d":0.3}]}]},
     # 9 POLL: panggung kuis, podium, pembawa acara joget
     {"id":"poll","start":S(113),"end":END,"set":"panggung","podium":[-1.6,0,1.6],
      "cam":orb(-0.3,0.3,10.5,10.0,3.2,3.0,[0,1.8,0],34),
      "actors":[{"look":M,"keys":[{"t":0,"x":-1.6,"z":0.2,"raise":1}]},
                {"look":U,"keys":[{"t":0,"x":0,"z":-0.7,"dance":1}]},
                {"look":M2,"keys":[{"t":0,"x":1.6,"z":0.2,"jump":0.4}]}]},
    ]
def poll(W,S):
    return {"start":S(113),"q":"Ke anak, kamu lebih sering apa?","opts":[{"k":"A","text":"Bertanya","t":W(121)},{"k":"B","text":"Menasihati","t":W(123)},{"k":"C","text":"Melarang","t":W(125)}],"cta":"Ketik A, B, atau C di komentar","ctaT":W(127)}
