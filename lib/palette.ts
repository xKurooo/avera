// Merakit palet warna dari colors.json sesuai profil dan mode (prd.md bagian 9.5),
// mengecek apakah pengguna sudah punya pakaian berwarna mirip (prd.md F4),
// serta menerjemahkan titik warna dari spektrum ke nama warna fashion terdekat.
// Semua berjalan di browser tanpa AI dan tanpa internet.

import colors from "@/data/colors.json";
import type { ColorEntry, Mode, PaletteColor, StyleProfile, WardrobeItem } from "./types";

export const zodiacList = colors.zodiac;
export const undertoneList = colors.undertone;
export const neutralColors = colors.neutrals;
export const basicColors = colors.basicColors;

// Kamus seluruh warna bernama di colors.json (basicColors + zodiak + undertone + netral)
// agar ketika pengguna memilih warna dari spektrum, namanya otomatis terdeteksi secara kaya
// (misalnya "Hijau Sage", "Terakota", "Mustard", "Navy", "Taupe").
export const allNamedColors: ColorEntry[] = (() => {
  const map = new Map<string, ColorEntry>();
  const add = (entry: ColorEntry) => {
    const key = entry.hex.toUpperCase();
    if (!map.has(key)) map.set(key, { name: entry.name, hex: key });
  };
  colors.basicColors.forEach(add);
  colors.neutrals.forEach(add);
  colors.zodiac.forEach((z) => z.colors.forEach(add));
  colors.undertone.forEach((u) => u.colors.forEach(add));
  return Array.from(map.values());
})();

export function findZodiac(id: StyleProfile["zodiac"]) {
  return colors.zodiac.find((z) => z.id === id);
}

export function findUndertone(id: StyleProfile["undertone"]) {
  return colors.undertone.find((u) => u.id === id);
}

// Mode hanya bisa dipakai jika datanya sudah diisi (prd.md F2).
export function availableModes(profile: StyleProfile): Record<Mode, boolean> {
  const hasZodiac = Boolean(findZodiac(profile.zodiac));
  const hasUndertone = Boolean(findUndertone(profile.undertone));
  return {
    zodiak: hasZodiac,
    undertone: hasUndertone,
    kombinasi: hasZodiac && hasUndertone,
  };
}

// Memilih mode yang dipakai: pilihan pengguna jika masih bisa, jika tidak pilih yang paling lengkap.
export function resolveMode(preferred: Mode | null, profile: StyleProfile): Mode | null {
  const available = availableModes(profile);
  if (preferred && available[preferred]) return preferred;
  if (available.kombinasi) return "kombinasi";
  if (available.zodiak) return "zodiak";
  if (available.undertone) return "undertone";
  return null;
}

// Palet utama sesuai mode: 2 warna zodiak, 5 warna undertone, atau keduanya.
export function buildPalette(mode: Mode, profile: StyleProfile): PaletteColor[] {
  const result: PaletteColor[] = [];
  if (mode === "zodiak" || mode === "kombinasi") {
    const zodiac = findZodiac(profile.zodiac);
    zodiac?.colors.forEach((c) => result.push({ ...c, source: "zodiac" }));
  }
  if (mode === "undertone" || mode === "kombinasi") {
    const undertone = findUndertone(profile.undertone);
    undertone?.colors.forEach((c) => result.push({ ...c, source: "undertone" }));
  }
  return result;
}

// Warna netral "Tambahan Styling" sebagai penyeimbang.
export function buildNeutrals(): PaletteColor[] {
  return colors.neutrals.map((c) => ({ ...c, source: "neutral" }));
}

// ---------- Hitungan warna & konversi spektrum ----------

export function hexToRgb(hex: string): [number, number, number] | null {
  const value = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

// Jarak antara dua warna: makin kecil makin mirip (0 = sama persis, maksimal sekitar 441).
export function colorDistance(a: string, b: string): number {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  if (!x || !y) return Infinity;
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

// Mencari nama warna fashion terdekat di colors.json untuk sembarang kode hex dari spektrum.
export function nearestColorName(hex: string): string {
  let best = allNamedColors[0]?.name ?? "Krem";
  let bestDist = Infinity;
  for (const entry of allNamedColors) {
    const d = colorDistance(hex, entry.hex);
    if (d < bestDist) {
      bestDist = d;
      best = entry.name;
    }
  }
  return best;
}

// Batas "mirip". Angka 55 dipilih agar warna yang berdekatan di spektrum tetap terdeteksi serasi.
const SIMILAR_THRESHOLD = 55;

export function ownsSimilarColor(hex: string, items: WardrobeItem[]): boolean {
  return items.some((item) => colorDistance(hex, item.colorHex) <= SIMILAR_THRESHOLD);
}

// Menentukan apakah teks/ikon di atas warna ini sebaiknya gelap (true) atau terang (false).
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2] > 150;
}
