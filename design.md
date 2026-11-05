# DESIGN: AVÉRA

> Versi 1.0 · 5 November 2026 · Pelengkap `prd.md` v1.1
> Dokumen ini menetapkan **gaya visual, warna, komponen, dan tampilan tiap tab**. Semua angka kontras di bawah dihitung dengan rumus WCAG, bukan perkiraan visual.
> Nama selalu ditulis **AVÉRA** (dengan "É"). Simpan semua file sebagai UTF-8.

---

## 1. Arah Desain

**Konsep: "Earth-Tone Liquid Glass"**
Panel kaca bening berembun (*frosted/liquid glass*) yang melayang di atas latar bernuansa tanah hangat: karamel, pasir, zaitun, dan cokelat tua. Hasilnya terasa modern, tenang, dan elegan.

**Tiga prinsip**
1. **Netral gender.** Warna earth tone, bentuk geometris, dan bahasa yang tidak condong ke maskulin atau feminin (checklist di bagian 14).
2. **Kaca untuk struktur, bukan hiasan.** Efek kaca dipakai pada navigasi, kartu, dan panel. Konten (foto pakaian, warna, teks) tetap jadi pusat perhatian.
3. **Terbaca dulu, cantik kemudian.** Setiap teks di atas kaca harus lolos kontras. Jika efek mengganggu keterbacaan, efeknya yang dikurangi.

**Suasana:** hangat, tenang, premium, seperti butik minimalis dengan cahaya senja.

**Hindari:** pink atau biru sebagai warna antarmuka, ornamen bunga, warna neon, bayangan hitam pekat, kaca bertumpuk lebih dari tiga lapis, teks tipis di atas latar ramai.

## 2. Referensi dan Yang Diambil

| Referensi | Yang diambil | Yang tidak diambil |
|---|---|---|
| **Palet earth tone** (Golden Batter, Toasted Caramel, Spiced Wine, Olive Harvest, Cowhide Cocoa) | Kelima warna sebagai palet inti AVÉRA, persis dengan kode hex-nya | Tata letak materi sumbernya |
| **Web liquid glass** (gambar toko pakaian dengan panel transparan di atas latar gurun) | Navigasi berbentuk pil melayang; kartu besar bersudut sangat bulat; tombol bundar dengan panah; angka indeks besar ("01"); kapsul informasi di bawah; produk "mengambang" dalam gelembung bening; latar bernuansa pasir dan senja | Foto gurun/AI sebagai latar (diganti gradasi CSS), merek Nike dan "O2", teks dan produk di dalamnya |

Karena ini tugas kuliah, catat kedua referensi sebagai **inspirasi** di slide presentasi. Jangan memakai gambar, logo, atau merek dari referensi di dalam web.

## 3. Warna

### 3.1 Palet inti (dari referensi)
| Token | Nama | Hex | Peran |
|---|---|---|---|
| `--batter` | Golden Batter | `#E8D1A7` | Latar terang, permukaan hangat |
| `--caramel` | Toasted Caramel | `#84592B` | Aksen utama, ikon, garis |
| `--wine` | Spiced Wine | `#743014` | Tombol utama, penekanan |
| `--olive` | Olive Harvest | `#9D9167` | Aksen lembut, dekorasi |
| `--cocoa` | Cowhide Cocoa | `#442D1C` | Teks utama, latar gelap |

### 3.2 Warna turunan (dibuat agar semua teks terbaca)
Warna ini **bukan** dari referensi; dibuat khusus karena palet inti tidak punya warna teks terang dan warna status.

| Token | Hex | Peran |
|---|---|---|
| `--ivory` | `#F8F1E3` | Teks di atas gelap, dasar kaca terang |
| `--olive-deep` | `#5F5A3A` | Versi zaitun yang aman untuk teks (status sukses, label) |
| `--danger` | `#A23B22` | Galat dan hapus |
| `--line` | `rgba(255,255,255,0.35)` | Garis tepi kaca |

### 3.3 Hasil uji kontras (WCAG; minimum 4,5 untuk teks biasa, 3 untuk teks besar ≥ 24 px)
| Teks | Latar | Rasio | Hasil |
|---|---|---|---|
| Cocoa | Ivory | 11,4 | Lolos (teks utama) |
| Cocoa | Golden Batter | 8,6 | Lolos |
| Ivory | Cocoa | 11,4 | Lolos |
| Ivory | Spiced Wine | 8,6 | Lolos (teks tombol utama) |
| Ivory | Toasted Caramel | 5,4 | Lolos |
| Toasted Caramel | Ivory | 5,4 | Lolos |
| Spiced Wine | Golden Batter | 6,5 | Lolos |
| Olive Deep | Ivory | 6,2 | Lolos |
| Danger | Ivory | 5,9 | Lolos |
| Toasted Caramel | Golden Batter | 4,1 | **Hanya teks besar** (≥ 24 px) |
| Olive Harvest | Ivory | 2,8 | **Gagal. Jangan dipakai untuk teks** |
| Toasted Caramel | Cocoa | 2,1 | **Gagal.** Cincin fokus di latar gelap memakai ivory |

### 3.4 Aturan pemakaian warna
- **Proporsi:** sekitar 60% netral hangat (Batter, Ivory), 30% cokelat (Caramel, Cocoa), 10% aksen (Wine, Olive).
- Olive Harvest `#9D9167` **hanya untuk dekorasi** (gelembung latar, garis, ikon pasif), tidak pernah untuk teks.
- Tombol utama: latar Spiced Wine, teks Ivory.
- Teks panjang selalu Cocoa di atas kaca terang, atau Ivory di atas kaca gelap.
- **Warna dari `colors.json`** (biru, ungu, tosca, dan seterusnya) hanya muncul sebagai **swatch dan foto pakaian**, di dalam bingkai netral. Antarmuka sendiri tetap earth tone, supaya data warna pengguna tidak bentrok dengan tampilan.

## 4. Efek Liquid Glass

### 4.1 Tiga tingkat kaca
| Tingkat | Dipakai untuk | Isi (di atas latar) | Blur | Teks |
|---|---|---|---|---|
| `glass-1` (bening) | Pil navigasi, kapsul informasi | Ivory 40% | 20 px | Cocoa, hanya label pendek dan ikon |
| `glass-2` (kartu) | Kartu besar, panel, formulir | Ivory **60%** | 24 px | Cocoa, boleh teks panjang |
| `glass-dark` | Panel hasil outfit, kartu sorotan | Cocoa **75%** | 20 px | Ivory |

**Mengapa 60% dan 75%:** uji kontras menunjukkan Cocoa di atas kaca Ivory 60% tetap ≥ 5 : 1 bahkan di atas latar karamel; Ivory di atas kaca Cocoa 75% ≥ 5,5 : 1 bahkan di atas latar terang. Nilai lebih rendah gagal di sebagian area. **Jangan menurunkan opasitas** pada panel yang berisi teks panjang.

### 4.2 Resep kaca
Setiap panel kaca terdiri dari:
1. Isi transparan (tabel di atas).
2. `backdrop-filter: blur(...) saturate(140%)`: efek "kaca berembun" yang membuat latar buram namun tetap berwarna.
3. Garis tepi 1 px `--line` (putih transparan).
4. Kilau dalam tipis di tepi atas (`inset 0 1px 0 rgba(255,255,255,0.5)`).
5. Bayangan lembut hangat (`0 12px 40px rgba(68,45,28,0.18)`), **bukan** hitam.

### 4.3 Latar ("Dune")
Kaca hanya terlihat bagus jika ada sesuatu di belakangnya. Latar dibuat **murni CSS**, tanpa gambar:
- Dasar gradasi vertikal: Ivory/Batter di atas menuju Caramel di tengah lalu Cocoa di bawah (suasana senja gurun seperti referensi).
- 3 sampai 4 **gelembung bundar buram** (lingkaran besar, blur tinggi) warna Olive, Caramel, dan Batter yang melayang pelan, sebagai pengganti gelembung bening di referensi.
- Lapisan butiran halus (*grain*) opasitas 4-6% agar tidak terlihat datar (opsional).
- Latar `position: fixed` agar tidak ikut bergulir dan kaca selalu punya sesuatu di belakangnya.

### 4.4 Aturan performa dan cadangan
- Maksimal **tiga lapis kaca** terlihat sekaligus. Kaca di dalam kaca di dalam kaca berat dan keruh.
- **Item dalam grid** (kartu pakaian) tidak memakai blur; cukup isi transparan dan garis tepi, agar scroll tetap mulus di ponsel.
- Blur di ponsel dibatasi **16 px** (desktop 24 px).
- **Cadangan:** jika browser tidak mendukung `backdrop-filter` (`@supports not`) atau pengguna memilih transparansi dikurangi (`prefers-reduced-transparency`), semua kaca berubah menjadi **warna solid** (Ivory 92% atau Cocoa 92%). Tampilan harus tetap terbaca penuh.

## 5. Tipografi

| Peran | Font | Gaya |
|---|---|---|
| Judul dan wordmark | **Instrument Serif** | Reguler dan *italic*, huruf besar-kecil |
| Isi, tombol, formulir | **Manrope** | 400, 500, 600 |
| Label kecil | Manrope 600 | HURUF KAPITAL, jarak huruf 0,12 em, 12 px |

Dua font Google di atas dimuat lewat `next/font/google` (bawaan Next.js, tanpa library tambahan). Keduanya mendukung huruf **É**; periksa wordmark "AVÉRA" tampil benar sebelum lanjut.

**Skala (ponsel / desktop)**
| Level | Ukuran | Dipakai untuk |
|---|---|---|
| Display | 44 / 64 px | Wordmark, angka indeks besar ("01") |
| H1 | 32 / 44 px | Judul tab |
| H2 | 24 / 28 px | Judul kartu |
| Isi | 16 px, tinggi baris 1,5 | Teks umum |
| Kecil | 14 px | Keterangan |
| Label | 12 px kapital | Kategori, penanda |

**Gaya khas:** campur huruf tegak dan *italic* dalam satu judul, seperti pada referensi palet. Contoh: "Padu padan dari *lemarimu*". Isi tidak pernah di bawah 14 px.

## 6. Tata Letak, Jarak, Bentuk

- **Mobile-first**, desain mulai dari lebar 360 px. Lebar isi maksimal 1120 px di desktop, di tengah.
- **Kelipatan 8 px** untuk jarak: 8, 16, 24, 32, 48.
- **Sudut sangat bulat:** kartu besar 28 px, kartu kecil 20 px, input 16 px, tombol dan kapsul **penuh (pil)**.
- Margin tepi layar 16 px (ponsel) dan 32 px (desktop).
- Grid lemari: 2 kolom (ponsel), 3 kolom (tablet), 4 kolom (desktop).

## 7. Komponen

| Komponen | Spesifikasi |
|---|---|
| **Navigasi pil** | Kapsul `glass-1` melayang. Ponsel: di bawah, 16 px dari tepi, lima ikon + label kecil. Desktop: di atas, wordmark di kiri, lima tab di tengah. Tab aktif = pil dalam berwarna Cocoa 85% dengan teks Ivory. Tiap tab diberi nomor 01-05. |
| **Kartu** | `glass-2`, sudut 28 px, padding 20-24 px. Judul H2 serif, label kapital di atasnya. |
| **Tombol utama** | Pil, latar Spiced Wine, teks Ivory 600, tinggi 48 px. Hover: sedikit lebih terang dan naik 1-2 px. |
| **Tombol sekunder** | Pil `glass-1` dengan garis tepi, teks Cocoa. |
| **Tombol bundar panah** | Lingkaran 48 px berisi ikon panah ↗ (gaya referensi), untuk aksi lanjut seperti "Buat ide outfit". |
| **Input dan pilihan** | Latar Ivory 70%, garis tepi Caramel 40%, sudut 16 px, label di atas (bukan hanya *placeholder*). |
| **Chip pilihan** (zodiak, undertone, kategori) | Pil kecil. Terpilih = isi Cocoa teks Ivory. Tidak terpilih = kaca terang. |
| **Swatch warna** | Lingkaran 32 px dengan garis tepi Ivory 2 px dan bayangan tipis, nama warna di bawahnya. Penanda "sudah punya": titik centang kecil Olive Deep. |
| **Kartu item pakaian** | Kotak persegi sudut 20 px. Foto memenuhi kotak; tanpa foto = blok warna item + ikon kategori. Nama dan titik warna di kapsul bawah. Menu ubah/hapus di ikon ⋯. |
| **Kartu hasil outfit** | `glass-dark`, berisi papan outfit 2D, alasan, catatan palet, dan tombol Simpan / Coba ide lain. |
| **Dialog konfirmasi** | `glass-2` di tengah, latar belakang diredupkan. Tombol hapus pakai Danger. |
| **Toast** | Kapsul kecil `glass-dark` di atas navigasi, hilang otomatis 3 detik. |
| **Keadaan kosong** | Ilustrasi garis sederhana (gantungan baju), satu kalimat ajakan, satu tombol. |
| **Loading AI** | Papan outfit berkilau (*shimmer*) di dalam kaca + teks "AVÉRA sedang memadukan…". |

## 8. Tampilan Tiap Tab

Setiap tab dibuka dengan **angka indeks besar** (Display serif) dan judul, seperti "01" pada referensi.

### 01 · Lemari
- Header: angka, judul "Lemari", jumlah item (misalnya "12 dari 40 item").
- Filter kategori berupa chip horizontal: Semua, Atasan, Bawahan, Hijab, Sepatu, Aksesoris.
- Grid kartu item; kartu pertama adalah kartu "Tambah" bergaris putus.
- Form tambah/ubah muncul sebagai panel kaca (ponsel: dari bawah; desktop: dialog). Isian: nama, kategori, (sub-jenis jika aksesoris), pilihan warna berupa swatch dari `basicColors`, foto opsional, catatan.
- Lemari kosong: kartu ajakan dengan dua tombol, "Tambah pakaian" dan "Pakai data contoh".

### 02 · Profil
- Dua kartu: **Zodiak** (grid 12 chip, tanggal sebagai teks kecil) dan **Undertone** (tiga kartu besar warm/cool/neutral, masing-masing menampilkan 5 swatch contoh dan teks `hint`).
- Bantuan "Cara mengetahui undertone" sebagai bagian yang bisa dibuka-tutup.
- Catatan kecil di bawah: "Panduan gaya yang bersifat hiburan, bukan klaim ilmiah."

### 03 · Ide Outfit (layar utama)
- Atas: pilihan mode (Zodiak / Undertone / Kombinasi) sebagai tiga chip besar. Mode yang datanya belum diisi tampil redup dengan keterangan, bukan disembunyikan.
- Tengah: kartu hasil `glass-dark`. **Papan outfit 2D** di sebelah kiri/atas, daftar item dan teks alasan di sisi lain (ponsel: bertumpuk).
- Di bawah papan: baris swatch palet yang dipakai dan "Catatan palet".
- Aksi: tombol utama **Simpan outfit**, tombol sekunder **Coba ide lain**; tombol bundar panah **Buat ide outfit** pada keadaan awal.
- Keadaan awal (belum ada hasil): papan menampilkan siluet kosong dan ajakan.
- Galat: kartu kaca dengan pesan ramah dan tombol Coba lagi (teks di bagian 13).

### 04 · Palet
- Mengikuti mode: kelompok "Warna zodiak", "Warna undertone" (atau keduanya), lalu kelompok **"Tambahan Styling"**.
- Setiap swatch besar menampilkan nama, hex kecil, dan penanda "Sudah kamu punya" atau "Belum punya".
- Tidak ada teks panjang; halaman ini harus terbaca dalam satu layar gulir pendek.

### 05 · Tersimpan
- Grid kartu `glass-2`: papan mini, tanggal, mode (chip kecil), satu baris alasan terpotong.
- Ketuk kartu untuk membuka rinci; ikon sampah dengan dialog konfirmasi.
- Item yang sudah dihapus dari lemari tampil redup dengan label "Item sudah dihapus".
- Kosong: ajakan menuju tab Ide Outfit.

### Beranda / pengantar
Karena web satu halaman, pengantar tampil **di atas tab saat lemari masih kosong**: wordmark AVÉRA, satu kalimat nilai jual, dua tombol (Mulai isi lemari / Pakai data contoh). Setelah lemari terisi, pengantar mengecil menjadi header ringkas.

## 9. Papan Outfit 2D

**Siluet:** manekin abstrak, tanpa fitur wajah, rambut, atau lekuk tubuh yang khas gender. Garis tipis Cocoa 30% dan isi kaca putih transparan. Satu bentuk dasar untuk semua pengguna.

**Wadah:** persegi panjang berbanding 1 : 2 di dalam kartu, dengan lingkaran buram Olive/Batter di belakang figur (menggantikan gelembung referensi).

**Zona (posisi dalam persen dari wadah)**
| Item | Posisi tengah (x, y) | Ukuran perkiraan (lebar × tinggi) |
|---|---|---|
| Hijab (kepala) | 50%, 10% | 30% × 17% |
| Kalung | 50%, 23% | 18% × 5% |
| Atasan | 50%, 36% | 58% × 30% |
| Jam (pergelangan kiri) | 15%, 50% | 9% × 9% |
| Cincin (tangan kanan) | 85%, 52% | 6% × 6% |
| Bawahan | 50%, 66% | 44% × 32% |
| Sepatu | 50%, 94% | 44% × 8% (dua bentuk) |

**Urutan tumpukan (bawah ke atas):** siluet, bawahan, atasan, hijab, sepatu, aksesoris.

**Cara menggambar item**
- Item **berfoto:** foto berbentuk persegi panjang sudut 12 px pada zonanya.
- Item **tanpa foto:** bentuk sederhana berwarna item: atasan = trapesium dengan lengan, bawahan = dua kaki, hijab = bentuk tetesan menutupi kepala, sepatu = dua kapsul, aksesoris = lingkaran kecil.
- Tanpa hijab, kepala berupa oval polos.
- Tiap item diberi garis tepi tipis Ivory agar terpisah dari yang lain.
- Papan harus terbaca pada lebar 280 px.

## 10. Ikon dan Ilustrasi
- Gaya **garis tipis (stroke 1,5 px), sudut membulat, geometris**, warna Cocoa atau Ivory.
- Ikon yang dibutuhkan: Lemari, Profil, Ide Outfit (kilau), Palet, Tersimpan (penanda), serta atasan, bawahan, hijab, sepatu, aksesoris, tambah, hapus, ubah, centang, panah ↗, tutup.
- Tidak memakai emoji pada antarmuka. Simbol zodiak boleh sebagai teks kecil bila perlu.
- Tidak ada foto stok. Satu-satunya gambar adalah foto pakaian yang diunggah pengguna.

## 11. Gerak
- **Pindah tab:** pudar silang 200 ms.
- **Kartu muncul:** naik 8 px sambil memudar, 250 ms, berurutan jarak 40 ms (maksimal 6 kartu).
- **Gelembung latar:** melayang sangat pelan (siklus 12-20 detik), perubahan kecil.
- **Hover/tekan:** naik 1-2 px; tekan = mengecil 98%.
- **Loading AI:** kilau berjalan di papan.
- Semua gerak dimatikan atau dikurangi jika pengguna memakai `prefers-reduced-motion`.

## 12. Responsif dan Aksesibilitas
- Titik pecah: 640 px (tablet) dan 1024 px (desktop).
- Area sentuh minimal 44 × 44 px.
- Cincin fokus terlihat jelas: **Cocoa 2 px dengan jarak 2 px** pada latar terang, **Ivory 2 px** pada latar gelap (Caramel tidak dipakai di latar gelap, kontrasnya hanya 2,1).
- Informasi tidak hanya lewat warna: swatch selalu disertai nama, status "sudah punya" memakai teks, bukan hanya warna.
- Semua tombol ikon punya `aria-label`; foto punya `alt` dari nama item.
- Dukung navigasi keyboard di tab, dialog, dan chip.
- Uji tampilan pada lebar 360, 390, 768, dan 1280 px.

## 13. Teks Antarmuka (Bahasa Indonesia)

**Nada:** ramah, singkat, memakai "kamu", tidak menggurui, tidak memakai sapaan atau kata yang berkesan khusus pria atau wanita.

| Tempat | Teks |
|---|---|
| Tagline | Padu padan dari lemarimu. |
| Pengantar | Catat isi lemarimu, dapatkan ide outfit hari ini yang cocok dengan gayamu. |
| Tab | Lemari · Profil · Ide Outfit · Palet · Tersimpan |
| Tombol | Tambah pakaian · Pakai data contoh · Buat ide outfit · Coba ide lain · Simpan outfit · Hapus |
| Lemari kosong | Lemarimu masih kosong. Tambah beberapa pakaian untuk mulai. |
| Mode terkunci | Isi zodiak dan undertone di tab Profil untuk memakai mode ini. |
| Lemari kurang | Tambahkan setidaknya satu atasan dan satu bawahan agar AVÉRA bisa memadukan. |
| Loading | AVÉRA sedang memadukan outfitmu… |
| Galat AI | Ide outfit belum bisa dibuat saat ini. Palet warnamu tetap bisa dilihat. Coba lagi sebentar lagi. |
| Kuota habis | Batas ide outfit hari ini sudah tercapai. Coba lagi besok. |
| Penyimpanan penuh | Lemari sudah mencapai 40 item. Hapus satu untuk menambah yang baru. |
| Disclaimer | Zodiak dan undertone dipakai sebagai panduan gaya yang bersifat hiburan, bukan klaim ilmiah. |
| Privasi | Datamu tersimpan di browser ini saja. |
| Sudah/belum punya | Sudah kamu punya · Belum punya |
| Item terhapus | Item sudah dihapus |

## 14. Checklist Netral Gender
- [ ] Tidak ada pink, biru muda, atau ungu sebagai warna antarmuka.
- [ ] Siluet tanpa fitur gender; satu bentuk untuk semua.
- [ ] Kategori Hijab setara dengan kategori lain, bukan "tambahan khusus".
- [ ] Teks tidak memakai sapaan atau contoh yang berkesan satu gender saja; data contoh mencakup pakaian berbagai gaya.
- [ ] Ikon geometris, tanpa ornamen bunga atau motif yang gender-spesifik.
- [ ] Foto atau ilustrasi tidak menampilkan model tertentu.

## 15. Implementasi

### 15.1 Token CSS (letakkan di `app/globals.css`)
```css
:root {
  /* palet inti */
  --batter: #E8D1A7;
  --caramel: #84592B;
  --wine: #743014;
  --olive: #9D9167;
  --cocoa: #442D1C;
  /* turunan */
  --ivory: #F8F1E3;
  --olive-deep: #5F5A3A;
  --danger: #A23B22;
  --line: rgba(255, 255, 255, 0.35);
  /* kaca */
  --glass-1: rgba(248, 241, 227, 0.40);
  --glass-2: rgba(248, 241, 227, 0.60);
  --glass-dark: rgba(68, 45, 28, 0.75);
  --blur: 24px;
}
@media (max-width: 640px) { :root { --blur: 16px; } }

.glass {
  background: var(--glass-2);
  backdrop-filter: blur(var(--blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(140%);
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 12px 40px rgba(68,45,28,0.18);
}
.glass-dark { background: var(--glass-dark); color: var(--ivory); }

/* cadangan: tanpa kaca */
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: rgba(248, 241, 227, 0.92); }
  .glass-dark { background: rgba(68, 45, 28, 0.92); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: rgba(248, 241, 227, 0.92); backdrop-filter: none; }
  .glass-dark { background: rgba(68, 45, 28, 0.92); }
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
Tailwind: daftarkan token warna di konfigurasi (`batter`, `caramel`, `wine`, `olive`, `cocoa`, `ivory`) agar bisa dipakai sebagai kelas (`bg-wine`, `text-cocoa`).

### 15.2 Urutan pengerjaan visual
1. Token warna, font, dan latar "Dune" (cek visual: latar sudah terasa senja dan hangat).
2. Kelas `.glass` dan komponen dasar: kartu, tombol, chip, navigasi pil.
3. Tab Lemari (paling banyak komponen), lalu Profil.
4. Papan outfit 2D dan kartu hasil.
5. Tab Palet dan Tersimpan.
6. Poles: gerak, keadaan kosong/loading/galat, uji perangkat.

### 15.3 QA visual sebelum demo
- [ ] Teks di semua panel terbaca jelas, termasuk saat latar bergerak.
- [ ] Panel kaca berubah solid dengan benar jika `backdrop-filter` dimatikan (uji di DevTools).
- [ ] Wordmark menampilkan "AVÉRA" dengan É yang benar.
- [ ] Tidak lebih dari tiga lapis kaca di satu layar; scroll grid lemari mulus di ponsel.
- [ ] Papan outfit tampil benar dengan dan tanpa hijab, dengan foto dan tanpa foto.
- [ ] Semua bagian lolos checklist netral gender (bagian 14).
- [ ] Tidak ada gambar atau merek dari referensi di dalam web.

## 16. Keputusan Kecil yang Mempengaruhi PRD

Dokumen ini menambah dua hal pada struktur di `prd.md` bagian 12:
1. **Ikon:** gunakan library `lucide-react` (ikon garis geometris, sesuai bagian 10). Ini menjadi library kedua setelah `@google/genai`; alternatifnya menggambar ikon SVG sendiri, tetapi lebih lama.
2. **Teks UI:** kumpulkan teks bagian 13 di satu berkas `lib/copy.ts` (sesuai PRD bagian 11 "teks UI dikumpulkan di satu tempat").

Jika disetujui, perbarui daftar file di PRD: tambahkan `lib/copy.ts`, dan ubah kalimat "hanya satu library tambahan" menjadi dua.

## 17. Pertanyaan Terbuka
1. Setuju memakai `lucide-react`, atau lebih suka ikon buatan sendiri?
2. Wordmark AVÉRA cukup berupa teks (Instrument Serif), atau perlu logo/monogram sederhana?
3. Apakah latar "Dune" berupa gradasi CSS sudah cukup, atau ingin satu gambar latar (misalnya foto tekstur pasir) di versi akhir?
4. Perlu mode gelap penuh? Rekomendasi: **tidak** untuk MVP; satu tema terang-hangat sudah cukup untuk demo.

## 18. Dokumen Terkait
- `prd.md`: kebutuhan produk, alur, kontrak AI.
- `data/colors.json`: data warna zodiak, undertone, netral, dan warna dasar.
- `agent.md`: aturan proyek untuk asisten AI di IDE (dibuat berikutnya).
