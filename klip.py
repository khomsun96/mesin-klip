"""Mesin klip: YouTube -> transkrip -> pilih momen terkuat -> klip 9:16 ber-caption.

Dijalankan oleh GitHub Actions. Hasil ada di folder hasil/.
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import requests
from faster_whisper import WhisperModel

AKAR = Path(__file__).parent
HASIL = AKAR / "hasil"
KERJA = AKAR / "kerja"
RIWAYAT = AKAR / "riwayat.txt"
KANAL = AKAR / "kanal.txt"

JUMLAH_KLIP = int(os.environ.get("JUMLAH_KLIP", "2"))
DURASI_MIN, DURASI_MAKS = 55.0, 60.0
MODEL_GEMINI = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
MODEL_WHISPER = os.environ.get("WHISPER_MODEL", "small")
NICHE = os.environ.get("NICHE", "agama, psikologi, leadership")


def jalankan(perintah, **kw):
    print("+", " ".join(str(p) for p in perintah), flush=True)
    return subprocess.run(perintah, check=True, text=True, **kw)


def opsi_ytdlp():
    opsi = ["yt-dlp", "--no-warnings"]
    if (AKAR / "cookies.txt").exists():
        opsi += ["--cookies", str(AKAR / "cookies.txt")]
    return opsi


def sudah_diproses():
    return set(RIWAYAT.read_text().split()) if RIWAYAT.exists() else set()


def pilih_sumber(url_manual):
    """Tautan manual, atau video terbaru dari kanal.txt yang belum diproses."""
    if url_manual:
        return url_manual
    lama = sudah_diproses()
    for baris in KANAL.read_text().splitlines():
        kanal = baris.split("#")[0].strip()
        if not kanal:
            continue
        keluar = subprocess.run(
            opsi_ytdlp()
            + ["--flat-playlist", "--playlist-end", "8", "--print", "%(id)s\t%(duration)s", kanal.rstrip("/") + "/videos"],
            capture_output=True, text=True,
        )
        for calon in keluar.stdout.splitlines():
            vid, _, durasi = calon.partition("\t")
            try:
                detik = float(durasi)
            except ValueError:
                continue
            if vid not in lama and 600 <= detik <= 7200:
                return f"https://www.youtube.com/watch?v={vid}"
    return None


def unduh(url):
    KERJA.mkdir(exist_ok=True)
    info = json.loads(
        subprocess.run(opsi_ytdlp() + ["-J", "--no-playlist", url], capture_output=True, text=True, check=True).stdout
    )
    berkas = KERJA / "sumber.mp4"
    jalankan(
        opsi_ytdlp()
        + ["--no-playlist", "-f", "bv*[height<=720]+ba/b[height<=720]/b", "--merge-output-format", "mp4", "-o", str(berkas), url],
        stderr=subprocess.PIPE,
    )
    return berkas, info


def transkrip(berkas):
    audio = KERJA / "audio.wav"
    jalankan(["ffmpeg", "-y", "-loglevel", "error", "-i", str(berkas), "-vn", "-ac", "1", "-ar", "16000", str(audio)])
    model = WhisperModel(MODEL_WHISPER, device="cpu", compute_type="int8")
    segmen, _ = model.transcribe(str(audio), language=os.environ.get("BAHASA", "id"), word_timestamps=True, vad_filter=True)
    kalimat, kata = [], []
    for s in segmen:
        kalimat.append({"mulai": round(s.start, 1), "akhir": round(s.end, 1), "teks": s.text.strip()})
        for k in s.words or []:
            kata.append({"mulai": k.start, "akhir": k.end, "teks": k.word.strip()})
    return kalimat, kata


def pilih_momen(kalimat, info):
    kunci = os.environ["GEMINI_API_KEY"]
    naskah = "\n".join(f"[{k['mulai']}-{k['akhir']}] {k['teks']}" for k in kalimat)
    perintah = f"""Kamu editor video pendek. Di bawah ini transkrip bertanda waktu (detik) dari video
"{info.get('title', '')}" milik kanal "{info.get('channel', '')}".

Pilih {JUMLAH_KLIP + 2} potongan yang paling berpotensi viral sebagai Reels/TikTok/Shorts.
Syarat tiap potongan:
- durasi {int(DURASI_MIN)}-{int(DURASI_MAKS)} detik, mulai dan berakhir tepat di batas kalimat
- kalimat pembuka langsung memancing rasa ingin tahu
- satu gagasan utuh yang bisa dipahami tanpa menonton video penuh, tidak mengubah maksud pembicara
- potongan tidak saling tumpang tindih
- utamakan tema: {NICHE}

Balas HANYA JSON berupa daftar objek:
{{"mulai": detik, "akhir": detik, "skor": 0-100, "judul": "hook maksimal 60 karakter",
"caption": "caption 2-3 kalimat, Bahasa Indonesia, diakhiri pertanyaan untuk komentar",
"tagar": ["#..."]}}

TRANSKRIP:
{naskah}"""
    jawab = requests.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_GEMINI}:generateContent",
        params={"key": kunci},
        json={"contents": [{"parts": [{"text": perintah}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0.4}},
        timeout=300,
    )
    jawab.raise_for_status()
    teks = jawab.json()["candidates"][0]["content"]["parts"][0]["text"]
    return sorted(json.loads(teks), key=lambda m: -float(m.get("skor", 0)))


def rapikan_waktu(momen, kalimat):
    """Paksa durasi ke 55-60 detik dengan menggeser akhir ke batas kalimat terdekat."""
    mulai = float(momen["mulai"])
    batas = [k["akhir"] for k in kalimat if mulai + DURASI_MIN <= k["akhir"] <= mulai + DURASI_MAKS]
    if batas:
        akhir = min(batas, key=lambda a: abs(a - float(momen["akhir"])))
    else:
        akhir = mulai + DURASI_MAKS - 1
    return mulai, akhir


def waktu_ass(t):
    j, sisa = divmod(max(t, 0), 3600)
    m, d = divmod(sisa, 60)
    return f"{int(j)}:{int(m):02d}:{d:05.2f}"


def buat_caption(kata, mulai, akhir, tujuan):
    kepala = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: Utama,DejaVu Sans,78,&H00FFFFFF,&H00000000,&H80000000,1,1,6,2,2,80,80,430

[Events]
Format: Layer, Start, End, Style, Text
"""
    dalam = [k for k in kata if k["mulai"] >= mulai and k["akhir"] <= akhir + 0.3]
    baris = []
    for i in range(0, len(dalam), 3):
        grup = dalam[i : i + 3]
        teks = " ".join(k["teks"] for k in grup).upper().replace("{", "").replace("}", "")
        baris.append(f"Dialogue: 0,{waktu_ass(grup[0]['mulai'] - mulai)},{waktu_ass(grup[-1]['akhir'] - mulai)},Utama,{teks}")
    tujuan.write_text(kepala + "\n".join(baris) + "\n", encoding="utf-8")


def potong(sumber, mulai, akhir, ass, tujuan):
    saring = f"scale=-2:1920,crop=1080:1920,ass={ass.as_posix()}"
    jalankan([
        "ffmpeg", "-y", "-loglevel", "error", "-ss", f"{mulai:.2f}", "-i", str(sumber), "-t", f"{akhir - mulai:.2f}",
        "-vf", saring, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-r", "30",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(tujuan),
    ])


def tautan_antrian():
    """Saat dipicu oleh perubahan antrian.txt, pakai tautan terakhir di berkas itu."""
    berkas = AKAR / "antrian.txt"
    if os.environ.get("PEMICU") != "push" or not berkas.exists():
        return ""
    baris = [b.strip() for b in berkas.read_text().splitlines() if b.strip() and not b.startswith("#")]
    return baris[-1] if baris else ""


def utama():
    if not os.environ.get("GEMINI_API_KEY"):
        sys.exit("Secret GEMINI_API_KEY belum dipasang di Settings > Secrets and variables > Actions.")
    url = pilih_sumber(os.environ.get("URL_VIDEO", "").strip() or tautan_antrian())
    if not url:
        print("Tidak ada video baru di kanal.txt. Selesai tanpa klip.")
        return
    print("Sumber:", url)
    sumber, info = unduh(url)
    kalimat, kata = transkrip(sumber)
    if not kalimat:
        sys.exit("Transkrip kosong: video tanpa ucapan.")
    HASIL.mkdir(exist_ok=True)
    catatan, terpakai = [], []
    for momen in pilih_momen(kalimat, info):
        if len(catatan) >= JUMLAH_KLIP:
            break
        mulai, akhir = rapikan_waktu(momen, kalimat)
        if any(mulai < b and akhir > a for a, b in terpakai):
            continue
        terpakai.append((mulai, akhir))
        nomor = len(catatan) + 1
        nama = f"{info['id']}_klip{nomor}"
        ass = KERJA / f"{nama}.ass"
        buat_caption(kata, mulai, akhir, ass)
        potong(sumber, mulai, akhir, ass, HASIL / f"{nama}.mp4")
        catatan.append(
            f"## Klip {nomor} (skor {momen.get('skor', '?')}, {akhir - mulai:.0f} detik, mulai {waktu_ass(mulai)})\n"
            f"**Judul:** {momen.get('judul', '')}\n\n{momen.get('caption', '')}\n\n"
            f"{' '.join(momen.get('tagar', []))}\n\n"
            f"Sumber: {info.get('channel', '')} - {info.get('title', '')} ({url})\n"
        )
    (HASIL / "caption.md").write_text("\n".join(catatan), encoding="utf-8")
    with RIWAYAT.open("a") as f:
        f.write(re.sub(r"\s+", "", info["id"]) + "\n")
    print(f"Selesai: {len(catatan)} klip.")


def lapor(pesan):
    """Tampilkan galat sebagai anotasi di halaman run GitHub."""
    ringkas = " | ".join(b.strip() for b in str(pesan).strip().splitlines()[-6:] if b.strip())
    print(f"::error::{ringkas[:900]}", flush=True)


if __name__ == "__main__":
    try:
        utama()
    except SystemExit as e:
        if e.code not in (None, 0):
            lapor(e.code)
        raise
    except subprocess.CalledProcessError as e:
        lapor(f"Perintah gagal: {' '.join(map(str, e.cmd))[:200]}\n{e.stderr or ''}")
        raise
    except Exception as e:
        lapor(f"{type(e).__name__}: {e}")
        raise
