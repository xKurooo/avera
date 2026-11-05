"use client";

// Tab Lemari: melihat, menambah, mengubah, dan menghapus pakaian.
// Data disimpan oleh halaman utama lewat lib/storage.ts; komponen ini hanya mengatur tampilan.

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import { Check, Columns2, Droplet, Ellipsis, Footprints, Gem, ImagePlus, Info, Pencil, Plus, Shirt, Trash, Watch, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import colors from "@/data/colors.json";
import { copy } from "@/lib/copy";
import { isLightColor, nearestColorName } from "@/lib/palette";
import { MAX_ITEMS, compressPhoto, newId } from "@/lib/storage";
import { ACCESSORY_TYPES, CATEGORIES } from "@/lib/types";
import type { AccessoryType, Category, WardrobeItem } from "@/lib/types";

// "new" = form tambah, sebuah item = form ubah, null = form tertutup.
export type FormTarget = WardrobeItem | "new" | null;

interface WardrobeProps {
  items: WardrobeItem[];
  loaded: boolean;
  onChange: (next: WardrobeItem[]) => boolean;
  onUseSample: () => void;
  onNotify: (message: string) => void;
  formTarget: FormTarget;
  onFormTargetChange: (target: FormTarget) => void;
}

type Filter = Category | "semua";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  atasan: Shirt,
  bawahan: Columns2,
  hijab: Droplet,
  sepatu: Footprints,
  aksesoris: Gem,
};

// Ikon untuk satu item; jam memakai ikon jam tangan agar lebih mudah dikenali.
function ItemIcon({ item, className }: { item: Pick<WardrobeItem, "category" | "accessoryType">; className: string }) {
  const props = { size: 44, strokeWidth: 1.5, className, "aria-hidden": true } as const;
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

export default function Wardrobe({
  items,
  loaded,
  onChange,
  onUseSample,
  onNotify,
  formTarget,
  onFormTargetChange,
}: WardrobeProps) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<WardrobeItem | null>(null);

  const isFull = items.length >= MAX_ITEMS;

  // Urutkan sesuai urutan kategori agar lemari terlihat rapi.
  const sorted = [...items].sort(
    (a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) || a.createdAt - b.createdAt,
  );
  const visible = filter === "semua" ? sorted : sorted.filter((i) => i.category === filter);
  const countOf = (c: Category) => items.filter((i) => i.category === c).length;

  const openAdd = () => {
    if (isFull) {
      onNotify(copy.wardrobe.full);
      return;
    }
    onFormTargetChange("new");
  };

  const handleSave = (item: WardrobeItem): boolean => {
    const exists = items.some((i) => i.id === item.id);
    if (!exists && items.length >= MAX_ITEMS) {
      onNotify(copy.wardrobe.full);
      return false;
    }
    const next = exists ? items.map((i) => (i.id === item.id ? item : i)) : [...items, item];
    const ok = onChange(next);
    if (ok) {
      onNotify(exists ? copy.wardrobe.updated : copy.wardrobe.added);
      onFormTargetChange(null);
    }
    return ok;
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    if (onChange(items.filter((i) => i.id !== toDelete.id))) onNotify(copy.wardrobe.deleted);
    setToDelete(null);
  };

  return (
    <section className="rise-in">
      {/* Kepala tab: judul, jumlah item, dan filter kategori. */}
      <div className="glass-2 rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-serif text-[32px] leading-tight sm:text-[44px]">
              {copy.wardrobe.title} <em>{copy.wardrobe.titleItalic}</em>
            </h1>
          </div>
          {loaded && (
            <p className="label-caps pb-2" aria-live="polite">
              {copy.wardrobe.count(items.length, MAX_ITEMS)}
            </p>
          )}
        </div>

        {isFull && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-ivory/80 p-3 text-sm font-medium text-danger">
            <Info size={18} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
            {copy.wardrobe.full}
          </p>
        )}

        {loaded && items.length > 0 && (
          <div
            role="group"
            aria-label={copy.wardrobe.filterLabel}
            className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            <button type="button" className="chip" aria-pressed={filter === "semua"} onClick={() => setFilter("semua")}>
              {copy.wardrobe.filterAll} <span className="tabular-nums opacity-80">{items.length}</span>
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={filter === c} onClick={() => setFilter(c)}>
                {copy.categories[c]} <span className="tabular-nums opacity-80">{countOf(c)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keadaan memuat. */}
      {!loaded && <p className="glass-2 mt-6 rounded-[28px] p-6">{copy.wardrobe.loading}</p>}

      {/* Keadaan kosong. */}
      {loaded && items.length === 0 && (
        <div className="glass-2 mt-6 flex flex-col items-center rounded-[28px] p-8 text-center">
          <HangerIllustration />
          <p className="mt-4 font-serif text-2xl">{copy.wardrobe.emptyTitle}</p>
          <p className="mt-1">{copy.wardrobe.emptyBody}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={openAdd}>
              <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
              {copy.buttons.addItem}
            </button>
            <button type="button" className="btn-secondary" onClick={onUseSample}>
              {copy.buttons.useSample}
            </button>
          </div>
        </div>
      )}

      {/* Grid item. Kartu pertama selalu kartu "Tambah". */}
      {loaded && items.length > 0 && (
        <>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            <li>
              <button
                type="button"
                onClick={openAdd}
                aria-disabled={isFull}
                className={`dashed-card flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[20px] font-semibold text-cocoa ${
                  isFull ? "opacity-50" : "hover:bg-ivory/60"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/80">
                  <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="rounded-full bg-ivory/80 px-3 py-1 text-sm">{copy.buttons.addItem}</span>
              </button>
            </li>
            {visible.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                menuOpen={menuOpenId === item.id}
                onToggleMenu={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                onEdit={() => {
                  setMenuOpenId(null);
                  onFormTargetChange(item);
                }}
                onDelete={() => {
                  setMenuOpenId(null);
                  setToDelete(item);
                }}
              />
            ))}
          </ul>
          {visible.length === 0 && (
            <p className="glass-2 mt-4 rounded-[20px] p-4 text-center">{copy.wardrobe.emptyCategory}</p>
          )}
        </>
      )}

      {/* Lapisan tak terlihat untuk menutup menu saat mengetuk di luar menu. */}
      {menuOpenId && (
        <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setMenuOpenId(null)} />
      )}

      {formTarget && (
        <ItemForm
          key={formTarget === "new" ? "new" : formTarget.id}
          initial={formTarget === "new" ? null : formTarget}
          onCancel={() => onFormTargetChange(null)}
          onSave={handleSave}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title={copy.wardrobe.confirmDeleteTitle}
          body={copy.wardrobe.confirmDeleteBody(toDelete.name)}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  );
}

// ---------- Kartu item ----------

interface ItemCardProps {
  item: WardrobeItem;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemCard({ item, menuOpen, onToggleMenu, onEdit, onDelete }: ItemCardProps) {
  const light = isLightColor(item.colorHex);
  const subLabel =
    item.category === "aksesoris" && item.accessoryType
      ? copy.accessoryTypes[item.accessoryType]
      : copy.categories[item.category];

  return (
    <li className="relative">
      <div className="card-flat relative aspect-square overflow-hidden rounded-[20px]">
        {item.photo ? (
          // Foto disimpan sebagai data URL di browser, jadi memakai <img> biasa, bukan next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: item.colorHex }}
            role="img"
            aria-label={`${item.name}, ${item.colorName}`}
          >
            <ItemIcon item={item} className={light ? "text-cocoa" : "text-ivory"} />
          </div>
        )}

        {/* Kapsul bawah: nama dan titik warna. */}
        <div className="capsule-solid absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3">
          <span className="swatch h-4 w-4 shrink-0" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-tight">{item.name}</span>
            <span className="block truncate text-xs leading-tight">
              {subLabel} · {item.colorName}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={`${copy.buttons.itemMenu} ${item.name}`}
          aria-expanded={menuOpen}
          className="capsule-solid absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full"
        >
          <Ellipsis size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {menuOpen && (
        <div className="capsule-solid absolute right-2 top-14 z-20 flex min-w-[140px] flex-col overflow-hidden rounded-2xl shadow-lg">
          <button type="button" onClick={onEdit} className="flex min-h-11 items-center gap-2 px-4 text-left font-medium hover:bg-batter/60">
            <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
            {copy.buttons.edit}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex min-h-11 items-center gap-2 px-4 text-left font-medium text-danger hover:bg-batter/60"
          >
            <Trash size={16} strokeWidth={1.5} aria-hidden="true" />
            {copy.buttons.delete}
          </button>
        </div>
      )}
    </li>
  );
}

// ---------- Form tambah / ubah ----------

interface ItemFormProps {
  initial: WardrobeItem | null;
  onCancel: () => void;
  onSave: (item: WardrobeItem) => boolean;
}

function ItemForm({ initial, onCancel, onSave }: ItemFormProps) {
  const defaultColor = colors.basicColors.find((c) => c.name === "Krem") ?? colors.basicColors[0];
  const initialHex = (initial?.colorHex ?? defaultColor.hex).toUpperCase();

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "atasan");
  const [accessoryType, setAccessoryType] = useState<AccessoryType>(initial?.accessoryType ?? "lainnya");
  const [colorHex, setColorHex] = useState(initialHex);
  const [colorName, setColorName] = useState(initial?.colorName ?? nearestColorName(initialHex));
  const [note, setNote] = useState(initial?.note ?? "");
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; color?: string; photo?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useDialogBehavior(onCancel, nameRef);

  // Memperbarui warna dari bulatan spektrum (color picker) atau pilihan cepat.
  const applyHex = (hex: string, explicitName?: string) => {
    const normalized = hex.toUpperCase();
    setColorHex(normalized);
    setColorName(explicitName ?? nearestColorName(normalized));
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, photo: copy.errors.photoNotImage }));
      return;
    }
    setProcessing(true);
    try {
      setPhoto(await compressPhoto(file));
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: copy.errors.photoFailed }));
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim().slice(0, 60);
    const trimmedColorName = (colorName.trim() || nearestColorName(colorHex)).slice(0, 30);
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(colorHex);
    const nextErrors = {
      name: trimmedName ? undefined : copy.form.errorName,
      color: validHex ? undefined : copy.form.errorColor,
    };
    setErrors((e) => ({ ...e, ...nextErrors }));
    if (!trimmedName || !validHex) return;

    const trimmedNote = note.trim().slice(0, 80);
    onSave({
      id: initial?.id ?? newId(),
      name: trimmedName,
      category,
      accessoryType: category === "aksesoris" ? accessoryType : undefined,
      colorName: trimmedColorName,
      colorHex: colorHex.toUpperCase(),
      note: trimmedNote || undefined,
      photo,
      createdAt: initial?.createdAt ?? Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <div className="backdrop fade-in absolute inset-0" aria-hidden="true" onClick={onCancel} />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-form-title"
        onSubmit={handleSubmit}
        noValidate
        className="glass-2 glass-strong sheet-in relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] p-5 sm:rounded-[28px] sm:p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="item-form-title" className="font-serif text-2xl sm:text-[28px]">
            {initial ? copy.form.editTitle : copy.form.addTitle}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label={copy.buttons.close}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-batter/60"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Nama */}
        <label htmlFor="item-name" className="label-caps mt-4 block">
          {copy.form.name}
        </label>
        <input
          id="item-name"
          ref={nameRef}
          className="field mt-2"
          value={name}
          maxLength={60}
          placeholder={copy.form.namePlaceholder}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "item-name-error" : undefined}
        />
        {errors.name && (
          <p id="item-name-error" className="mt-1 text-sm font-medium text-danger">
            {errors.name}
          </p>
        )}

        {/* Kategori */}
        <fieldset className="mt-5">
          <legend className="label-caps">{copy.form.category}</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c];
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={category === c}
                  className="chip"
                  onClick={() => setCategory(c)}
                >
                  <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                  {copy.categories[c]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Sub-jenis aksesoris */}
        {category === "aksesoris" && (
          <fieldset className="mt-5">
            <legend className="label-caps">{copy.form.accessoryType}</legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup">
              {ACCESSORY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={accessoryType === t}
                  className="chip"
                  onClick={() => setAccessoryType(t)}
                >
                  {copy.accessoryTypes[t]}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* Warna: Bulatan Spektrum (dengan Eyedropper) + Pilihan Cepat */}
        <fieldset className="mt-5">
          <legend className="label-caps">{copy.form.color}</legend>
          <p className="mt-1 text-xs">{copy.form.spectrumHint}</p>

          <div className="card-flat mt-2.5 space-y-3.5 rounded-[20px] p-4">
            {/* Bulatan spektrum di kiri (klik untuk buka spektrum + eyedropper) + kotak nama warna */}
            <div className="flex flex-wrap items-center gap-3">
              <label
                title={copy.form.openNativePicker}
                className="swatch relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: colorHex }}
              >
                <input
                  type="color"
                  aria-label={copy.form.openNativePicker}
                  value={colorHex}
                  onChange={(e) => applyHex(e.target.value)}
                  className="sr-only"
                />
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                    isLightColor(colorHex) ? "bg-ivory/75 text-cocoa" : "bg-cocoa/75 text-ivory"
                  }`}
                >
                  {colorHex}
                </span>
              </label>

              <div className="min-w-[180px] flex-1">
                <label htmlFor="item-color-name" className="block text-xs font-semibold">
                  {copy.form.colorNameLabel}
                </label>
                <input
                  id="item-color-name"
                  className="field mt-1 min-h-[42px] py-2 text-sm font-medium"
                  value={colorName}
                  maxLength={30}
                  placeholder={copy.form.colorNamePlaceholder}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>
            </div>

            {/* Deretan Pilihan Cepat (basicColors) */}
            <div className="border-t border-caramel/20 pt-3">
              <p className="text-xs font-semibold">{copy.form.quickSwatchesLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={copy.form.quickSwatchesLabel}>
                {colors.basicColors.map((c) => {
                  const selected = colorHex.toUpperCase() === c.hex.toUpperCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      title={c.name}
                      aria-label={c.name}
                      onClick={() => applyHex(c.hex, c.name)}
                      className={`swatch flex h-8 w-8 items-center justify-center transition-transform ${
                        selected ? "scale-110 ring-2 ring-cocoa" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selected && (
                        <Check
                          size={14}
                          strokeWidth={2.5}
                          className={isLightColor(c.hex) ? "text-cocoa" : "text-ivory"}
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {errors.color && <p className="mt-1 text-sm font-medium text-danger">{errors.color}</p>}
        </fieldset>

        {/* Foto opsional */}
        <div className="mt-5">
          <p className="label-caps">{copy.form.photo}</p>
          <div className="mt-2 flex items-center gap-3">
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name || copy.form.photo} className="h-20 w-20 rounded-2xl object-cover" />
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} disabled={processing}>
                <ImagePlus size={18} strokeWidth={1.5} aria-hidden="true" />
                {processing ? copy.form.photoProcessing : photo ? copy.buttons.changePhoto : copy.buttons.choosePhoto}
              </button>
              {photo && !processing && (
                <button type="button" className="btn-secondary" onClick={() => setPhoto(undefined)}>
                  {copy.buttons.removePhoto}
                </button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} tabIndex={-1} />
          <p className="mt-1 text-sm">{copy.form.photoHint}</p>
          {errors.photo && <p className="mt-1 text-sm font-medium text-danger">{errors.photo}</p>}
        </div>

        {/* Catatan */}
        <label htmlFor="item-note" className="label-caps mt-5 block">
          {copy.form.note}
        </label>
        <input
          id="item-note"
          className="field mt-2"
          value={note}
          maxLength={80}
          placeholder={copy.form.notePlaceholder}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {copy.buttons.cancel}
          </button>
          <button type="submit" className="btn-primary" disabled={processing}>
            {copy.buttons.save}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------- Dialog konfirmasi ----------

interface ConfirmDialogProps {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({ title, body, onCancel, onConfirm }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useDialogBehavior(onCancel, cancelRef);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="backdrop fade-in absolute inset-0" aria-hidden="true" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
        className="glass-2 glass-strong rise-in relative w-full max-w-sm rounded-[28px] p-6"
      >
        <h2 id="confirm-title" className="font-serif text-2xl">
          {title}
        </h2>
        <p id="confirm-body" className="mt-2">
          {body}
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

// Perilaku dialog: fokus ke elemen pertama saat dibuka, tombol Esc untuk menutup.
function useDialogBehavior(onClose: () => void, focusRef: RefObject<HTMLElement | null>) {
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

// Ilustrasi garis gantungan baju untuk keadaan kosong (design.md bagian 7).
function HangerIllustration() {
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" aria-hidden="true" className="text-cocoa">
      <path
        d="M48 22c0-6 4-9 8-9s7 3 7 7-3 6-7 8l-8 5L8 58c-3 2-2 6 2 6h76c4 0 5-4 2-6L48 33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
