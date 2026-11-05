// Data contoh untuk mencoba AVÉRA tanpa mengisi lemari sendiri.
// Kode warna tidak ditulis di sini; diambil dari colors.json (basicColors) berdasarkan nama.

import colors from "./colors.json";
import { newId } from "@/lib/storage";
import type { AccessoryType, Category, WardrobeItem } from "@/lib/types";

interface SampleEntry {
  name: string;
  category: Category;
  accessoryType?: AccessoryType;
  colorName: string;
  note?: string;
}

// Gaya beragam dan netral gender, termasuk hijab dan aksesoris (design.md bagian 14).
const SAMPLE: SampleEntry[] = [
  { name: "Kemeja linen krem", category: "atasan", colorName: "Krem", note: "oversize" },
  { name: "Kaus polos putih", category: "atasan", colorName: "Putih", note: "potongan regular" },
  { name: "Kemeja flanel marun", category: "atasan", colorName: "Marun", note: "lengan panjang" },
  { name: "Celana bahan hitam", category: "bawahan", colorName: "Hitam", note: "potongan lurus" },
  { name: "Celana kulot cokelat", category: "bawahan", colorName: "Cokelat", note: "kulot longgar" },
  { name: "Jeans biru", category: "bawahan", colorName: "Biru", note: "straight fit" },
  { name: "Pashmina krem", category: "hijab", colorName: "Krem", note: "pashmina ceruti" },
  { name: "Hijab segi empat hijau", category: "hijab", colorName: "Hijau", note: "voal" },
  { name: "Sneakers putih", category: "sepatu", colorName: "Putih", note: "kanvas" },
  { name: "Loafers cokelat", category: "sepatu", colorName: "Cokelat", note: "kulit sintetis" },
  { name: "Jam tangan perak", category: "aksesoris", accessoryType: "jam", colorName: "Perak" },
  { name: "Kalung emas tipis", category: "aksesoris", accessoryType: "kalung", colorName: "Emas" },
];

export function buildSampleWardrobe(): WardrobeItem[] {
  const now = Date.now();
  return SAMPLE.flatMap((entry, index) => {
    const color = colors.basicColors.find((c) => c.name === entry.colorName);
    // Jika nama warna tidak ditemukan (salah ketik), item dilewati agar tidak merusak tampilan.
    if (!color) return [];
    return [
      {
        id: newId(),
        name: entry.name,
        category: entry.category,
        accessoryType: entry.accessoryType,
        colorName: color.name,
        colorHex: color.hex,
        note: entry.note,
        createdAt: now + index,
      },
    ];
  });
}
