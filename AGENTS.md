# agent.md: Aturan Proyek AVÉRA untuk Asisten AI di IDE

> Berkas ini dibaca asisten AI sebelum bekerja. Jika IDE-mu mencari nama berkas tertentu, salin isi berkas ini ke nama itu (misalnya `CLAUDE.md`, `AGENTS.md`, atau `.cursorrules`), tanpa menghapus aslinya.

## 1. Tentang Proyek
**AVÉRA** adalah web mix and match outfit. Pengguna mengisi lemari digital, lalu AI (Gemini) menyusun ide outfit harian berdasarkan zodiak dan/atau undertone, dengan saran palet warna. Ini **tugas kuliah**; pemilik proyek berasal dari jurusan Manajemen dan **bukan programmer**.

Prinsip utama: **sesederhana mungkin**, mudah dijelaskan, berjalan di Vercel, tanpa database.

## 2. Dokumen Acuan (baca sebelum bekerja)
| Berkas | Isi | Prioritas |
|---|---|---|
| `prd.md` | Apa yang dibuat: fitur, data, kontrak AI, fase | 1 (tertinggi) |
| `design.md` | Tampilan: warna, kaca, komponen, tiap tab, papan 2D, teks UI | 2 |
| `data/colors.json` | Sumber kebenaran data warna | 3 |
| `agent.md` | Cara bekerja (berkas ini) | 4 |

Jika ada pertentangan, ikuti urutan prioritas di atas. **Jangan mengarang fitur** yang tidak ada di `prd.md`. Jika ada hal yang tidak jelas, tanyakan dulu.

## 3. Teknologi (tetap, jangan diganti)
- Next.js (App Router) + TypeScript + Tailwind CSS.
- Penyimpanan: `localStorage` saja. **Tanpa database, tanpa login, tanpa server tambahan.**
- AI: `@google/genai`, model dari env `GEMINI_MODEL` (isi: `gemini-3.5-flash-lite`).
- Ikon: `lucide-react`. Font: Instrument Serif dan Manrope lewat `next/font/google`.
- **Hanya dua library tambahan yang diizinkan:** `@google/genai` dan `lucide-react`. Jangan menambah library lain (state manager, UI kit, library animasi, dan sebagainya) tanpa bertanya dan mendapat persetujuan.

## 4. Struktur Proyek
```
app/            layout.tsx, page.tsx (halaman tunggal + 5 tab), globals.css, api/outfit/route.ts
components/     Wardrobe, ProfileForm, OutfitIdeas, OutfitBoard, ColorPalette, SavedOutfits
data/           colors.json, sampleWardrobe.ts
lib/            types.ts, copy.ts, storage.ts, palette.ts
public/         siluet dan aset statis
```
Jangan membuat folder atau berkas di luar struktur ini tanpa alasan jelas. Jaga jumlah berkas tetap sedikit.

**Aturan lokasi**
- Satu komponen = satu tab atau satu fungsi jelas.
- Semua akses `localStorage` hanya lewat `lib/storage.ts`.
- Semua panggilan AI hanya di `app/api/outfit/route.ts`.
- Semua data warna dibaca dari `data/colors.json`; jangan menulis ulang kode hex di komponen.
- Semua teks UI berada di `lib/copy.ts`; jangan menulis teks UI langsung di komponen.
- Semua tipe data ada di `lib/types.ts`, mengikuti `prd.md` bagian 7.

## 5. Aturan Kode
- TypeScript **ketat**; hindari `any`. Jika terpaksa, beri komentar alasan.
- Komponen berupa fungsi. Tambahkan `"use client"` hanya pada komponen yang memakai state atau `localStorage`.
- Nama berkas dan identifier berbahasa Inggris (`WardrobeItem`, `saveOutfit`); **teks yang dilihat pengguna dan komentar kode berbahasa Indonesia**.
- Komentar singkat yang menjelaskan *mengapa*, bukan *apa*, dengan bahasa sederhana (pemilik proyek harus bisa membacanya).
- Fungsi pendek dan satu tugas. Hindari abstraksi berlebihan.
- Akses `localStorage` selalu dalam `try/catch` dan hanya di sisi klien (jangan dipanggil saat render di server).
- Tangani semua keadaan: kosong, memuat, galat, dan penuh. Tidak boleh ada layar kosong atau galat teknis yang tampil ke pengguna.
- Tulis nama produk selalu **AVÉRA** (dengan "É") di teks yang tampil; nama teknis (paket, folder) memakai `avera`. Simpan berkas sebagai UTF-8.

## 6. Aturan AI dan Keamanan (WAJIB)
1. **API key tidak pernah** ditulis di kode, di berkas yang di-commit, atau di log. Hanya dari `process.env.GEMINI_API_KEY` di dalam `route.ts`.
2. **Jangan** memakai awalan `NEXT_PUBLIC_` pada variabel rahasia.
3. **Jangan** membuat atau mengubah `.env.local` dengan nilai asli. Jika perlu, buat `.env.example` berisi nama variabel tanpa nilai. Jangan meminta pemilik menempelkan key ke chat.
4. Pastikan `.env*.local` ada di `.gitignore`.
5. Panggilan Gemini: **jangan** mengirim `temperature`, `top_p`, atau `top_k`. Gunakan keluaran terstruktur (JSON) dan validasi hasilnya.
6. Setiap `itemId` dari AI **harus diverifikasi** ada di lemari yang dikirim; jika tidak, coba ulang sekali lalu kembalikan galat `AI_INVALID_OUTPUT`.
7. Foto **tidak pernah dikirim** ke AI. Hanya nama, kategori, warna, dan catatan.
8. Validasi input di `route.ts`: jumlah item maksimal 40, panjang teks, dan ukuran body. Batas waktu panggilan AI 20 detik.
9. Kontrak request, response, dan kode galat mengikuti `prd.md` bagian 8.
10. Jangan mencatat isi lemari pengguna ke log.
11. Jangan memakai `dangerouslySetInnerHTML` untuk teks dari pengguna atau AI.

## 7. Aturan Tampilan (ringkasan dari `design.md`)
- Gaya: **earth tone + liquid glass**, netral gender. Token warna dan kelas kaca ada di `app/globals.css`.
- Palet inti: Golden Batter `#E8D1A7`, Toasted Caramel `#84592B`, Spiced Wine `#743014`, Olive Harvest `#9D9167`, Cowhide Cocoa `#442D1C`; turunan: Ivory `#F8F1E3`, Olive Deep `#5F5A3A`, Danger `#A23B22`.
- **Olive Harvest tidak boleh untuk teks** (kontras terlalu rendah). Toasted Caramel di atas Golden Batter hanya untuk teks besar.
- Panel berisi teks memakai kaca minimal **ivory 60%** (teks cocoa) atau **cocoa 75%** (teks ivory). Jangan menurunkan opasitas.
- Maksimal **tiga lapis kaca** per layar. Kartu dalam grid tidak memakai blur.
- Wajib ada cadangan solid untuk `@supports not (backdrop-filter)` dan `prefers-reduced-transparency`; hormati `prefers-reduced-motion`.
- Antarmuka **tidak memakai pink, biru, atau ungu** sebagai warna tampilan. Warna dari `colors.json` hanya muncul sebagai swatch dan foto pakaian.
- Tanpa emoji di antarmuka, tanpa foto stok, tanpa gambar atau merek dari referensi.
- Mobile-first mulai lebar 360 px; area sentuh minimal 44 px.

## 8. Cara Bekerja
1. **Baca dulu** `prd.md`, `design.md`, dan berkas ini. Ringkas pemahamanmu dalam beberapa kalimat sebelum menulis kode.
2. **Kerjakan satu fase per sesi** sesuai `prd.md` bagian 13. Jangan loncat ke fase berikutnya sebelum fase ini bisa dicoba dan disetujui.
3. Sebelum menulis kode, **sebutkan berkas apa yang akan dibuat atau diubah**.
4. Kerjakan langkah **kecil**; setelah tiap langkah pastikan aplikasi masih berjalan.
5. Jalankan `npm run lint` dan `npm run build` sebelum menyatakan selesai; perbaiki galatnya.
6. Setelah selesai, jelaskan dengan **bahasa sederhana** (tanpa istilah teknis berlebihan): apa yang dibuat, cara mencobanya, dan apa yang belum selesai.
7. Jika ada kesalahan atau ketidakpastian, **katakan terus terang**; jangan menebak.
8. Pertanyaan atau keputusan di luar dokumen: **tanyakan**, jangan diputuskan sendiri.

## 9. Perintah Umum
| Perintah | Fungsi |
|---|---|
| `npm install` | Memasang dependensi |
| `npm run dev` | Menjalankan lokal di `http://localhost:3000` |
| `npm run lint` | Memeriksa gaya kode |
| `npm run build` | Uji build produksi (harus lolos sebelum deploy) |

Setelah mengubah `.env.local`, **hentikan lalu jalankan ulang** `npm run dev`.

## 10. Larangan
- Menambah database, login, atau server lain.
- Menambah library selain dua yang diizinkan.
- Menulis key atau rahasia di kode, chat, atau commit.
- Mengubah palet inti atau nama produk.
- Mengubah kontrak AI atau model data tanpa memperbarui `prd.md` (dan meminta persetujuan).
- Menambah fitur di luar `prd.md` (3D, akun, jual-beli, dan lainnya).
- Menghapus data pengguna atau berkas tanpa konfirmasi.
- Melewati penanganan galat demi kode yang lebih singkat.

## 11. Git
- Satu commit per langkah selesai, pesan singkat dalam bahasa Indonesia, misalnya `Tambah tab Lemari dengan simpan ke localStorage`.
- Jangan commit `.env.local`, `node_modules`, atau `.next`.
- Jangan mem-push atau men-deploy tanpa diminta pemilik proyek.

## 12. Definisi Selesai untuk Satu Tugas
- [ ] Sesuai `prd.md` dan `design.md`.
- [ ] `npm run lint` dan `npm run build` lolos.
- [ ] Keadaan kosong, memuat, dan galat tertangani.
- [ ] Tidak ada teks UI di luar `lib/copy.ts`, tidak ada hex warna di luar `colors.json` dan `globals.css`.
- [ ] Tidak ada key atau rahasia di kode.
- [ ] Penjelasan singkat untuk pemilik proyek sudah diberikan.
