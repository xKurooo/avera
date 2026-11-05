"use client";

// Tab Tersimpan (05): menampilkan daftar outfit favorit yang pernah disimpan pengguna.
// Jika salah satu pakaian dihapus dari lemari, outfit tetap utuh berkat snapshot dan diberi label "Item sudah dihapus".

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Columns2,
  Droplet,
  Footprints,
  Gem,
  Shirt,
  Trash,
  Watch,
  X,
} from "lucide-react";
import OutfitBoard from "@/components/OutfitBoard";
import type { BoardItem } from "@/components/OutfitBoard";
import { copy } from "@/lib/copy";
import { isLightColor } from "@/lib/palette";
import { CATEGORIES } from "@/lib/types";
import type { SavedOutfit, WardrobeItem } from "@/lib/types";

interface SavedOutfitsProps {
  outfits: SavedOutfit[];
  items: WardrobeItem[];
  onDelete: (id: string) => void;
  onOpenIdeas: () => void;
}

function formatDate(timestamp: number): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

// Menggabungkan data snapshot tersimpan dengan data lemari terkini (agar foto muncul jika item masih ada,
// atau ditandai deleted jika item sudah dihapus dari lemari).
function resolveBoardItems(outfit: SavedOutfit, wardrobe: WardrobeItem[]): BoardItem[] {
  const byId = new Map(wardrobe.map((w) => [w.id, w]));
  return outfit.items
    .map(({ itemId, snapshot }) => {
      const live = byId.get(itemId);
      return {
        id: itemId,
        name: live?.name ?? snapshot.name,
        category: live?.category ?? snapshot.category,
        accessoryType: live?.accessoryType ?? snapshot.accessoryType,
        colorName: live?.colorName ?? snapshot.colorName,
        colorHex: live?.colorHex ?? snapshot.colorHex,
        photo: live?.photo,
        deleted: !live,
      };
    })
    .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));
}

function CategoryIcon({
  item,
  className,
}: {
  item: Pick<BoardItem, "category" | "accessoryType">;
  className: string;
}) {
  const props = { size: 20, strokeWidth: 1.5, className, "aria-hidden": true } as const;
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

export default function SavedOutfits({
  outfits,
  items,
  onDelete,
  onOpenIdeas,
}: SavedOutfitsProps) {
  const [selected, setSelected] = useState<SavedOutfit | null>(null);
  const [toDelete, setToDelete] = useState<SavedOutfit | null>(null);

  const sorted = [...outfits].sort((a, b) => b.createdAt - a.createdAt);

  const confirmDelete = () => {
    if (!toDelete) return;
    onDelete(toDelete.id);
    if (selected?.id === toDelete.id) setSelected(null);
    setToDelete(null);
  };

  return (
    <section className="rise-in space-y-6">
      {/* Kepala tab */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-serif text-[32px] leading-tight sm:text-[44px]">
              {copy.saved.title} <em>{copy.saved.titleItalic}</em>
            </h1>
          </div>
          <p className="label-caps pb-1" aria-live="polite">
            {copy.saved.count(outfits.length)}
          </p>
        </div>
      </div>

      {/* Keadaan kosong */}
      {sorted.length === 0 && (
        <div className="glass-2 flex flex-col items-center rounded-[28px] p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/80">
            <Bookmark size={22} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="mt-4 font-serif text-2xl">{copy.saved.emptyTitle}</p>
          <p className="mt-1 max-w-md">{copy.saved.emptyBody}</p>
          <button type="button" className="btn-primary mt-5" onClick={onOpenIdeas}>
            {copy.buttons.openIdeas}
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Grid kartu outfit tersimpan */}
      {sorted.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((outfit) => {
            const boardItems = resolveBoardItems(outfit, items);
            const hasDeleted = boardItems.some((b) => b.deleted);
            return (
              <li
                key={outfit.id}
                className="glass-2 flex flex-col justify-between rounded-[28px] p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-ivory">
                      {copy.modes[outfit.mode]}
                    </span>
                    <span className="text-xs font-medium opacity-80">
                      {formatDate(outfit.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={copy.buttons.delete}
                    onClick={() => setToDelete(outfit)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-danger hover:bg-ivory/70"
                  >
                    <Trash size={18} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>

                {/* Tombol kartu untuk membuka rincian */}
                <button
                  type="button"
                  onClick={() => setSelected(outfit)}
                  className="mt-3 flex flex-1 flex-col items-center text-left"
                >
                  <OutfitBoard items={boardItems} compact />
                  <p className="mt-4 line-clamp-2 w-full text-sm font-medium">{outfit.reason}</p>
                  {hasDeleted && (
                    <span className="mt-2 self-start rounded-full bg-ivory/80 px-2.5 py-0.5 text-xs font-semibold text-danger">
                      {copy.saved.itemDeleted}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Dialog rincian outfit */}
      {selected && (
        <OutfitDetailDialog
          outfit={selected}
          boardItems={resolveBoardItems(selected, items)}
          onClose={() => setSelected(null)}
          onRequestDelete={() => setToDelete(selected)}
        />
      )}

      {/* Dialog konfirmasi hapus */}
      {toDelete && (
        <ConfirmDeleteDialog
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

// ---------- Dialog rincian outfit ----------

interface OutfitDetailDialogProps {
  outfit: SavedOutfit;
  boardItems: BoardItem[];
  onClose: () => void;
  onRequestDelete: () => void;
}

function OutfitDetailDialog({
  outfit,
  boardItems,
  onClose,
  onRequestDelete,
}: OutfitDetailDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useDialogEscape(onClose, closeBtnRef);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <div className="backdrop fade-in absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-detail-title"
        className="glass-2 glass-strong sheet-in relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] p-5 sm:rounded-[28px] sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-ivory">
                {copy.modes[outfit.mode]}
              </span>
              <span className="text-xs font-medium">{formatDate(outfit.createdAt)}</span>
            </div>
            <h2 id="saved-detail-title" className="mt-1 font-serif text-2xl sm:text-[28px]">
              {copy.saved.detailTitle}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label={copy.buttons.close}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-batter/60"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 items-start gap-6 sm:grid-cols-[220px_1fr]">
          <OutfitBoard items={boardItems} />

          <div className="space-y-4">
            <div>
              <p className="label-caps">{copy.ideas.selectedItemsLabel}</p>
              <ul className="mt-2 space-y-2">
                {boardItems.map((item) => {
                  const light = isLightColor(item.colorHex);
                  const subLabel =
                    item.category === "aksesoris" && item.accessoryType
                      ? copy.accessoryTypes[item.accessoryType]
                      : copy.categories[item.category];
                  return (
                    <li
                      key={item.id}
                      className={`card-flat flex items-center justify-between gap-3 rounded-2xl p-2.5 ${
                        item.deleted ? "opacity-65" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: item.colorHex }}
                          aria-hidden="true"
                        >
                          <CategoryIcon
                            item={item}
                            className={light ? "text-cocoa" : "text-ivory"}
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{item.name}</p>
                          <p className="text-xs">
                            {subLabel} · {item.colorName}
                          </p>
                        </div>
                      </div>
                      {item.deleted && (
                        <span className="shrink-0 rounded-full bg-ivory px-2.5 py-0.5 text-xs font-semibold text-danger">
                          {copy.saved.itemDeleted}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="card-flat rounded-2xl p-3.5">
              <p className="label-caps">{copy.ideas.reasonLabel}</p>
              <p className="mt-1 text-sm">{outfit.reason}</p>
            </div>

            <div className="card-flat rounded-2xl p-3.5">
              <p className="label-caps">{copy.ideas.paletteNoteLabel}</p>
              <p className="mt-1 text-sm">{outfit.paletteNote}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn-danger" onClick={onRequestDelete}>
            <Trash size={18} strokeWidth={1.5} aria-hidden="true" />
            {copy.buttons.delete}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            {copy.buttons.close}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Dialog konfirmasi hapus ----------

function ConfirmDeleteDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useDialogEscape(onCancel, cancelRef);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="backdrop fade-in absolute inset-0" aria-hidden="true" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-saved-title"
        aria-describedby="confirm-saved-body"
        className="glass-2 glass-strong rise-in relative w-full max-w-sm rounded-[28px] p-6"
      >
        <h2 id="confirm-saved-title" className="font-serif text-2xl">
          {copy.saved.confirmDeleteTitle}
        </h2>
        <p id="confirm-saved-body" className="mt-2">
          {copy.saved.confirmDeleteBody}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={cancelRef} type="button" className="btn-secondary" onClick={onCancel}>
            {copy.buttons.cancel}
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <Trash size={18} strokeWidth={1.5} aria-hidden="true" />
            {copy.buttons.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function useDialogEscape(onClose: () => void, focusRef: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    focusRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusRef]);
}
