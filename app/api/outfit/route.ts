// Satu-satunya kode server di AVÉRA (prd.md bagian 8).
// Tugasnya: memvalidasi daftar pakaian dari browser, meminta Gemini memilih satu kombinasi outfit,
// lalu memastikan setiap item yang dipilih benar-benar ada di lemari pengguna.

import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import colors from "@/data/colors.json";
import { copy } from "@/lib/copy";
import { MAX_ITEMS } from "@/lib/storage";
import { ACCESSORY_TYPES, CATEGORIES, ZODIAC_IDS } from "@/lib/types";
import type {
  Category,
  GeneratedOutfit,
  Mode,
  OutfitErrorCode,
  OutfitErrorResponse,
  OutfitRequestBody,
  OutfitRequestItem,
  OutfitSuccessResponse,
  PaletteColor,
  StyleProfile,
} from "@/lib/types";

const MAX_BODY_BYTES = 64 * 1024;
const AI_TIMEOUT_MS = 20_000;
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = [
  "Kamu adalah penata gaya pribadi AVÉRA yang ramah, ringkas, dan berbahasa Indonesia (gunakan sapaan 'kamu').",
  "Tugasmu memilih SATU kombinasi outfit harian dari daftar pakaian lemari yang dikirim.",
  "ATURAN WAJIB:",
  "1. Hanya gunakan `id` yang persis ada di daftar `wardrobe`. Dilarang mengarang ID baru.",
  "2. Komposisi wajib memuat minimal 1 `atasan` dan 1 `bawahan`.",
  "3. Paling banyak 1 item untuk setiap kategori utama (`atasan`, `bawahan`, `hijab`, `sepatu`), dan maksimal 3 item `aksesoris`.",
  "4. Sertakan `hijab` jika ada di lemari dan serasi dengan atasan/bawahan.",
  "5. Pertimbangkan kecocokan model/potongan pakaian (lihat catatan `note`) serta keserasian warna.",
  "6. Gunakan minimal satu pakaian yang warnanya mendekati `palette` dari tiap sumber yang aktif (zodiak dan/atau undertone), serta gunakan warna netral sebagai penyeimbang. Jika tidak ada warna yang mendekati di lemari, tetap pilih kombinasi terbaik dan jelaskan dengan jujur di `paletteNote`.",
  "7. Zodiak dan undertone adalah panduan gaya yang bersifat hiburan, bukan klaim ilmiah.",
  "8. Hindari mengulang kombinasi yang sama persis dengan daftar `previousOutfits` bila masih ada pilihan lain.",
  "9. `reason` maksimal 2 kalimat singkat. `paletteNote` maksimal 2 kalimat singkat tentang kecocokan warna.",
].join("\n");

function errorJson(
  code: OutfitErrorCode,
  message: string,
  status: number,
): NextResponse<OutfitErrorResponse> {
  return NextResponse.json({ error: { code, message } }, { status });
}

// ---------- Validasi input dari klien ----------

function isValidMode(v: unknown): v is Mode {
  return v === "zodiak" || v === "undertone" || v === "kombinasi";
}

function isValidProfile(v: unknown): v is StyleProfile {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  const okZodiac =
    p.zodiac === undefined ||
    (typeof p.zodiac === "string" && (ZODIAC_IDS as string[]).includes(p.zodiac));
  const okUndertone =
    p.undertone === undefined ||
    p.undertone === "warm" ||
    p.undertone === "cool" ||
    p.undertone === "neutral";
  return okZodiac && okUndertone;
}

function isValidPaletteColor(v: unknown): v is PaletteColor {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    c.name.length > 0 &&
    c.name.length <= 40 &&
    typeof c.hex === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(c.hex) &&
    (c.source === "zodiac" || c.source === "undertone" || c.source === "neutral")
  );
}

function isValidWardrobeItem(v: unknown): v is OutfitRequestItem {
  if (typeof v !== "object" || v === null) return false;
  const item = v as Record<string, unknown>;
  // Pastikan foto tidak ikut dikirim ke server.
  if ("photo" in item && item.photo !== undefined) return false;
  return (
    typeof item.id === "string" &&
    item.id.length > 0 &&
    item.id.length <= 64 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    item.name.length <= 60 &&
    typeof item.category === "string" &&
    (CATEGORIES as string[]).includes(item.category) &&
    (item.accessoryType === undefined ||
      (typeof item.accessoryType === "string" &&
        (ACCESSORY_TYPES as string[]).includes(item.accessoryType))) &&
    typeof item.colorName === "string" &&
    item.colorName.length > 0 &&
    item.colorName.length <= 30 &&
    typeof item.colorHex === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(item.colorHex) &&
    (item.note === undefined || (typeof item.note === "string" && item.note.length <= 80))
  );
}

function parseRequestBody(raw: unknown): OutfitRequestBody | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  if (!isValidMode(b.mode)) return null;
  if (!isValidProfile(b.profile)) return null;
  if (!Array.isArray(b.palette) || b.palette.length > 20 || !b.palette.every(isValidPaletteColor)) {
    return null;
  }
  if (
    !Array.isArray(b.wardrobe) ||
    b.wardrobe.length === 0 ||
    b.wardrobe.length > MAX_ITEMS ||
    !b.wardrobe.every(isValidWardrobeItem)
  ) {
    return null;
  }

  let previousOutfits: string[][] | undefined;
  if (b.previousOutfits !== undefined) {
    if (!Array.isArray(b.previousOutfits) || b.previousOutfits.length > 10) return null;
    for (const prev of b.previousOutfits) {
      if (
        !Array.isArray(prev) ||
        prev.length > 10 ||
        !prev.every((id) => typeof id === "string" && id.length <= 64)
      ) {
        return null;
      }
    }
    previousOutfits = b.previousOutfits;
  }

  return {
    mode: b.mode,
    profile: b.profile,
    palette: b.palette,
    wardrobe: b.wardrobe,
    previousOutfits,
  };
}

// ---------- Validasi keluaran AI (prd.md 8.2 nomor 4 & 5) ----------

function validateOutfitOutput(
  candidate: unknown,
  wardrobe: OutfitRequestItem[],
): { ok: true; outfit: GeneratedOutfit } | { ok: false; issue: string } {
  if (typeof candidate !== "object" || candidate === null) {
    return { ok: false, issue: "Keluaran bukan objek JSON." };
  }
  const obj = candidate as Record<string, unknown>;
  const rawOutfit =
    typeof obj.outfit === "object" && obj.outfit !== null
      ? (obj.outfit as Record<string, unknown>)
      : obj;

  if (!Array.isArray(rawOutfit.itemIds) || rawOutfit.itemIds.length === 0) {
    return { ok: false, issue: "itemIds kosong atau bukan array." };
  }
  if (typeof rawOutfit.reason !== "string" || !rawOutfit.reason.trim()) {
    return { ok: false, issue: "reason kosong." };
  }
  if (typeof rawOutfit.paletteNote !== "string" || !rawOutfit.paletteNote.trim()) {
    return { ok: false, issue: "paletteNote kosong." };
  }

  const byId = new Map(wardrobe.map((item) => [item.id, item]));
  const uniqueIds = Array.from(
    new Set(rawOutfit.itemIds.filter((id): id is string => typeof id === "string")),
  );

  if (uniqueIds.length !== rawOutfit.itemIds.length) {
    return { ok: false, issue: "Ada itemId yang duplikat atau bukan teks." };
  }

  const counts: Record<Category, number> = {
    atasan: 0,
    bawahan: 0,
    hijab: 0,
    sepatu: 0,
    aksesoris: 0,
  };

  for (const id of uniqueIds) {
    const found = byId.get(id);
    if (!found) {
      return { ok: false, issue: `ID '${id}' tidak ditemukan di wardrobe.` };
    }
    counts[found.category] += 1;
  }

  if (counts.atasan < 1 || counts.bawahan < 1) {
    return { ok: false, issue: "Wajib memilih minimal 1 atasan dan 1 bawahan." };
  }
  if (counts.atasan > 1 || counts.bawahan > 1 || counts.hijab > 1 || counts.sepatu > 1) {
    return {
      ok: false,
      issue: "Kategori utama (atasan, bawahan, hijab, sepatu) maksimal masing-masing 1 item.",
    };
  }
  if (counts.aksesoris > 3) {
    return { ok: false, issue: "Aksesoris maksimal 3 item." };
  }

  return {
    ok: true,
    outfit: {
      itemIds: uniqueIds,
      reason: rawOutfit.reason.trim().slice(0, 320),
      paletteNote: rawOutfit.paletteNote.trim().slice(0, 320),
    },
  };
}

// ---------- Pemanggilan Gemini ----------

function buildPrompt(body: OutfitRequestBody, retryIssue?: string): string {
  const payload = {
    mode: body.mode,
    profile: body.profile,
    palette: body.palette,
    neutrals: colors.neutrals,
    wardrobe: body.wardrobe,
    previousOutfits: body.previousOutfits ?? [],
  };

  const base = `Susun satu ide outfit dari data JSON berikut:\n${JSON.stringify(payload)}`;
  if (!retryIssue) return base;
  return `${base}\n\nPERBAIKAN WAJIB: Jawaban sebelumnya tidak valid karena: ${retryIssue} Pastikan hanya memakai id dari daftar wardrobe dan memenuhi aturan komposisi.`;
}

async function requestGeminiOutfit(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
): Promise<unknown> {
  // Sesuai prd.md 8.2 nomor 8: jangan mengirim temperature, top_p, atau top_k.
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["itemIds", "reason", "paletteNote"],
        properties: {
          itemIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Daftar ID item dari lemari yang dipilih.",
          },
          reason: {
            type: Type.STRING,
            description: "Alasan padu padan maksimal 2 kalimat berbahasa Indonesia.",
          },
          paletteNote: {
            type: Type.STRING,
            description: "Catatan kecocokan warna dengan palet maksimal 2 kalimat.",
          },
        },
      },
      abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
    },
  });

  const text = response.text;
  if (!text) throw new Error("EMPTY_AI_RESPONSE");
  return JSON.parse(text) as unknown;
}

export async function POST(
  request: Request,
): Promise<NextResponse<OutfitSuccessResponse | OutfitErrorResponse>> {
  // 1. Cek ukuran body dan parse JSON
  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return errorJson("BAD_REQUEST", copy.apiErrors.badRequest, 400);
  }
  if (!rawText || rawText.length > MAX_BODY_BYTES) {
    return errorJson("BAD_REQUEST", copy.apiErrors.badRequest, 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText) as unknown;
  } catch {
    return errorJson("BAD_REQUEST", copy.apiErrors.badRequest, 400);
  }

  const body = parseRequestBody(parsedJson);
  if (!body) {
    return errorJson("BAD_REQUEST", copy.apiErrors.badRequest, 400);
  }

  // 2. Pastikan lemari punya minimal 1 atasan dan 1 bawahan
  const hasTop = body.wardrobe.some((i) => i.category === "atasan");
  const hasBottom = body.wardrobe.some((i) => i.category === "bawahan");
  if (!hasTop || !hasBottom) {
    return errorJson("WARDROBE_TOO_SMALL", copy.apiErrors.wardrobeTooSmall, 400);
  }

  // 3. Pastikan kunci API tersedia di server
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  if (!apiKey) {
    return errorJson("AI_UNAVAILABLE", copy.apiErrors.aiUnavailable, 503);
  }

  const ai = new GoogleGenAI({ apiKey });

  // 4. Panggil Gemini; jika hasil pertama tidak lolos verifikasi ID/komposisi, coba ulang sekali (prd.md 8.2.4)
  try {
    const firstRaw = await requestGeminiOutfit(ai, model, buildPrompt(body));
    const firstCheck = validateOutfitOutput(firstRaw, body.wardrobe);
    if (firstCheck.ok) {
      return NextResponse.json({ outfit: firstCheck.outfit });
    }

    const secondRaw = await requestGeminiOutfit(ai, model, buildPrompt(body, firstCheck.issue));
    const secondCheck = validateOutfitOutput(secondRaw, body.wardrobe);
    if (secondCheck.ok) {
      return NextResponse.json({ outfit: secondCheck.outfit });
    }

    return errorJson("AI_INVALID_OUTPUT", copy.apiErrors.aiInvalidOutput, 502);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
      return errorJson("RATE_LIMITED", copy.apiErrors.rateLimited, 429);
    }
    return errorJson("AI_UNAVAILABLE", copy.apiErrors.aiUnavailable, 503);
  }
}

