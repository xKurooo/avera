// Semua akses localStorage ada di berkas ini saja (aturan AGENTS.md).
// localStorage = "laci kecil" di browser, kapasitasnya sekitar 5 MB.
// Fungsi di sini hanya boleh dipanggil di sisi browser (misalnya di dalam useEffect),
// karena saat halaman dirakit di server, localStorage belum ada.

import { ACCESSORY_TYPES, CATEGORIES, ZODIAC_IDS } from "./types";
import type { DailyQuota, Mode, SavedOutfit, StyleProfile, WardrobeItem } from "./types";

export const STORAGE_KEYS = {
  wardrobe: "avera.wardrobe",
  profile: "avera.profile",
  outfits: "avera.outfits",
  quota: "avera.quota",
} as const;

// Batas 40 item agar localStorage tidak penuh (prd.md F1).
export const MAX_ITEMS = 40;

// Batas maksimal 10 permintaan AI per hari per browser (prd.md F3).
export const MAX_DAILY_REQUESTS = 10;

// Ukuran foto setelah dikompres (prd.md F1).
const PHOTO_MAX_SIDE = 600;
const PHOTO_QUALITY = 0.6;

// Hasil menyimpan: berhasil, atau gagal dengan alasan yang bisa diterjemahkan ke pesan ramah.
export type SaveResult = { ok: true } | { ok: false; reason: "full" | "unavailable" };

function writeRaw(key: string, value: unknown): SaveResult {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    // QuotaExceededError berarti laci browser penuh; selain itu anggap penyimpanan tidak tersedia.
    const isFull = err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
    return { ok: false, reason: isFull ? "full" : "unavailable" };
  }
}

function readRaw(key: string): unknown {
  try {
    const text = localStorage.getItem(key);
    return text ? (JSON.parse(text) as unknown) : null;
  } catch {
    // Data rusak atau penyimpanan diblokir: anggap kosong supaya aplikasi tetap jalan.
    return null;
  }
}

// Mengecek bahwa data lama benar-benar berbentuk item lemari, supaya data rusak tidak membuat error.
function isWardrobeItem(value: unknown): value is WardrobeItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.category === "string" &&
    (CATEGORIES as string[]).includes(v.category) &&
    (v.accessoryType === undefined ||
      (typeof v.accessoryType === "string" && (ACCESSORY_TYPES as string[]).includes(v.accessoryType))) &&
    typeof v.colorName === "string" &&
    typeof v.colorHex === "string" &&
    (v.note === undefined || typeof v.note === "string") &&
    (v.photo === undefined || typeof v.photo === "string") &&
    typeof v.createdAt === "number"
  );
}

// ---------- Lemari ----------

export function loadWardrobe(): { items: WardrobeItem[]; skipped: boolean } {
  const raw = readRaw(STORAGE_KEYS.wardrobe);
  if (!Array.isArray(raw)) return { items: [], skipped: false };
  const items = raw.filter(isWardrobeItem).slice(0, MAX_ITEMS);
  return { items, skipped: items.length !== raw.length };
}

export function saveWardrobe(items: WardrobeItem[]): SaveResult {
  return writeRaw(STORAGE_KEYS.wardrobe, items.slice(0, MAX_ITEMS));
}

// ---------- Profil ----------

export function loadProfile(): StyleProfile {
  const raw = readRaw(STORAGE_KEYS.profile);
  if (typeof raw !== "object" || raw === null) return {};
  const v = raw as Record<string, unknown>;
  const profile: StyleProfile = {};
  const zodiac = ZODIAC_IDS.find((z) => z === v.zodiac);
  if (zodiac) profile.zodiac = zodiac;
  if (v.undertone === "warm" || v.undertone === "cool" || v.undertone === "neutral") {
    profile.undertone = v.undertone;
  }
  return profile;
}

export function saveProfile(profile: StyleProfile): SaveResult {
  return writeRaw(STORAGE_KEYS.profile, profile);
}

// ---------- Outfit Tersimpan ----------

const VALID_MODES: Mode[] = ["zodiak", "undertone", "kombinasi"];

function isSavedOutfit(value: unknown): value is SavedOutfit {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    typeof v.createdAt !== "number" ||
    typeof v.mode !== "string" ||
    !(VALID_MODES as string[]).includes(v.mode) ||
    typeof v.profileSnapshot !== "object" ||
    v.profileSnapshot === null ||
    !Array.isArray(v.items) ||
    typeof v.reason !== "string" ||
    typeof v.paletteNote !== "string"
  ) {
    return false;
  }
  return v.items.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.itemId !== "string" || typeof e.snapshot !== "object" || e.snapshot === null) {
      return false;
    }
    const s = e.snapshot as Record<string, unknown>;
    return (
      typeof s.name === "string" &&
      typeof s.category === "string" &&
      (CATEGORIES as string[]).includes(s.category) &&
      (s.accessoryType === undefined ||
        (typeof s.accessoryType === "string" &&
          (ACCESSORY_TYPES as string[]).includes(s.accessoryType))) &&
      typeof s.colorName === "string" &&
      typeof s.colorHex === "string"
    );
  });
}

export function loadOutfits(): SavedOutfit[] {
  const raw = readRaw(STORAGE_KEYS.outfits);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isSavedOutfit);
}

export function saveOutfits(outfits: SavedOutfit[]): SaveResult {
  return writeRaw(STORAGE_KEYS.outfits, outfits);
}

// ---------- Kuota Harian AI ----------

function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadDailyQuota(): DailyQuota {
  const today = todayKey();
  const raw = readRaw(STORAGE_KEYS.quota);
  if (typeof raw !== "object" || raw === null) return { date: today, count: 0 };
  const v = raw as Record<string, unknown>;
  if (v.date !== today || typeof v.count !== "number" || v.count < 0) {
    return { date: today, count: 0 };
  }
  return { date: today, count: Math.min(MAX_DAILY_REQUESTS, Math.floor(v.count)) };
}

export function incrementDailyQuota(): DailyQuota {
  const current = loadDailyQuota();
  const next: DailyQuota = {
    date: current.date,
    count: Math.min(MAX_DAILY_REQUESTS, current.count + 1),
  };
  writeRaw(STORAGE_KEYS.quota, next);
  return next;
}

// ---------- Bantuan ----------

// Membuat id unik. crypto.randomUUID hanya ada di koneksi aman (https/localhost),
// jadi disiapkan cadangan agar tetap jalan saat dicoba lewat jaringan lokal.
export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Mengecilkan foto di browser sebelum disimpan, supaya muat di localStorage.
// Hasilnya berupa teks (data URL) JPEG dengan sisi terpanjang maksimal 600 px.
export async function compressPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("NOT_IMAGE");

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("NO_CANVAS");

    // JPEG tidak mendukung transparan; latar putih mencegah bagian transparan menjadi hitam.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", PHOTO_QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("LOAD_FAILED"));
    img.src = src;
  });
}
