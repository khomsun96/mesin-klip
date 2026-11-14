# Mesin Kartun 3D (video niche Khomsun)

Video 9:16 1080×1920, 55–60 dtk: tokoh 3D gaya mainan memperagakan isi narasi, set berganti per bagian,
judul dua warna, ikon berlabel, teks Arab + sumber, caption per kata, hook 3 pukulan, polling A/B/C.
Render ±20–25 menit (2 CPU). Episode contoh yang sudah teruji: `episodes/marah/`.

## Setup (sekali per sesi, ±2 menit)
    npm i --no-audit --no-fund && mkdir -p public/fonts out/st
    cp node_modules/@fontsource/poppins/files/poppins-latin-{500,600,700,800}-normal.woff2 node_modules/@fontsource/amiri/files/amiri-arabic-700-normal.woff2 public/fonts/
    pip install --break-system-packages -q faster-whisper
    ls /opt/pw-browsers/   # samakan path chrome-headless-shell di remotion.config.ts bila versinya beda

## Alur per episode (slug = nama folder di episodes/)
1. `episodes/<slug>/naskah.txt` — naskah VO final (125–140 kata), satu paragraf per bagian.
2. VO → `episodes/<slug>/vo.wav` (48 kHz mono, jeda sudah dirapatkan, loudnorm −16).
   Ricky (ElevenLabs) dulu; cadangan: `GK=<kunci> python3 tools/tts_gemini.py episodes/<slug>/naskah.txt episodes/<slug>/vo_raw.wav` lalu
   `ffmpeg -i vo_raw.wav -af "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.18:stop_threshold=-45dB,highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 -ac 1 vo.wav`
   VO setelah dirapatkan idealnya 50–53 dtk (total = 1,15 + VO + 0,35×jumlah BREAKS + 2,2). Kalau kepanjangan, atempo maks 1,08.
3. `python3 tools/words.py episodes/<slug>` → `words.json` + daftar "indeks kata waktu" (dipakai untuk W(i)).
4. Tulis `episodes/<slug>/spec.py` (salin dari `episodes/marah/spec.py`, ganti isinya).
5. `python3 tools/build_ep.py episodes/<slug>` → `src/ep.json` (gagal bila durasi di luar 55–60 dtk).
6. QA frame: `bash tools/stills.sh "1.2 6 12 20 28 36 44 50 55" a` → lihat `out/sheet_a.jpg`, perbaiki, ulangi.
7. `nohup bash tools/render.sh episodes/<slug> > out/render.log 2>&1 &` → cek tiap ±5 menit → `episodes/<slug>/instagram.mp4` + `lembar.jpg`.

## spec.py
- `META` = {tag: "PSIKOLOGI × AGAMA" / "PENDIDIKAN × AGAMA", seri: tema benang merah (≤14 huruf), handle}
- `BREAKS` = indeks kata pertama tiap bagian setelah hook (diberi jeda 0,35 dtk). Adegan dimulai di `S(indeks itu)`.
- `HOOK` = 3 baris (≤16 huruf per baris; baris ke-3 jadi blok kuning). VO membaca hook mulai 1,15 dtk.
- `scenes(W,S,END)` → daftar adegan berurutan; adegan pertama id "hook" (start 0), terakhir id "poll".
  Tiap adegan: `id, start, end, set, cam, actors` + opsional `heading, heading2, items, itemsY, arab, props`.
  - `set`: "rumah" | "kantor" | "kelas" | "malam" (langit ungu + masjid; pakai untuk dalil/renungan).
  - `cam`: nama preset di tools/build_ep.py — hook, berdiri, berdiri2, tiga, berhadapan, berhadapan2, duduk, duduk2, dalil.
    Posisi tokoh yang cocok: 1 tokoh x=0; tiga → x=-1.3/0/1.3; berhadapan → x=-0.9 (yaw 1.1) & x=1.3 (yaw -1.1); dalil → x=0.45.
    Lebar layar hanya ±3,8 satuan: jangan taruh tokoh di luar x=±1.5.
  - `actors`: [{look, keys}]. look: "utama" (koko kuning, tokoh tetap seri ini) | "teman" | "teman2" | "murid" | "murid2".
    keys = [{t (detik absolut; kunci pertama t=0), d (lama transisi, default 0.45), dan salah satu/lebih:
    x, z, yaw, sit (duduk 0–1), lie (berbaring 0–1), anger (marah: wajah merah, uap, percikan), wave (tangan terangkat/bergerak),
    hot (dada menyala), nod (mengangguk), walk (melangkah), shrink (mundur takut)}]. Nilai bertahan sampai kunci berikutnya.
    Peragakan isi narasi: tiap adegan minimal 1 perubahan pose tepat di kata kuncinya (pakai W(i)).
  - `heading`/`heading2`: {t, lines:[[teks,0],[teks,1]], out?} — 2 baris, ≤13 huruf; baris bernilai 1 berwarna kuning.
    heading2 hanya setelah heading diberi `out`.
  - `items`: [{kind:"tile", t, icon, text} | {kind:"pill", t, text} | {kind:"stamp", t, text}] — maks 3 per adegan, teks ≤15 huruf.
    icon: x, check, boom, mute, walk, sound, hand, chat, fire, down. `itemsY` (px) hanya bila perlu; adegan `arab` pakai 690.
  - `arab`: {t, text (Arab berharakat, pendek), trans (terjemah ≤90 huruf), src ("HR. … NO. … · SAHIH" / "QS. …: …"), srcT}.
    Jangan menaruh heading bersamaan dengan arab (beri heading `out` sebelum arab.t).
  - `props`: [{kind:"hp", t, pos:[x,y,z]}] — ponsel melayang.
- `poll(W,S)` → {start, q (≤34 huruf), opts:[{k:"A",text (≤12 huruf),t}×3], cta, ctaT}. start = S(indeks kata "Sekarang").

## Aturan tampilan
- Caption otomatis dari words.json (kata aktif kuning), disembunyikan saat hook & polling.
- Area aman sudah diatur (judul y≥285, caption y≈1330, kanan dikosongkan). Jangan menambah teks kecil di detik pertama.
- Jangan pakai emoji atau simbol ﷺ di heading (font tidak punya glifnya).
- Menambah set/pose/ikon baru boleh (src/Scene3D.tsx, ICON di src/Video.tsx) bila topik membutuhkannya; cek dengan stills dulu.
  3D sengaja dirender di dpr 0.62 + MeshLambert supaya cepat — jangan dinaikkan.
- Musik & SFX sintetis dibuat tools/audio.py dari ep.json (hit hook, whoosh, pop, stempel, ding polling), master −14 LUFS.
