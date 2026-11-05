"use client";

// Tab Ide Outfit (03): meminta AI memilih satu outfit harian dari lemari pengguna,
// menampilkannya di Papan Outfit 2D, dan menyimpannya ke daftar Tersimpan.

import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Columns2,
  Droplet,
  Footprints,
  Gem,
  Info,
  RefreshCw,
  Shirt,
  Sparkles,
  Watch,
} from "lucide-react";
import OutfitBoard from "@/components/OutfitBoard";
import type { BoardItem } from "@/components/OutfitBoard";
import { copy } from "@/lib/copy";
import { availableModes, buildPalette, isLightColor } from "@/lib/palette";
import { MAX_DAILY_REQUESTS, incrementDailyQuota, loadDailyQuota } from "@/lib/storage";
import { CATEGORIES } from "@/lib/types";
import type {
  DailyQuota,
  GeneratedOutfit,
  Mode,
  OutfitErrorResponse,
  OutfitRequestBody,
  OutfitSuccessResponse,
  StyleProfile,
  WardrobeItem,
} from "@/lib/types";

interface OutfitIdeasProps {
  items: WardrobeItem[];
  profile: StyleProfile;
  mode: Mode | null;
  onChangeMode: (next: Mode) => void;
  onSaveOutfit: (outfit: GeneratedOutfit, mode: Mode) => boolean;
  onOpenWardrobe: () => void;
  onOpenProfile: () => void;
  onOpenPalette: () => void;
}

const MODES: Mode[] = ["zodiak", "undertone", "kombinasi"];

function CategoryIcon({
  item,
  className,
}: {
  item: Pick<WardrobeItem, "category" | "accessoryType">;
  className: string;
}) {
  const props = { size: 22, strokeWidth: 1.5, className, "aria-hidden": true } as const;
  if (item.category === "aksesoris" && item.accessoryType === "jam") return <Watch {...props} />;
  switch (item.category) {
    case "atasan":
      return <Shirt {...props} />;
    case "bawahan":
      return <Columns2 {...props} />;
    case "hijab":
      return <Droplet {...props} />;
    case "sepatu":
      return <Footprints {...props} />;
    default:
      return <Gem {...props} />;
  }
}

export default function OutfitIdeas({
  items,
  profile,
  mode,
  onChangeMode,
  onSaveOutfit,
  onOpenWardrobe,
  onOpenProfile,
  onOpenPalette,
}: OutfitIdeasProps) {
  const [quota, setQuota] = useState<DailyQuota>(() => loadDailyQuota());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedOutfit | null>(null);
  const [savedCurrent, setSavedCurrent] = useState(false);
  const [history, setHistory] = useState<string[][]>([]);

  const available = availableModes(profile);
  const hasTop = items.some((i) => i.category === "atasan");
  const hasBottom = items.some((i) => i.category === "bawahan");
  const wardrobeReady = hasTop && hasBottom;
  const quotaReached = quota.count >= MAX_DAILY_REQUESTS;

  const activePalette = mode ? buildPalette(mode, profile) : [];

  const lockHintFor = (m: Mode): string => {
    if (m === "zodiak") return copy.profile.modeLockedZodiac;
    if (m === "undertone") return copy.profile.modeLockedUndertone;
    return copy.profile.modeLocked;
  };

  const wardrobeMissingText = (): string => {
    if (!hasTop && !hasBottom) return copy.ideas.wardrobeIncomplete;
    if (!hasTop) return copy.ideas.missingTopsOnly;
    return copy.ideas.missingBottomsOnly;
  };

  const requestOutfit = async (previousOutfits: string[][]) => {
    if (!mode || !wardrobeReady) return;

    const currentQuota = loadDailyQuota();
    if (currentQuota.count >= MAX_DAILY_REQUESTS) {
      setQuota(currentQuota);
      setErrorMessage(copy.ideas.quotaReached);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const requestBody: OutfitRequestBody = {
      mode,
      profile,
      palette: activePalette,
      // Foto tidak pernah dikirim ke server (prd.md 8.1).
      wardrobe: items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        accessoryType: item.accessoryType,
        colorName: item.colorName,
        colorHex: item.colorHex,
        note: item.note,
      })),
      previousOutfits: previousOutfits.slice(-8),
    };

    try {
      const response = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as OutfitSuccessResponse | OutfitErrorResponse;
      if (!response.ok || !("outfit" in data)) {
        const message =
          "error" in data && data.error?.message ? data.error.message : copy.ideas.aiFailed;
        setErrorMessage(message);
        return;
      }

      // Hanya catat kuota ketika AI berhasil memberi jawaban valid.
      setQuota(incrementDailyQuota());
      setResult(data.outfit);
      setSavedCurrent(false);
      setHistory((prev) => [...prev, data.outfit.itemIds]);
    } catch {
      setErrorMessage(copy.ideas.aiFailed);
    } finally {
      setLoading(false);
    }
  };

  // Mengambil detail item lemari sesuai urutan kategori.
  const selectedItems: WardrobeItem[] = result
    ? result.itemIds
        .map((id) => items.find((i) => i.id === id))
        .filter((i): i is WardrobeItem => Boolean(i))
        .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category))
    : [];

  const boardItems: BoardItem[] = selectedItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    accessoryType: item.accessoryType,
    colorName: item.colorName,
    colorHex: item.colorHex,
    photo: item.photo,
  }));

  const handleSave = () => {
    if (!result || !mode || savedCurrent) return;
    if (onSaveOutfit(result, mode)) {
      setSavedCurrent(true);
    }
  };

  return (
    <section className="rise-in space-y-6">
      {/* Kepala tab + pemilih mode (3 chip besar) */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-serif text-[32px] leading-tight sm:text-[44px]">
              {copy.ideas.title} <em>{copy.ideas.titleItalic}</em>
            </h1>
          </div>
          <p className="label-caps pb-1" aria-live="polite">
            {copy.ideas.quotaStatus(quota.count, MAX_DAILY_REQUESTS)}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label={copy.ideas.modeLabel}
          className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          {MODES.map((m) => {
            const enabled = available[m];
            const selected = mode === m && enabled;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-disabled={!enabled || loading}
                onClick={() => {
                  if (enabled && !loading) onChangeMode(m);
                }}
                className={`flex min-h-[56px] flex-col justify-center rounded-[20px] border px-4 py-3 text-left transition-colors ${
                  selected
                    ? "border-cocoa bg-cocoa text-ivory on-dark"
                    : enabled
                      ? "card-flat text-cocoa hover:bg-ivory/80"
                      : "card-flat cursor-not-allowed text-cocoa opacity-60"
                }`}
              >
                <span className="font-semibold">{copy.modes[m]}</span>
                {!enabled && <span className="mt-0.5 text-xs">{lockHintFor(m)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keadaan 1: Profil gaya belum diisi sama sekali */}
      {!mode && (
        <div className="glass-2 flex flex-col items-center rounded-[28px] p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/80">
            <Sparkles size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 font-serif text-2xl">{copy.ideas.missingProfileTitle}</p>
          <p className="mt-1 max-w-md">{copy.ideas.missingProfileBody}</p>
          <button type="button" className="btn-primary mt-5" onClick={onOpenProfile}>
            {copy.buttons.openProfile}
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Keadaan 2: Lemari belum punya minimal 1 atasan dan 1 bawahan */}
      {mode && !wardrobeReady && (
        <div className="glass-2 flex flex-col items-center rounded-[28px] p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/80">
            <Shirt size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 font-serif text-2xl">{wardrobeMissingText()}</p>
          <button type="button" className="btn-primary mt-5" onClick={onOpenWardrobe}>
            {copy.buttons.openWardrobe}
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Keadaan 3: Kartu utama glass-dark dengan Papan Outfit 2D di kiri/atas (design.md bagian 8) */}
      {mode && wardrobeReady && (
        <div className="glass-dark rounded-[28px] p-6 sm:p-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
            {/* Kolom kiri/atas: Papan Outfit 2D */}
            <div className="flex flex-col items-center">
              <OutfitBoard items={loading ? [] : boardItems} loading={loading} />
            </div>

            {/* Kolom kanan/bawah: isi ajakan, loading, galat, atau hasil outfit */}
            <div className="flex min-h-full flex-col justify-between space-y-6">
              {/* Indikator loading */}
              {loading && (
                <div role="status" aria-live="polite" className="py-8">
                  <p className="font-serif text-2xl sm:text-[28px]">{copy.ideas.loading}</p>
                  <p className="mt-2 text-sm opacity-85">{copy.ideas.privacyNote}</p>
                </div>
              )}

              {/* Pesan galat ramah */}
              {!loading && errorMessage && (
                <div
                  role="alert"
                  className="rounded-[20px] border border-ivory/30 bg-ivory/10 p-5 text-ivory"
                >
                  <p className="font-medium">{errorMessage}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {!quotaReached && (
                      <button
                        type="button"
                        className="btn-primary on-dark"
                        onClick={() => requestOutfit(history)}
                      >
                        <RefreshCw size={18} strokeWidth={1.5} aria-hidden="true" />
                        {copy.buttons.retry}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onOpenPalette}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-ivory/40 px-5 font-semibold text-ivory hover:bg-ivory/15 on-dark"
                    >
                      {copy.buttons.openPalette}
                    </button>
                  </div>
                </div>
              )}

              {/* Keadaan awal: siluet kosong + ajakan + tombol bundar panah */}
              {!loading && !result && !errorMessage && (
                <div className="py-4">
                  <p className="font-serif text-2xl sm:text-[28px]">{copy.ideas.initialTitle}</p>
                  <p className="mt-2 max-w-md opacity-90">{copy.ideas.initialBody}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="btn-primary on-dark"
                      disabled={quotaReached}
                      onClick={() => requestOutfit([])}
                    >
                      {copy.buttons.generateOutfit}
                    </button>
                    <button
                      type="button"
                      aria-label={copy.buttons.generateOutfit}
                      disabled={quotaReached}
                      onClick={() => requestOutfit([])}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-cocoa transition-transform hover:-translate-y-0.5 disabled:opacity-50 on-dark"
                    >
                      <ArrowUpRight size={20} strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  </div>
                  {quotaReached && <p className="mt-3 text-sm">{copy.ideas.quotaReached}</p>}
                </div>
              )}

              {/* Hasil ide outfit */}
              {!loading && result && (
                <div className="space-y-5">
                  <div>
                    <p className="label-caps">{copy.ideas.selectedItemsLabel}</p>
                    <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {selectedItems.map((item) => {
                        const light = isLightColor(item.colorHex);
                        const subLabel =
                          item.category === "aksesoris" && item.accessoryType
                            ? copy.accessoryTypes[item.accessoryType]
                            : copy.categories[item.category];
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 rounded-[20px] border border-ivory/25 bg-ivory/10 p-3"
                          >
                            {item.photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.photo}
                                alt={item.name}
                                className="h-12 w-12 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <span
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-ivory/40"
                                style={{ backgroundColor: item.colorHex }}
                                aria-hidden="true"
                              >
                                <CategoryIcon
                                  item={item}
                                  className={light ? "text-cocoa" : "text-ivory"}
                                />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold leading-tight">{item.name}</p>
                              <p className="mt-0.5 text-xs opacity-85">
                                {subLabel} · {item.colorName}
                                {item.note ? ` · ${item.note}` : ""}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Alasan padu padan */}
                  <div className="rounded-[20px] border border-ivory/25 bg-ivory/10 p-4">
                    <p className="label-caps">{copy.ideas.reasonLabel}</p>
                    <p className="mt-1.5">{result.reason}</p>
                  </div>

                  {/* Swatch palet yang dipakai + Catatan palet */}
                  <div className="rounded-[20px] border border-ivory/25 bg-ivory/10 p-4">
                    <p className="label-caps">{copy.ideas.paletteNoteLabel}</p>
                    <p className="mt-1.5">{result.paletteNote}</p>
                    {activePalette.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ivory/15 pt-3">
                        {activePalette.map((c) => (
                          <span
                            key={`${c.source}-${c.hex}`}
                            className="flex items-center gap-1.5 rounded-full bg-ivory/15 py-1 pl-1.5 pr-3 text-xs"
                          >
                            <span
                              className="swatch h-4 w-4"
                              style={{ backgroundColor: c.hex }}
                              aria-hidden="true"
                            />
                            <span>{c.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tombol utama Simpan outfit + tombol sekunder Coba ide lain */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={savedCurrent}
                      onClick={handleSave}
                      className="btn-primary on-dark"
                    >
                      {savedCurrent ? (
                        <>
                          <Check size={18} strokeWidth={2} aria-hidden="true" />
                          {copy.buttons.savedAlready}
                        </>
                      ) : (
                        <>
                          <Bookmark size={18} strokeWidth={1.5} aria-hidden="true" />
                          {copy.buttons.saveOutfit}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={quotaReached}
                      onClick={() => requestOutfit(history)}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-ivory/45 bg-ivory/15 px-6 font-semibold text-ivory transition-colors hover:bg-ivory/25 disabled:opacity-50 on-dark"
                    >
                      <RefreshCw size={18} strokeWidth={1.5} aria-hidden="true" />
                      {copy.buttons.tryAnother}
                    </button>
                    {quotaReached && <span className="text-sm">{copy.ideas.quotaReached}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="flex items-start gap-2 px-1 text-sm">
        <Info size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>
          {copy.ideas.privacyNote} {copy.disclaimer}
        </span>
      </p>
    </section>
  );
}
