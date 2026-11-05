# PRD: AVÉRA

> Versi 1.2 · 5 November 2026 · Status: siap dikerjakan
> Catatan penulisan: nama produk selalu ditulis **AVÉRA** (dengan "É"). Simpan semua file sebagai UTF-8. Untuk hal teknis (nama paket, folder, domain) pakai versi ASCII: `avera`.
>
> **Perubahan dari v1.1:** gaya visual ditetapkan di `design.md` (earth tone + liquid glass, netral gender); library ikon `lucide-react` ditambahkan sehingga library tambahan menjadi dua; teks UI dikumpulkan di `lib/copy.ts`; struktur folder diperbarui (`globals.css`, `copy.ts`); referensi ke `design.md`, `agent.md`, dan `setup.md` dilengkapi.
>
> **Perubahan dari v1.0 (ringkas):** model AI ditetapkan (Gemini 3.5 Flash-Lite), struktur proyek disederhanakan (satu halaman, tanpa library penyimpanan), data warna lengkap (bagian 9), panduan konfigurasi Gemini (Lampiran A).

---

## 1. Ringkasan Produk

AVÉRA adalah web mix and match outfit. Pengguna mendata isi lemari pakaiannya, lalu AI menyusun **ide outfit hari ini** dari barang yang sudah dimiliki, berdasarkan **zodiak**, **undertone kulit**, atau **kombinasi keduanya**. AVÉRA juga memberi **saran palet warna**, termasuk warna yang belum ada di lemari.

Proyek ini adalah tugas kuliah (jurusan Manajemen) berupa ide bisnis berbasis platform web. Fokusnya: berjalan stabil di Vercel, mudah didemokan, dan **mudah dijelaskan oleh orang non-IT**.

## 2. Keputusan yang Sudah Ditetapkan

| Topik | Keputusan |
|---|---|
| Mesin ide outfit | **Gemini 3.5 Flash-Lite** (model ID `gemini-3.5-flash-lite`), dipanggil lewat satu Vercel Serverless Function |
| Visualisasi outfit | **Papan outfit 2D** (siluet manusia dengan item bertumpuk). 3D di luar cakupan |
| Database dan backend | **Tanpa database**. Data di browser pengguna. Satu-satunya "backend" adalah fungsi serverless untuk AI |
| Penyimpanan | `localStorage` saja, tanpa library tambahan (foto dikompres kecil) |
| Struktur halaman | **Satu halaman** dengan lima tab, bukan banyak rute |
| Tampilan | **Earth tone + liquid glass**, netral gender. Rincian lengkap di `design.md` |
| Bahasa | UI berbahasa Indonesia, nada ramah memakai "kamu" |
| Ikon | `lucide-react` |
| Hosting | Vercel |
| API key | **Belum dimasukkan.** Panduan konfigurasi ada di Lampiran A |

## 3. Tujuan dan Bukan Tujuan

**Tujuan**
1. Pengguna bisa mengisi lemari dengan cepat (kurang dari 5 menit untuk 10 item).
2. Pengguna mendapat minimal satu ide outfit yang masuk akal dari lemarinya dalam satu klik.
3. Pengguna mendapat saran palet warna meski AI gagal (fallback aturan statis).
4. Seluruh alur bisa didemokan di depan dosen tanpa login dan tanpa setup tambahan.
5. Kode cukup kecil sehingga pemilik tugas bisa menjelaskan cara kerjanya (lihat bagian 14).

**Bukan tujuan (tidak dibuat)**
Login dan akun, sinkronisasi antar perangkat, jual-beli pakaian, rekomendasi produk berbayar, aplikasi mobile native, ilustrasi 3D, pembayaran.

## 4. Pengguna dan Skenario

**Target:** perempuan dan laki-laki usia 17-30 tahun, termasuk pengguna hijab, yang suka fashion tetapi tidak punya waktu atau pengetahuan styling.

**User story**
- Sebagai pengguna, saya ingin menambahkan pakaian saya ke lemari digital agar semua barang saya terdata di satu tempat.
- Sebagai pengguna, saya ingin memilih zodiak dan/atau undertone agar saran outfit terasa personal.
- Sebagai pengguna, saya ingin satu tombol yang memberi ide outfit hari ini dari barang yang sudah saya punya.
- Sebagai pengguna, saya ingin melihat outfit itu divisualisasikan agar saya bisa membayangkan hasilnya.
- Sebagai pengguna, saya ingin menyimpan outfit favorit agar bisa dilihat lagi.
- Sebagai pengguna, saya ingin tahu warna apa yang cocok untuk saya, meski belum punya barangnya.

## 5. Alur Pengguna

```
Buka AVÉRA → tab Profil (zodiak/undertone) → tab Lemari (isi pakaian)
          → tab Ide Outfit (buat, lihat papan 2D, simpan)
          → tab Palet (saran warna)        → tab Tersimpan (lihat outfit favorit)
```

Pengguna baru boleh langsung mencoba lewat tombol **"Pakai data contoh"** yang mengisi lemari dengan item dummy.

## 6. Kebutuhan Fungsional

Prioritas: **P0** = wajib MVP, **P1** = jika waktu cukup.

### F1. Lemari Digital (P0)
- Tambah, ubah, dan hapus item.
- Kategori: `atasan`, `bawahan`, `hijab`, `sepatu`, `aksesoris` (sub-jenis aksesoris: `jam`, `cincin`, `kalung`, `lainnya`).
- Field item: nama (wajib), kategori (wajib), warna (wajib, dipilih lewat spektrum warna bebas dengan deteksi nama otomatis atau pilihan cepat dari `basicColors` di `colors.json`), foto (opsional), catatan model (opsional, misalnya "kemeja oversize", "celana kulot").
- Tampilan lemari: grid per kategori, dengan jumlah item per kategori.
- Tombol **"Pakai data contoh"** untuk memuat data dummy (sekitar 12 item, termasuk hijab dan aksesoris).
- Foto dikompres di sisi klien sebelum disimpan: sisi terpanjang maksimal 600 px, kualitas sekitar 0.6, disimpan sebagai teks (data URL).
- Batas maksimal **40 item** agar `localStorage` (sekitar 5 MB) tidak penuh. Saat batas tercapai, tampilkan pesan yang jelas.

**Kriteria penerimaan**
- Item yang ditambahkan tetap ada setelah halaman di-refresh.
- Item tanpa foto tetap tampil dengan penanda warna dan ikon kategori.
- Menghapus item meminta konfirmasi.

### F2. Profil Gaya (P0)
- Pilih **zodiak** (12 pilihan, dengan rentang tanggal sebagai bantuan) dan/atau **undertone** (`warm`, `cool`, `neutral`).
- Mode ide outfit: `zodiak`, `undertone`, atau `kombinasi`. Mode hanya bisa dipilih jika datanya sudah diisi.
- Bantuan singkat cara mengetahui undertone (tes urat nadi), diambil dari field `hint` di `colors.json`.
- Profil tersimpan di browser dan bisa diubah kapan saja.

**Kriteria penerimaan**
- Mode "kombinasi" nonaktif jika salah satu data kosong, dengan pesan yang jelas.

### F3. Ide Outfit Hari Ini (P0)
- Tombol **"Buat ide outfit"** memanggil AI dengan isi lemari, profil gaya, dan daftar warna yang berlaku untuk mode terpilih.
- Hasil: satu outfit berisi item dari lemari (atasan + bawahan, hijab bila ada dan cocok, sepatu, aksesoris opsional), **alasan singkat** (maksimal 2 kalimat), dan **catatan palet** (mengapa warnanya cocok).
- Tombol **"Coba ide lain"** meminta kombinasi berbeda (kirim outfit sebelumnya agar tidak berulang).
- AI **hanya boleh memakai item yang ada di lemari** (diverifikasi di server, lihat bagian 8).
- Aturan warna: AI diminta memakai **minimal satu item berwarna mirip dengan palet** dari tiap sumber yang dipilih (zodiak dan/atau undertone), dan boleh memakai warna netral (bagian 9) sebagai penyeimbang. Jika tidak ada item yang cocok, AI tetap memberi outfit terbaik dan menyebutkannya di catatan palet.
- Jika lemari belum cukup (misalnya tidak ada atasan atau tidak ada bawahan), tampilkan pesan yang menyebutkan apa yang kurang.
- Batas pemakaian: maksimal 10 permintaan AI per hari per browser (penghitung di browser) untuk menjaga biaya.

**Kriteria penerimaan**
- Setiap item di hasil punya `id` yang benar-benar ada di lemari.
- Saat AI gagal atau lambat (lebih dari 20 detik), pengguna melihat pesan galat ramah dan tombol coba lagi. Tidak ada layar kosong.
- Indikator loading tampil selama menunggu.

### F4. Saran Palet Warna (P0)
- Menampilkan warna sesuai mode: 2 warna zodiak, 5 warna undertone, atau keduanya (7 warna, dikelompokkan menurut sumber), ditambah deretan **warna netral "Tambahan Styling"**.
- Berasal dari `colors.json` sehingga berfungsi tanpa AI dan tanpa internet.
- Untuk setiap warna, tandai apakah pengguna **sudah punya** item berwarna serupa di lemari (kemiripan warna dihitung sederhana lewat jarak nilai RGB).
- Opsional (P1): AI menambah penjelasan singkat tentang palet.

**Kriteria penerimaan**
- Palet tampil seketika dan tidak bergantung pada jaringan.

### F5. Papan Outfit 2D (P0)
- Visualisasi outfit pada siluet manusia 2D: item ditumpuk di posisi yang sesuai (hijab di kepala, atasan, bawahan, sepatu, aksesoris di titik yang relevan).
- Item dengan foto menampilkan foto; item tanpa foto menampilkan blok warna dengan ikon kategori.
- Tidak ada drag-and-drop pada MVP.
- Detail visual (siluet, posisi tiap item, bentuk item tanpa foto) ditetapkan di `design.md` bagian 9.

**Kriteria penerimaan**
- Outfit dengan hijab dan tanpa hijab sama-sama tampil benar.
- Papan terbaca baik di layar ponsel.

### F6. Simpan dan Lihat Outfit (P0)
- Tombol **"Simpan outfit"** pada hasil.
- Tab **Tersimpan**: daftar kartu outfit (mini papan, tanggal, mode yang dipakai, alasan singkat).
- Hapus outfit tersimpan (dengan konfirmasi).
- Jika item lemari dihapus setelah outfit disimpan, outfit tetap tampil dengan penanda "item sudah dihapus" (tidak boleh error).

### F7. Ekspor Gambar Outfit (P1)
- Unduh papan outfit sebagai gambar PNG.

### F8. Cadangan Data (P1)
- Ekspor dan impor seluruh data (lemari, profil, outfit) sebagai file JSON, untuk mengatasi keterbatasan data hanya di satu perangkat.

## 7. Model Data (disimpan di browser)

Semua disimpan di `localStorage` dengan tiga kunci: `avera.wardrobe`, `avera.profile`, `avera.outfits`, ditambah `avera.quota` untuk penghitung permintaan AI.

```ts
type Category = "atasan" | "bawahan" | "hijab" | "sepatu" | "aksesoris";
type AccessoryType = "jam" | "cincin" | "kalung" | "lainnya";
type Undertone = "warm" | "cool" | "neutral";
type ZodiacId =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";
type Mode = "zodiak" | "undertone" | "kombinasi";

interface WardrobeItem {
  id: string;                 // uuid
  name: string;
  category: Category;
  accessoryType?: AccessoryType;
  colorName: string;          // dari basicColors, contoh: "Biru"
  colorHex: string;           // contoh: "#2F6DB5"
  note?: string;              // contoh: "kemeja oversize"
  photo?: string;             // data URL hasil kompres (opsional)
  createdAt: number;
}

interface StyleProfile {
  zodiac?: ZodiacId;
  undertone?: Undertone;
}

interface SavedOutfit {
  id: string;
  createdAt: number;
  mode: Mode;
  profileSnapshot: StyleProfile;
  items: { itemId: string; snapshot: Pick<WardrobeItem,
    "name" | "category" | "accessoryType" | "colorName" | "colorHex"> }[];
  reason: string;
  paletteNote: string;
}
```

`snapshot` pada outfit tersimpan dipakai agar outfit tetap utuh walau item lemari dihapus.

## 8. Kontrak AI

### 8.1 Endpoint
`POST /api/outfit` (Next.js Route Handler, berjalan sebagai Vercel Serverless Function). Satu-satunya fungsi server di proyek ini.

**Request**
```json
{
  "mode": "kombinasi",
  "profile": { "zodiac": "leo", "undertone": "warm" },
  "palette": [
    { "name": "Emas Madu", "hex": "#D4A23C", "source": "zodiac" },
    { "name": "Olive", "hex": "#77803F", "source": "undertone" }
  ],
  "wardrobe": [
    { "id": "a1", "name": "Kemeja linen krem", "category": "atasan",
      "colorName": "Krem", "colorHex": "#EAD9B7", "note": "oversize" }
  ],
  "previousOutfits": [["a1", "b2", "c3"]]
}
```
Catatan: **foto tidak dikirim** ke AI (hemat biaya dan privasi). Hanya nama, kategori, warna, dan catatan. `palette` berasal dari `colors.json` dan dirakit di klien sesuai mode.

**Response (sukses)**
```json
{
  "outfit": {
    "itemIds": ["a1", "b2", "c3"],
    "reason": "Maksimal 2 kalimat.",
    "paletteNote": "Maksimal 2 kalimat tentang kecocokan warna."
  }
}
```

**Response (galat)** berbentuk `{ "error": { "code": "...", "message": "..." } }` dengan kode: `BAD_REQUEST`, `WARDROBE_TOO_SMALL`, `AI_UNAVAILABLE`, `AI_INVALID_OUTPUT`, `RATE_LIMITED`.

### 8.2 Aturan fungsi server
1. API key dibaca dari environment variable `GEMINI_API_KEY`, tidak pernah dikirim ke klien dan tidak memakai awalan `NEXT_PUBLIC_`.
2. Validasi input: batasi jumlah item (maks. 40), panjang teks per field, dan ukuran body.
3. Minta AI mengeluarkan **JSON saja** (gunakan fitur *structured output* / JSON mode milik Gemini); parse dan validasi hasilnya.
4. **Verifikasi bahwa setiap `itemId` ada di `wardrobe` yang dikirim.** Jika tidak valid, coba ulang sekali; jika masih gagal, kembalikan `AI_INVALID_OUTPUT`.
5. Aturan komposisi yang dicek di server: minimal satu atasan dan satu bawahan, paling banyak satu item per kategori utama (kecuali aksesoris, maks. 3). Hijab opsional.
6. Batas waktu pemanggilan AI: 20 detik.
7. Tidak menyimpan data pengguna dan tidak mencatat isi lemari ke log.
8. **Jangan mengirim parameter `temperature`, `top_p`, atau `top_k`.** Dokumentasi Google menyatakan parameter ini tidak dipakai lagi untuk model Gemini 3.5 Flash-Lite dan model sesudahnya.

### 8.3 Aturan prompt (system prompt)
- Peran: penata gaya yang ramah dan ringkas, berbahasa Indonesia.
- Hanya pakai `id` dari lemari yang dikirim. Dilarang mengarang item.
- Pertimbangkan model (potongan, kesesuaian atasan-bawahan, kesopanan untuk pengguna berhijab) dan kombinasi warna.
- Gunakan `palette` yang dikirim sebagai panduan warna; zodiak dan undertone adalah **panduan gaya yang bersifat hiburan**, bukan klaim ilmiah.
- Hindari mengulang outfit di `previousOutfits`.
- Keluaran wajib JSON sesuai skema di atas, tanpa teks tambahan.

### 8.4 Model dan konfigurasi
| Hal | Nilai |
|---|---|
| Model | Gemini 3.5 Flash-Lite |
| Model ID | `gemini-3.5-flash-lite` (disimpan di env var `GEMINI_MODEL` agar mudah diganti) |
| Library | `@google/genai` (SDK resmi Google untuk JavaScript) |
| Tingkat berpikir | Biarkan bawaan (`minimal`); cukup untuk tugas memilih dari daftar kecil |
| Harga (acuan dokumentasi Google, bisa berubah) | sekitar $0,30 per 1 juta token input dan $2,50 per 1 juta token output |
| Cadangan jika perlu kualitas lebih | `gemini-3.6-flash` (cukup ganti nilai `GEMINI_MODEL`) |

Tiap permintaan hanya berisi puluhan baris teks, sehingga biayanya sangat kecil. Cek kuota dan harga terbaru di Google AI Studio sebelum demo.

## 9. Data Warna

Data lengkap ada di file **`data/colors.json`** (file terpisah, sudah disertakan). Tabel di bawah adalah salinan agar mudah dibaca. **Jika warna diubah, ubah `colors.json` lalu perbarui tabel ini.**

> **Status: DRAFT.** Asosiasi warna zodiak berbeda-beda di tiap sumber. Draft ini memakai asosiasi umum (berdasarkan elemen dan kebiasaan populer), **bukan satu sumber tertentu**. Tim perlu menetapkan satu sumber acuan dan mencatatnya di sini. Warna undertone mengikuti prinsip umum pemilihan warna fashion; ini panduan styling, bukan aturan mutlak.

### 9.1 Zodiak (12 tanda, 2 warna per tanda)

| Zodiak | Tanggal | Elemen | Warna 1 | Warna 2 |
|---|---|---|---|---|
| Aries | 21 Mar - 19 Apr | Api | Merah Bata `#B5432F` | Jingga Hangat `#D9822B` |
| Taurus | 20 Apr - 20 Mei | Tanah | Hijau Sage `#8FA37E` | Cokelat Tanah `#8A6A4F` |
| Gemini | 21 Mei - 20 Jun | Udara | Kuning Mentega `#F0D56B` | Biru Langit `#8FB8D8` |
| Cancer | 21 Jun - 22 Jul | Air | Putih Mutiara `#F1EEE8` | Biru Laut Lembut `#7FA6B8` |
| Leo | 23 Jul - 22 Agu | Api | Emas Madu `#D4A23C` | Oranye Senja `#E08A3E` |
| Virgo | 23 Agu - 22 Sep | Tanah | Hijau Zaitun `#7A8450` | Cokelat Kayu `#7B5B43` |
| Libra | 23 Sep - 22 Okt | Udara | Biru Debu `#8AA4C0` | Abu Pasir `#BDB5AA` |
| Scorpio | 23 Okt - 21 Nov | Air | Merah Anggur `#6E1F2E` | Hitam Arang `#2B2B2B` |
| Sagitarius | 22 Nov - 21 Des | Api | Ungu Anggur `#6B4C9A` | Biru Royal `#3F5FA8` |
| Capricorn | 22 Des - 19 Jan | Tanah | Cokelat Kopi `#5A4030` | Abu Batu `#7A7A78` |
| Aquarius | 20 Jan - 18 Feb | Udara | Biru Turkuaz `#3FA7A3` | Perak `#B8BCC2` |
| Pisces | 19 Feb - 20 Mar | Air | Hijau Laut `#5E9C8F` | Ungu Kabut `#9C92B8` |

### 9.2 Undertone (3 jenis, 5 warna per jenis)

| Undertone | Ciri singkat | Warna 1 | Warna 2 | Warna 3 | Warna 4 | Warna 5 |
|---|---|---|---|---|---|---|
| Warm | Kulit keemasan atau kekuningan; urat nadi kehijauan | Olive `#77803F` | Terakota `#C0623F` | Mustard `#D1A024` | Camel `#B98B54` | Cokelat Hangat `#7B4A2D` |
| Cool | Kulit kemerahan atau kebiruan; urat nadi kebiruan | Navy `#243B5C` | Hijau Zamrud `#1F7A5C` | Biru Royal `#3B5BA9` | Plum `#6B3F6E` | Abu Dingin `#8E98A5` |
| Neutral | Campuran, tidak condong ke warm maupun cool | Hijau Sage `#8FA37E` | Taupe `#8B7D6B` | Teal Lembut `#4F8A8B` | Biru Kelabu `#7E94A8` | Mauve Debu `#A58C9A` |

### 9.3 Warna netral "Tambahan Styling"

Penyeimbang agar kombinasi serasi, ditampilkan dengan label "Tambahan Styling".

| Warna | Kode |
|---|---|
| Putih Tulang | `#F4EFE6` |
| Krem | `#EAD9B7` |
| Cokelat Muda | `#B08D6A` |
| Abu Muda | `#C9C6C0` |
| Abu Tua | `#5E5E5E` |
| Denim | `#4A6382` |
| Hitam | `#222222` |

### 9.4 Warna dasar untuk pilihan cepat lemari (`basicColors`)

Dipakai sebagai pilihan warna cepat selain spektrum warna bebas saat pengguna menambah pakaian: Merah `#C0392B`, Oranye `#E67E22`, Kuning `#F1C40F`, Hijau `#2E8B57`, Hijau Muda `#A6D69A`, Biru `#2F6DB5`, Biru Muda `#8EC5E8`, Tosca `#2EB8A6`, Ungu `#7E57C2`, Merah Muda `#E8A0B4`, Marun `#6E1F2E`, Cokelat `#7B4F2E`, Krem `#EAD9B7`, Putih `#FAFAFA`, Hitam `#222222`, Abu-abu `#8E8E8E`, Emas `#D4AF37`, Perak `#C0C0C0`.

### 9.5 Cara data warna dipakai
| Mode | Palet yang ditampilkan dan dikirim ke AI |
|---|---|
| Zodiak | 2 warna zodiak + netral |
| Undertone | 5 warna undertone + netral |
| Kombinasi | 2 warna zodiak + 5 warna undertone (7 warna, dikelompokkan menurut sumber) + netral |

Pada mode kombinasi tidak dicari irisan (kedua daftar hampir tidak pernah beririsan); keduanya digabung, dan AI diminta memakai minimal satu warna dari tiap sumber bila lemari memungkinkan.

## 10. Tampilan Halaman

**Satu halaman** (`/`) dengan lima tab. Berpindah tab tidak memuat ulang halaman.

| Tab | Isi |
|---|---|
| Lemari | Grid item per kategori, tambah/ubah/hapus, tombol data contoh |
| Profil | Zodiak, undertone, bantuan undertone |
| Ide Outfit | Pilih mode, tombol buat ide, papan outfit 2D, alasan, simpan, coba ide lain |
| Palet | Saran warna sesuai profil, penanda "sudah punya" |
| Tersimpan | Daftar outfit tersimpan |

Navigasi tab: kapsul kaca melayang, di bawah pada ponsel dan di atas pada desktop; tab diberi nomor 01-05. Desain **mobile-first**. Pengantar singkat AVÉRA tampil di atas tab saat lemari masih kosong. Tampilan tiap tab, komponen, warna, dan efek kaca dijelaskan di `design.md`.

## 11. Kebutuhan Non-Fungsional

- **Performa:** halaman termuat kurang dari 3 detik pada koneksi 4G; pemanggilan AI umumnya kurang dari 10 detik.
- **Responsif:** nyaman dipakai dari lebar 360 px hingga desktop.
- **Privasi:** semua data pengguna tinggal di browser. Ke server hanya terkirim teks lemari saat meminta ide outfit, dan tidak disimpan oleh AVÉRA. Tampilkan catatan singkat soal ini di UI. (Pemrosesan oleh Google tunduk pada ketentuan Gemini API.)
- **Keamanan:** API key hanya di server; validasi input; tidak ada `dangerouslySetInnerHTML` untuk teks dari pengguna atau AI.
- **Ketahanan:** setiap kegagalan (AI, penyimpanan penuh, foto gagal dikompres) menampilkan pesan yang bisa dipahami dan tidak merusak data yang ada.
- **Aksesibilitas dasar:** kontras teks minimal 4,5 : 1 (angka per kombinasi warna ada di `design.md` bagian 3), semua tombol punya label, `alt` pada foto item, panel kaca punya cadangan solid jika `backdrop-filter` tidak didukung.
- **Bahasa:** UI berbahasa Indonesia. Semua teks UI dikumpulkan di satu berkas, `lib/copy.ts` (daftar teks awal ada di `design.md` bagian 13).

## 12. Arsitektur dan Struktur Proyek

### 12.1 Teknologi (sesedikit mungkin)
| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Gaya | Tailwind CSS + token CSS di `globals.css` (detail visual dari `design.md`) |
| Font | Instrument Serif dan Manrope lewat `next/font/google` (bawaan Next.js, bukan library tambahan) |
| Ikon | `lucide-react` |
| Penyimpanan | `localStorage` bawaan browser, tanpa library |
| AI | `@google/genai` di satu Route Handler |
| Deploy | Vercel (hubungkan repo GitHub) |
| Tanpa | Database, autentikasi, server terpisah, state manager |

Hanya **dua library tambahan** di luar bawaan Next.js: `@google/genai` (AI) dan `lucide-react` (ikon).

### 12.2 Struktur folder (± 12 file kode)
```
avera/
├─ app/
│  ├─ globals.css             # token warna, kelas kaca, latar "Dune" (design.md)
│  ├─ layout.tsx              # kerangka halaman, font, judul "AVÉRA"
│  ├─ page.tsx                # halaman tunggal + penukar tab
│  └─ api/outfit/route.ts     # SATU-SATUNYA kode server: panggil Gemini
├─ components/
│  ├─ Wardrobe.tsx            # tab Lemari
│  ├─ ProfileForm.tsx         # tab Profil
│  ├─ OutfitIdeas.tsx         # tab Ide Outfit
│  ├─ OutfitBoard.tsx         # papan outfit 2D
│  ├─ ColorPalette.tsx        # tab Palet
│  └─ SavedOutfits.tsx        # tab Tersimpan
├─ data/
│  ├─ colors.json             # data warna (bagian 9)
│  └─ sampleWardrobe.ts       # data contoh
├─ lib/
│  ├─ types.ts                # tipe data (bagian 7)
│  ├─ copy.ts                 # semua teks UI berbahasa Indonesia
│  ├─ storage.ts              # baca/tulis localStorage + kompres foto
│  └─ palette.ts              # rakit palet sesuai mode, cek "sudah punya"
├─ public/                    # siluet 2D dan ikon kategori
├─ .env.local                 # kunci rahasia (TIDAK di-commit)
└─ prd.md  design.md  agent.md  setup.md
```

**Aturan sederhana:** satu komponen = satu tab/fungsi; semua data warna di `colors.json`; semua teks UI di `copy.ts`; semua akses `localStorage` lewat `storage.ts`; semua akses AI lewat `route.ts`.

Catatan: Tailwind versi terbaru menaruh token warna di `globals.css` (blok `@theme`), bukan di `tailwind.config`. Ikuti versi yang terpasang dari `create-next-app`.

### 12.3 Environment variable
| Nama | Fungsi | Contoh |
|---|---|---|
| `GEMINI_API_KEY` | Kunci API dari Google AI Studio (hanya server) | *(diisi sendiri, jangan dibagikan)* |
| `GEMINI_MODEL` | Nama model | `gemini-3.5-flash-lite` |

Wajib diatur di dua tempat: `.env.local` (lokal) dan Vercel (produksi). Langkahnya ada di Lampiran A. Jangan pernah commit `.env.local`.

## 13. Fase Pengerjaan

| Fase | Isi | Hasil yang bisa dicek |
|---|---|---|
| 1. Fondasi | Proyek Next.js, tab, tipe data, `storage.ts`, data contoh | Lemari bisa diisi dan bertahan setelah refresh |
| 2. Profil dan palet | Profil gaya, `colors.json`, tab Palet | Palet tampil sesuai zodiak/undertone tanpa AI |
| 3. AI | `route.ts`, validasi, galat, kuota harian (Lampiran A harus selesai) | Ide outfit valid muncul dari lemari |
| 4. Papan 2D dan simpan | `OutfitBoard`, simpan, tab Tersimpan | Alur lengkap dari lemari sampai simpan |
| 5. Poles dan deploy | Tampilan dari `design.md`, responsif, uji ponsel, deploy Vercel, uji di URL publik | Siap demo |
| 6. Tambahan (P1) | Ekspor PNG, cadangan JSON | Fitur bonus |

## 14. Panduan Menjelaskan ke Dosen (untuk Pemilik Tugas)

Jawaban singkat yang bisa dipakai jika ditanya, tanpa istilah teknis berlebihan.

| Pertanyaan | Jawaban singkat |
|---|---|
| Datanya disimpan di mana? | Di browser pengguna sendiri, bukan di server kami. Jadi tidak butuh database dan biaya penyimpanan nol. Konsekuensinya: data hanya ada di satu perangkat. |
| Bagaimana AI membuat outfit? | Aplikasi mengirim daftar pakaian (teks), zodiak/undertone, dan palet warna ke Gemini. Gemini memilih kombinasi dan menjelaskan alasannya. Aplikasi memeriksa bahwa pakaian yang dipilih benar-benar ada di lemari. |
| Kalau AI mati atau kuota habis? | Saran palet warna tetap jalan karena berasal dari tabel warna di aplikasi. Hanya ide outfit yang butuh AI. |
| Apakah zodiak dan undertone itu ilmiah? | Tidak diklaim ilmiah. Keduanya dipakai sebagai panduan gaya yang personal dan menghibur. Undertone berhubungan dengan teori warna fashion; zodiak adalah sentuhan unik produk. |
| Dari mana asal biaya? | Hanya pemanggilan AI, yang per permintaan sangat kecil. Dibatasi 10 permintaan per hari per pengguna. |
| Bagaimana jadi bisnis? | Ide pengembangan (di luar MVP): langganan fitur premium, kolaborasi dengan toko pakaian, rekomendasi produk. Belum dibuat di versi ini. |
| Kenapa tidak ada login? | Agar pengguna bisa langsung mencoba. Login dan sinkronisasi antar perangkat masuk rencana pengembangan. |

## 15. Pengujian dan Kriteria Selesai

**Uji manual yang harus lolos sebelum demo**
1. Tambah 10 item (termasuk hijab dan aksesoris), refresh, data tetap ada.
2. Pilih tiap mode (zodiak, undertone, kombinasi) dan dapatkan outfit valid.
3. Hasil AI hanya berisi item yang ada di lemari (cek 5 kali berturut-turut).
4. Matikan jaringan atau gunakan key salah: muncul pesan galat ramah, palet statis tetap berfungsi.
5. Simpan outfit, hapus salah satu item lemari, outfit tersimpan tetap terbuka.
6. Lemari kosong atau tanpa bawahan: pesan jelas, tidak ada galat teknis.
7. Tambah item sampai batas 40: pesan batas muncul, data lama aman.
8. Alur lengkap berjalan di ponsel dan di URL Vercel (bukan hanya `localhost`).

**Definisi selesai (MVP):** semua kebutuhan P0 terpenuhi, uji manual di atas lolos, API key tidak terlihat di kode klien maupun tab Network, dan aplikasi aktif di Vercel.

## 16. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| AI mengarang item atau salah format | Hasil tidak valid | Validasi `itemId` di server, coba ulang sekali, pesan galat ramah |
| Biaya atau kuota AI | Anggaran tugas terlampaui atau permintaan ditolak | Model Flash-Lite yang murah, batas 10 permintaan/hari/browser, tanpa kirim foto, pantau di AI Studio |
| API key bocor | Penyalahgunaan | Hanya di server, env var, jangan commit; jika bocor, hapus dan buat ulang key |
| `localStorage` penuh | Foto gagal tersimpan | Kompres foto 600 px, batas 40 item, pesan jelas, cadangan JSON (P1) |
| Data hilang saat cache dihapus | Pengguna kehilangan lemari | Catat di UI dan presentasi; cadangan JSON (P1) |
| Klaim zodiak/undertone dianggap ilmiah | Kritik saat presentasi | Label "panduan gaya, bersifat hiburan" di UI |
| Data warna zodiak tidak punya sumber tunggal | Pertanyaan "dari mana datanya?" | Tetapkan satu sumber acuan atau jelaskan sebagai asosiasi umum (bagian 9) |
| Kuota harian mudah dilewati (hanya di browser) | Penyalahgunaan terbatas | Diterima untuk tugas kuliah; batas ukuran body di server |
| Model atau harga berubah | Hasil atau biaya berbeda | Nama model di env var `GEMINI_MODEL`, mudah diganti |

## 17. Pertanyaan Terbuka

1. Sumber acuan untuk warna zodiak (bagian 9).
2. Apakah fitur P1 (ekspor PNG, cadangan JSON) dikerjakan sebelum atau sesudah deploy pertama?
3. Asumsi sementara dari `design.md` bagian 17 (bisa diubah): wordmark berupa teks tanpa logo, latar berupa gradasi CSS tanpa foto, dan tanpa mode gelap.

Sudah diputuskan: gaya visual (earth tone + liquid glass, netral gender), ikon `lucide-react`, teks UI di `lib/copy.ts`.

## 18. Dokumen Terkait
- `design.md`: arah visual, warna dan kontras, efek kaca, komponen UI, tampilan tiap tab, papan outfit 2D, teks antarmuka.
- `agent.md`: aturan proyek untuk asisten AI di IDE (struktur kode, konvensi, larangan seperti commit API key).
- `setup.md`: langkah setup dari nol (proyek, API key Gemini, deploy) dan prompt awal untuk IDE.
- `data/colors.json`: data warna.

Urutan prioritas jika ada perbedaan: `prd.md` (apa yang dibuat) → `design.md` (tampilan) → `agent.md` (cara bekerja).

---

## Lampiran A. Konfigurasi Gemini 3.5 Flash-Lite (Langkah demi Langkah)

Prasyarat: Node.js terpasang, proyek Next.js sudah dibuat, akun Google, repo GitHub untuk Vercel.

**Langkah 1. Buat API key**
1. Buka `https://aistudio.google.com/apikey` dan masuk dengan akun Google.
2. Klik **Create API key**; pilih proyek yang ada atau buat proyek baru.
3. Salin key-nya. Perlakukan seperti kata sandi: jangan dikirim lewat chat, jangan ditaruh di kode.

**Langkah 2. Simpan key di komputer (lokal)**
1. Di folder utama proyek (sejajar dengan `package.json`), buat file bernama `.env.local`.
2. Isi dengan dua baris:
   ```
   GEMINI_API_KEY=tempel_key_kamu_di_sini
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```
3. Pastikan `.gitignore` memuat `.env*.local` (proyek Next.js baru biasanya sudah memuatnya). Cek dengan `git status`: `.env.local` **tidak boleh** muncul sebagai file yang akan di-commit.
4. Jangan menambahkan awalan `NEXT_PUBLIC_` pada nama variabel; awalan itu membuat nilainya terbuka di browser.

**Langkah 3. Pasang library**
```
npm install @google/genai
```
Library ini otomatis membaca variabel `GEMINI_API_KEY`.

**Langkah 4. Uji key sebelum menulis kode aplikasi (opsional, disarankan)**
Jalankan perintah ini di terminal (macOS/Linux/Git Bash; ganti `$GEMINI_API_KEY` dengan key jika variabel belum diatur di terminal):
```
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"contents":[{"parts":[{"text":"Halo, balas dengan satu kalimat."}]}]}'
```
Jika balasan berisi teks dari model, key dan nama model sudah benar. Alternatif tanpa terminal: coba model yang sama langsung di AI Studio.

**Langkah 5. Pastikan kode memakai key dengan benar**
- Panggilan ke Gemini hanya terjadi di `app/api/outfit/route.ts`.
- Nama model dibaca dari `GEMINI_MODEL`.
- Jangan mengirim `temperature`, `top_p`, atau `top_k` (bagian 8.2).
- Setelah mengubah `.env.local`, **hentikan lalu jalankan ulang** `npm run dev`; Next.js hanya membaca file itu saat mulai.

**Langkah 6. Atur key di Vercel (produksi)**
1. Dorong proyek ke GitHub, lalu impor repo di Vercel (**Add New → Project**).
2. Buka **Project → Settings → Environment Variables**.
3. Tambahkan `GEMINI_API_KEY` dan `GEMINI_MODEL` dengan nilai yang sama seperti di `.env.local`. Centang semua lingkungan (Production, Preview, Development).
4. **Deploy ulang** (Deployments → titik tiga → Redeploy). Variabel baru hanya berlaku untuk deploy berikutnya.
5. Uji di URL Vercel, bukan hanya di `localhost`.

**Langkah 7. Jaga biaya dan keamanan**
- Pantau pemakaian dan kuota di Google AI Studio.
- Jika key sempat tertulis di tempat yang salah (kode, chat, repo publik): hapus key itu di AI Studio dan buat yang baru, lalu perbarui `.env.local` dan Vercel.

**Masalah umum**
| Gejala | Kemungkinan penyebab | Solusi |
|---|---|---|
| Galat 400 atau 403 | Key salah, salah salin, atau dibatasi | Salin ulang key; pastikan tidak ada spasi |
| Galat 404 / model tidak ditemukan | Nama model salah | Pastikan `gemini-3.5-flash-lite`; cek daftar model di dokumentasi Google |
| Galat 429 | Kuota atau batas permintaan habis | Tunggu, kurangi permintaan, cek kuota di AI Studio |
| Key "tidak terbaca" saat lokal | Server belum dijalankan ulang, atau nama file/variabel salah | Restart `npm run dev`; periksa nama `.env.local` dan `GEMINI_API_KEY` |
| Jalan di lokal, gagal di Vercel | Variabel belum ditambahkan atau belum redeploy | Ulangi Langkah 6 |
| Galat parameter tidak dikenali | Ada `temperature`/`top_p`/`top_k` di kode | Hapus parameter tersebut |

Acuan resmi: dokumentasi Gemini API di `https://ai.google.dev/gemini-api/docs` (halaman quickstart dan "latest model").
