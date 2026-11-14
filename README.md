# Mesin Klip

YouTube -> transkrip (Whisper) -> pilih momen terkuat (Gemini) -> klip 9:16 ber-caption, 55-60 detik. Jalan gratis di GitHub Actions.

## Setup sekali
1. Settings > Secrets and variables > Actions > New repository secret: `GEMINI_API_KEY`.
2. (Opsional) secret `YT_COOKIES` berisi cookies.txt YouTube bila unduhan diblokir.
3. Isi `kanal.txt` dengan kanal sumber.

## Pakai
- Otomatis: 06.40, 10.40, 17.40 WIB.
- Manual: tab Actions > Mesin Klip > Run workflow, tempel tautan YouTube.
- Hasil: buka run-nya, unduh artifact `klip-N` (video + caption.md).

Pakai hanya video milik sendiri atau yang pemiliknya mengizinkan dipotong ulang.
