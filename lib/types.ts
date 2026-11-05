// Tipe data AVÉRA, mengikuti prd.md bagian 7.
// Semua data ini disimpan di browser (localStorage), bukan di server.

export type Category = "atasan" | "bawahan" | "hijab" | "sepatu" | "aksesoris";
export type AccessoryType = "jam" | "cincin" | "kalung" | "lainnya";
export type Undertone = "warm" | "cool" | "neutral";
export type ZodiacId =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";
export type Mode = "zodiak" | "undertone" | "kombinasi";

export interface WardrobeItem {
  id: string; // uuid
  name: string;
  category: Category;
  accessoryType?: AccessoryType;
  colorName: string; // dari basicColors, contoh: "Biru"
  colorHex: string; // diambil dari colors.json
  note?: string; // contoh: "kemeja oversize"
  photo?: string; // data URL hasil kompres (opsional)
  createdAt: number;
}

export interface StyleProfile {
  zodiac?: ZodiacId;
  undertone?: Undertone;
}

export interface SavedOutfit {
  id: string;
  createdAt: number;
  mode: Mode;
  profileSnapshot: StyleProfile;
  items: {
    itemId: string;
    snapshot: Pick<
      WardrobeItem,
      "name" | "category" | "accessoryType" | "colorName" | "colorHex"
    >;
  }[];
  reason: string;
  paletteNote: string;
}

// Satu warna di colors.json.
export interface ColorEntry {
  name: string;
  hex: string;
}

// Warna palet beserta asalnya (prd.md bagian 8.1 dan 9.5).
export interface PaletteColor extends ColorEntry {
  source: "zodiac" | "undertone" | "neutral";
}

// ---------- Kontrak AI (prd.md bagian 8.1) ----------

// Item lemari yang dikirim ke AI: tanpa foto dan tanpa waktu pembuatan.
export interface OutfitRequestItem {
  id: string;
  name: string;
  category: Category;
  accessoryType?: AccessoryType;
  colorName: string;
  colorHex: string;
  note?: string;
}

export interface OutfitRequestBody {
  mode: Mode;
  profile: StyleProfile;
  palette: PaletteColor[];
  wardrobe: OutfitRequestItem[];
  previousOutfits?: string[][];
}

export interface GeneratedOutfit {
  itemIds: string[];
  reason: string;
  paletteNote: string;
}

export type OutfitErrorCode =
  | "BAD_REQUEST"
  | "WARDROBE_TOO_SMALL"
  | "AI_UNAVAILABLE"
  | "AI_INVALID_OUTPUT"
  | "RATE_LIMITED";

export interface OutfitErrorResponse {
  error: {
    code: OutfitErrorCode;
    message: string;
  };
}

export interface OutfitSuccessResponse {
  outfit: GeneratedOutfit;
}

// Penghitung kuota harian di browser (maksimal 10 permintaan per hari).
export interface DailyQuota {
  date: string; // YYYY-MM-DD waktu lokal
  count: number;
}

// Daftar kategori dan sub-jenis, dipakai untuk filter dan form.
export const CATEGORIES: Category[] = ["atasan", "bawahan", "hijab", "sepatu", "aksesoris"];
export const ACCESSORY_TYPES: AccessoryType[] = ["jam", "cincin", "kalung", "lainnya"];
export const ZODIAC_IDS: ZodiacId[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

// Tab di halaman utama.
export type TabId = "lemari" | "profil" | "ide" | "palet" | "tersimpan";
