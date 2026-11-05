"use client";

// Tab Palet (04): menampilkan saran warna sesuai mode (zodiak, undertone, atau kombinasi)
// ditambah deretan warna netral "Tambahan Styling". Menandai warna yang sudah dimiliki di lemari.

import { ArrowUpRight, Check, Palette } from "lucide-react";
import { copy } from "@/lib/copy";
import {
  availableModes,
  buildNeutrals,
  buildPalette,
  findUndertone,
  findZodiac,
  ownsSimilarColor,
} from "@/lib/palette";
import type { ColorEntry, Mode, StyleProfile, WardrobeItem } from "@/lib/types";

interface ColorPaletteProps {
  profile: StyleProfile;
  mode: Mode | null;
  items: WardrobeItem[];
  onChangeMode: (next: Mode) => void;
  onOpenProfile: () => void;
}

const MODES: Mode[] = ["zodiak", "undertone", "kombinasi"];

export default function ColorPalette({
  profile,
  mode,
  items,
  onChangeMode,
  onOpenProfile,
}: ColorPaletteProps) {
  const available = availableModes(profile);
  const zodiac = findZodiac(profile.zodiac);
  const undertone = findUndertone(profile.undertone);
  const neutrals = buildNeutrals();

  const mainColors = mode ? buildPalette(mode, profile) : [];
  const zodiacColors = mainColors.filter((c) => c.source === "zodiac");
  const undertoneColors = mainColors.filter((c) => c.source === "undertone");

  return (
    <section className="rise-in space-y-6">
      {/* Kepala tab + pemilih mode cepat */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-[32px] leading-tight sm:text-[44px]">
              {copy.palette.title} <em>{copy.palette.titleItalic}</em>
            </h1>
          </div>
          <p className="text-sm">{copy.palette.offlineNote}</p>
        </div>

        <div
          role="group"
          aria-label={copy.palette.modeLabel}
          className="mt-4 flex flex-wrap gap-2"
        >
          {MODES.map((m) => {
            const enabled = available[m];
            const selected = mode === m && enabled;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={selected}
                aria-disabled={!enabled}
                onClick={() => {
                  if (enabled) onChangeMode(m);
                }}
                className={`chip ${!enabled ? "cursor-not-allowed opacity-55" : ""}`}
              >
                {copy.modes[m]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keadaan belum mengisi profil */}
      {!mode && (
        <div className="glass-2 flex flex-col items-center rounded-[28px] p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/80">
            <Palette size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 font-serif text-2xl">{copy.palette.emptyTitle}</p>
          <p className="mt-1 max-w-md">{copy.palette.emptyBody}</p>
          <button type="button" className="btn-primary mt-5" onClick={onOpenProfile}>
            {copy.buttons.openProfile}
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Kelompok warna Zodiak */}
      {zodiac && zodiacColors.length > 0 && (
        <SwatchGroup
          title={copy.palette.zodiacGroup(zodiac.name, zodiac.element)}
          colors={zodiacColors}
          items={items}
        />
      )}

      {/* Kelompok warna Undertone */}
      {undertone && undertoneColors.length > 0 && (
        <SwatchGroup
          title={copy.palette.undertoneGroup(undertone.name)}
          colors={undertoneColors}
          items={items}
        />
      )}

      {/* Kelompok warna netral "Tambahan Styling" selalu tampil */}
      <SwatchGroup
        title={copy.palette.neutralGroup}
        subtitle={copy.palette.neutralSubtitle}
        colors={neutrals}
        items={items}
      />

      <p className="px-1 text-sm">{copy.disclaimer}</p>
    </section>
  );
}

interface SwatchGroupProps {
  title: string;
  subtitle?: string;
  colors: ColorEntry[];
  items: WardrobeItem[];
}

function SwatchGroup({ title, subtitle, colors, items }: SwatchGroupProps) {
  return (
    <div className="glass-2 rounded-[28px] p-5 sm:p-6">
      <h2 className="font-serif text-2xl sm:text-[28px]">{title}</h2>
      {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {colors.map((c) => {
          const owned = ownsSimilarColor(c.hex, items);
          return (
            <li
              key={`${title}-${c.hex}`}
              className="card-flat flex flex-col justify-between rounded-[20px] p-3.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="swatch h-11 w-11 shrink-0"
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight">{c.name}</p>
                  <p className="mt-0.5 font-mono text-xs uppercase opacity-75">{c.hex}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
                {owned ? (
                  <>
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-olive-deep text-ivory"
                      aria-hidden="true"
                    >
                      <Check size={11} strokeWidth={2.5} />
                    </span>
                    <span className="text-olive-deep">{copy.palette.owned}</span>
                  </>
                ) : (
                  <span className="opacity-75">{copy.palette.notOwned}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
