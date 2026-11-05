"use client";

// Halaman tunggal AVÉRA: pengantar, navigasi lima tab, dan isi tab yang aktif.
// Data lemari, profil, dan outfit tersimpan dikelola di sini agar semua tab memakai data yang sama.

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, Palette, Shirt, Sparkles, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Wardrobe from "@/components/Wardrobe";
import type { FormTarget } from "@/components/Wardrobe";
import ProfileForm from "@/components/ProfileForm";
import OutfitIdeas from "@/components/OutfitIdeas";
import ColorPalette from "@/components/ColorPalette";
import SavedOutfits from "@/components/SavedOutfits";
import { buildSampleWardrobe } from "@/data/sampleWardrobe";
import { copy } from "@/lib/copy";
import { resolveMode } from "@/lib/palette";
import {
  loadOutfits,
  loadProfile,
  loadWardrobe,
  newId,
  saveOutfits,
  saveProfile,
  saveWardrobe,
} from "@/lib/storage";
import type {
  GeneratedOutfit,
  Mode,
  SavedOutfit,
  StyleProfile,
  TabId,
  WardrobeItem,
} from "@/lib/types";

const TABS: { id: TabId; icon: LucideIcon }[] = [
  { id: "lemari", icon: Shirt },
  { id: "profil", icon: UserRound },
  { id: "palet", icon: Palette },
  { id: "ide", icon: Sparkles },
  { id: "tersimpan", icon: Bookmark },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("lemari");
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [profile, setProfile] = useState<StyleProfile>({});
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [preferredMode, setPreferredMode] = useState<Mode | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Membaca lemari, profil, dan outfit tersimpan dari browser setelah halaman tampil.
  useEffect(() => {
    const { items: saved, skipped } = loadWardrobe();
    const savedProfile = loadProfile();
    const savedOutfits = loadOutfits();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data browser baru bisa dibaca setelah halaman tampil
    setItems(saved);
    setProfile(savedProfile);
    setOutfits(savedOutfits);
    setLoaded(true);
    if (skipped) setToast(copy.errors.loadFailed);
  }, []);

  // Pesan singkat hilang sendiri setelah 3 detik (design.md bagian 7).
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Menyimpan lemari baru. Jika gagal, data lama tetap dipakai agar tidak ada yang rusak.
  const updateItems = useCallback((next: WardrobeItem[]): boolean => {
    const result = saveWardrobe(next);
    if (!result.ok) {
      setToast(result.reason === "full" ? copy.errors.storageFull : copy.errors.storageUnavailable);
      return false;
    }
    setItems(next);
    return true;
  }, []);

  // Menyimpan profil gaya baru ke browser.
  const updateProfile = useCallback((next: StyleProfile) => {
    const result = saveProfile(next);
    if (!result.ok) {
      setToast(result.reason === "full" ? copy.errors.storageFull : copy.errors.storageUnavailable);
      return;
    }
    setProfile(next);
  }, []);

  // Menyimpan satu outfit hasil AI beserta snapshot itemnya (agar tetap utuh walau pakaian dihapus).
  const handleSaveOutfit = useCallback(
    (generated: GeneratedOutfit, mode: Mode): boolean => {
      const byId = new Map(items.map((w) => [w.id, w]));
      const snapshotItems = generated.itemIds
        .map((id) => byId.get(id))
        .filter((w): w is WardrobeItem => Boolean(w))
        .map((w) => ({
          itemId: w.id,
          snapshot: {
            name: w.name,
            category: w.category,
            accessoryType: w.accessoryType,
            colorName: w.colorName,
            colorHex: w.colorHex,
          },
        }));

      if (snapshotItems.length === 0) return false;

      const entry: SavedOutfit = {
        id: newId(),
        createdAt: Date.now(),
        mode,
        profileSnapshot: { ...profile },
        items: snapshotItems,
        reason: generated.reason,
        paletteNote: generated.paletteNote,
      };

      const next = [entry, ...outfits];
      const result = saveOutfits(next);
      if (!result.ok) {
        setToast(
          result.reason === "full" ? copy.errors.storageFull : copy.errors.storageUnavailable,
        );
        return false;
      }
      setOutfits(next);
      setToast(copy.ideas.outfitSavedToast);
      return true;
    },
    [items, outfits, profile],
  );

  const handleDeleteOutfit = useCallback(
    (id: string) => {
      const next = outfits.filter((o) => o.id !== id);
      const result = saveOutfits(next);
      if (!result.ok) {
        setToast(
          result.reason === "full" ? copy.errors.storageFull : copy.errors.storageUnavailable,
        );
        return;
      }
      setOutfits(next);
      setToast(copy.saved.deletedToast);
    },
    [outfits],
  );

  const loadSample = useCallback(() => {
    if (updateItems(buildSampleWardrobe())) {
      setToast(copy.wardrobe.sampleLoaded);
      setActiveTab("lemari");
    }
  }, [updateItems]);

  const startWardrobe = () => {
    setActiveTab("lemari");
    setFormTarget("new");
  };

  const activeMode = resolveMode(preferredMode, profile);
  const isEmpty = loaded && items.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 pb-32 pt-4 sm:px-8 lg:pb-16">
      {/* Navigasi: kapsul kaca melayang. Di desktop, wordmark AVÉRA dan tab berada di dalam satu bar kaca pekat
          agar saat halaman di-scroll ke bawah, isi konten tidak bertabrakan dengan teks header. */}
      <header className="lg:sticky lg:top-4 lg:z-30 lg:mb-8">
        <div className="desktop-header-pill flex items-center justify-between lg:rounded-full lg:px-3 lg:py-2">
          <p
            className={`font-serif text-3xl leading-none tracking-tight lg:pl-4 ${
              isEmpty ? "hidden lg:block" : "mb-4 lg:mb-0"
            }`}
          >
            {copy.brand}
          </p>
          <nav
            aria-label={copy.nav.label}
            className="glass-nav fixed inset-x-4 bottom-4 z-30 rounded-full p-1.5 lg:static lg:inset-auto lg:w-auto lg:p-0"
          >
            <ul role="tablist" className="flex items-stretch justify-between gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <li key={tab.id} className="flex-1 lg:flex-none">
                    <button
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={selected}
                      aria-controls="tab-panel"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex min-h-[50px] w-full flex-col items-center justify-center gap-1 rounded-full px-1 transition-colors lg:min-h-[42px] lg:flex-row lg:gap-2 lg:px-4 ${
                        selected ? "bg-cocoa text-ivory on-dark" : "text-cocoa hover:bg-cocoa/10"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                      <span className="text-[11px] font-semibold leading-tight lg:text-sm">
                        {copy.tabs[tab.id]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Pengantar hanya tampil saat lemari masih kosong (design.md bagian 8). */}
      {isEmpty && (
        <section className="glass-2 rise-in mb-6 rounded-[28px] p-6 sm:p-8">
          <h1 className="font-serif text-[44px] leading-none sm:text-[64px]">{copy.brand}</h1>
          <p className="mt-3 font-serif text-2xl italic sm:text-[28px]">{copy.tagline}</p>
          <p className="mt-2 max-w-xl">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={startWardrobe}>
              {copy.buttons.startWardrobe}
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button type="button" className="btn-secondary" onClick={loadSample}>
              {copy.buttons.useSample}
            </button>
          </div>
          <p className="mt-4 text-sm">{copy.privacy}</p>
        </section>
      )}

      <main id="tab-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`} key={activeTab} className="fade-in">
        {activeTab === "lemari" && (
          <Wardrobe
            items={items}
            loaded={loaded}
            onChange={updateItems}
            onUseSample={loadSample}
            onNotify={setToast}
            formTarget={formTarget}
            onFormTargetChange={setFormTarget}
          />
        )}
        {activeTab === "profil" && (
          <ProfileForm
            profile={profile}
            mode={activeMode}
            onChangeProfile={updateProfile}
            onChangeMode={setPreferredMode}
            onOpenPalette={() => setActiveTab("palet")}
          />
        )}
        {activeTab === "ide" && (
          <OutfitIdeas
            items={items}
            profile={profile}
            mode={activeMode}
            onChangeMode={setPreferredMode}
            onSaveOutfit={handleSaveOutfit}
            onOpenWardrobe={() => setActiveTab("lemari")}
            onOpenProfile={() => setActiveTab("profil")}
            onOpenPalette={() => setActiveTab("palet")}
          />
        )}
        {activeTab === "palet" && (
          <ColorPalette
            profile={profile}
            mode={activeMode}
            items={items}
            onChangeMode={setPreferredMode}
            onOpenProfile={() => setActiveTab("profil")}
          />
        )}
        {activeTab === "tersimpan" && (
          <SavedOutfits
            outfits={outfits}
            items={items}
            onDelete={handleDeleteOutfit}
            onOpenIdeas={() => setActiveTab("ide")}
          />
        )}
      </main>

      {/* Pesan singkat (toast) di atas navigasi. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center lg:bottom-8">
        {toast && (
          <p className="glass-dark rise-in rounded-full px-5 py-3 text-center text-sm font-medium">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
