# Pakai: GK=<kunci> python3 tools/tts_gemini.py episodes/<slug>/naskah.txt episodes/<slug>/vo_raw.wav
import sys, json, base64, wave, urllib.request, os
key=os.environ['GK']; txt=open(sys.argv[1]).read()
gaya="Bacakan sebagai narator pria muda Indonesia dengan suara lembut, hangat, dan ringan (bukan berat atau bass). Gaya bertutur santai dan mengalir seperti sedang bercerita ke teman dekat, intonasi naik-turun alami, tidak kaku, tidak seperti membaca berita, tidak dramatis. Tempo sedang cenderung cepat, jeda pendek dan alami. Pelafalan Indonesia baku yang natural:"
body={"contents":[{"parts":[{"text":gaya+"\n\n"+txt}]}],"generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Enceladus"}}}}}
for m in ["gemini-2.5-flash-preview-tts","gemini-3.8-flash-tts","gemini-2.5-pro-preview-tts"]:
    try:
        r=urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent",data=json.dumps(body).encode(),headers={"X-goog-api-key":key,"Content-Type":"application/json"})
        d=json.load(urllib.request.urlopen(r,timeout=180))
        pcm=base64.b64decode(d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        w=wave.open(sys.argv[2],"wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm); w.close()
        print("ok",m,len(pcm)/48000); break
    except Exception as e:
        print("fail",m,str(e)[:200])
