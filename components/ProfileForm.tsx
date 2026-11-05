"use client";

// Tab Profil (02): memilih zodiak, undertone kulit, dan mode saran gaya.
// Semua pilihan langsung disimpan ke browser lewat halaman utama.

import { useState } from "react";
import { ArrowUpRight, Check, ChevronDown, ChevronUp, Info } from "lucide-react";
import { copy } from "@/lib/copy";
import {
  availableModes,
  findZodiac,
  isLightColor,
  undertoneList,
  zodiacList,
} from "@/lib/palette";
import type { Mode, StyleProfile, Undertone, ZodiacId } from "@/lib/types";

interface ProfileFormProps {
  profile: StyleProfile;
  mode: Mode | null;
  onChangeProfile: (next: StyleProfile) => void;
  onChangeMode: (next: Mode) => void;
  onOpenPalette: () => void;
}

const MODES: Mode[] = ["zodiak", "undertone", "kombinasi"];

export default function ProfileForm({
  profile,
  mode,
  onChangeProfile,
  onChangeMode,
  onOpenPalette,
}: ProfileFormProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  const available = availableModes(profile);
  const selectedZodiac = findZodiac(profile.zodiac);

  // Mengetuk pilihan yang sudah aktif akan mengosongkannya, agar pengguna bebas hanya memakai salah satu.
  const toggleZodiac = (id: ZodiacId) => {
    const nextZodiac = profile.zodiac === id ? undefined : id;
    onChangeProfile({ ...profile, zodiac: nextZodiac });
  };

  const toggleUndertone = (id: Undertone) => {
    const nextUndertone = profile.undertone === id ? undefined : id;
    onChangeProfile({ ...profile, undertone: nextUndertone });
  };

  const lockHintFor = (m: Mode): string => {
    if (m === "zodiak") return copy.profile.modeLockedZodiac;
    if (m === "undertone") return copy.profile.modeLockedUndertone;
    return copy.profile.modeLocked;
  };

  return (
    <section className="rise-in space-y-6">
      {/* Kepala tab */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <h1 className="font-serif text-[32px] leading-tight sm:text-[44px]">
          {copy.profile.title} <em>{copy.profile.titleItalic}</em>
        </h1>
        <p className="mt-2 max-w-xl">{copy.profile.subtitle}</p>
      </div>

      {/* Kartu Zodiak: grid 12 pilihan dengan rentang tanggal */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="label-caps">{copy.profile.zodiacLabel}</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-[28px]">{copy.profile.zodiacTitle}</h2>
          </div>
          {selectedZodiac && (
            <div className="flex items-center gap-2">
              {selectedZodiac.colors.map((c) => (
                <span
                  key={c.hex}
                  className="swatch h-6 w-6"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                />
              ))}
              <span className="text-sm font-medium">
                {copy.profile.elementLabel}: {selectedZodiac.element}
              </span>
            </div>
          )}
        </div>

        <div
          role="group"
          aria-label={copy.profile.zodiacTitle}
          className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {zodiacList.map((z) => {
            const id = z.id as ZodiacId;
            const selected = profile.zodiac === id;
            return (
              <button
                key={z.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleZodiac(id)}
                className={`flex min-h-[68px] flex-col justify-between rounded-[20px] border p-3.5 text-left transition-colors ${
                  selected
                    ? "border-cocoa bg-cocoa text-ivory on-dark"
                    : "card-flat text-cocoa hover:bg-ivory/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{z.name}</span>
                  <span className="flex items-center gap-1">
                    {z.colors.map((c) => (
                      <span
                        key={c.hex}
                        className="swatch h-4 w-4"
                        style={{ backgroundColor: c.hex }}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </div>
                <span className="mt-1 text-xs opacity-85">{z.dates}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs">{copy.profile.zodiacHint}</p>
      </div>

      {/* Kartu Undertone: 3 kartu besar warm/cool/neutral dengan 5 swatch dan hint */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <p className="label-caps">{copy.profile.undertoneLabel}</p>
        <h2 className="mt-1 font-serif text-2xl sm:text-[28px]">{copy.profile.undertoneTitle}</h2>

        <div
          role="group"
          aria-label={copy.profile.undertoneTitle}
          className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          {undertoneList.map((u) => {
            const id = u.id as Undertone;
            const selected = profile.undertone === id;
            return (
              <button
                key={u.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleUndertone(id)}
                className={`flex flex-col justify-between rounded-[20px] border p-4 text-left transition-colors ${
                  selected
                    ? "border-cocoa bg-cocoa text-ivory on-dark"
                    : "card-flat text-cocoa hover:bg-ivory/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-2xl">{u.name}</span>
                    {selected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ivory text-cocoa">
                        <Check size={14} strokeWidth={2} aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm opacity-90">{u.hint}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {u.colors.map((c) => (
                    <span
                      key={c.hex}
                      className="swatch flex h-8 w-8 items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={c.name}
                    >
                      {selected && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isLightColor(c.hex) ? "bg-cocoa" : "bg-ivory"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bantuan cara mengetahui undertone yang bisa dibuka-tutup */}
        <div className="mt-4 rounded-[20px] border border-caramel/30 bg-ivory/60 p-3.5">
          <button
            type="button"
            aria-expanded={guideOpen}
            onClick={() => setGuideOpen((v) => !v)}
            className="flex min-h-[44px] w-full items-center justify-between gap-2 text-left text-sm font-semibold"
          >
            <span>{copy.profile.guideToggle}</span>
            {guideOpen ? (
              <ChevronUp size={18} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
          {guideOpen && (
            <div className="mt-2 space-y-2 border-t border-caramel/20 pt-3 text-sm">
              <p>{copy.profile.guideIntro}</p>
              <ul className="space-y-1.5">
                {undertoneList.map((u) => (
                  <li key={u.id}>
                    <strong className="font-semibold">{u.name}:</strong> {u.hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Pilihan Mode (Zodiak / Undertone / Kombinasi) */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <p className="label-caps">{copy.profile.modeSectionLabel}</p>
        <h2 className="mt-1 font-serif text-2xl sm:text-[28px]">{copy.profile.modeTitle}</h2>

        <div
          role="radiogroup"
          aria-label={copy.profile.modeTitle}
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
                aria-disabled={!enabled}
                onClick={() => {
                  if (enabled) onChangeMode(m);
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

        {mode && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="btn-primary" onClick={onOpenPalette}>
              {copy.buttons.openPalette}
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Catatan hiburan (bukan klaim ilmiah) */}
      <p className="flex items-start gap-2 px-1 text-sm">
        <Info size={16} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
        <span>{copy.disclaimer}</span>
      </p>
    </section>
  );
}
