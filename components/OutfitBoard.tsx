// Papan Outfit 2D (design.md bagian 9):
// Memvisualisasikan kombinasi pakaian di atas siluet manekin abstrak netral gender (rasio 1 : 2).
// Mendukung pakaian berfoto maupun tanpa foto, baik dengan hijab maupun tanpa hijab.

import { copy } from "@/lib/copy";
import type { AccessoryType, Category } from "@/lib/types";

export interface BoardItem {
  id: string;
  name: string;
  category: Category;
  accessoryType?: AccessoryType;
  colorName: string;
  colorHex: string;
  photo?: string;
  deleted?: boolean;
}

interface OutfitBoardProps {
  items: BoardItem[];
  loading?: boolean;
  compact?: boolean;
}

interface ZoneSpec {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Zona dalam persen dari wadah 1:2 sesuai tabel di design.md bagian 9.
const ZONES = {
  hijab: { x: 50, y: 10, w: 30, h: 17 },
  kalung: { x: 50, y: 23, w: 18, h: 5 },
  atasan: { x: 50, y: 36, w: 58, h: 30 },
  jam: { x: 15, y: 50, w: 9, h: 9 },
  cincin: { x: 85, y: 52, w: 6, h: 6 },
  lainnya: { x: 85, y: 36, w: 9, h: 9 },
  bawahan: { x: 50, y: 66, w: 44, h: 32 },
  sepatu: { x: 50, y: 94, w: 44, h: 8 },
} as const satisfies Record<string, ZoneSpec>;

function zoneStyle(zone: ZoneSpec) {
  return {
    left: `${zone.x}%`,
    top: `${zone.y}%`,
    width: `${zone.w}%`,
    height: `${zone.h}%`,
    transform: "translate(-50%, -50%)",
  };
}

export default function OutfitBoard({
  items,
  loading = false,
  compact = false,
}: OutfitBoardProps) {
  const bawahan = items.find((i) => i.category === "bawahan");
  const atasan = items.find((i) => i.category === "atasan");
  const hijab = items.find((i) => i.category === "hijab");
  const sepatu = items.find((i) => i.category === "sepatu");
  const accessories = items.filter((i) => i.category === "aksesoris").slice(0, 3);

  // Menentukan zona untuk tiap aksesoris agar tidak saling menumpuk bila ada lebih dari satu.
  const accessorySlots: { item: BoardItem; zone: ZoneSpec; slotKey: AccessoryType }[] = [];
  const usedSlots = new Set<AccessoryType>();
  const fallbackOrder: AccessoryType[] = ["kalung", "jam", "cincin", "lainnya"];

  for (const acc of accessories) {
    const preferred: AccessoryType = acc.accessoryType ?? "lainnya";
    const chosen =
      !usedSlots.has(preferred)
        ? preferred
        : (fallbackOrder.find((s) => !usedSlots.has(s)) ?? "lainnya");
    usedSlots.add(chosen);
    accessorySlots.push({ item: acc, zone: ZONES[chosen], slotKey: chosen });
  }

  return (
    <div
      role="img"
      aria-label={copy.ideas.boardLabel}
      className={`relative mx-auto aspect-[1/2] w-full overflow-hidden rounded-[24px] border border-ivory/35 bg-ivory/15 ${
        compact ? "max-w-[150px]" : "max-w-[280px]"
      } ${loading ? "shimmer" : ""}`}
    >
      {/* Gelembung buram Olive dan Batter di belakang figur (design.md bagian 9). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[28%] h-[42%] w-[78%] -translate-x-1/2 rounded-full bg-olive/45 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[58%] h-[36%] w-[72%] -translate-x-1/2 rounded-full bg-batter/55 blur-2xl"
      />

      {/* Lapisan 0: Siluet manekin abstrak netral gender */}
      <MannequinSilhouette hasHijab={Boolean(hijab)} />

      {/* Urutan tumpukan dari bawah ke atas: bawahan (z-10) -> atasan (z-20) -> hijab (z-30) -> sepatu (z-40) -> aksesoris (z-50) */}
      {bawahan && (
        <div style={zoneStyle(ZONES.bawahan)} className="absolute z-10">
          <LayerPiece item={bawahan} shape="bawahan" compact={compact} />
        </div>
      )}

      {atasan && (
        <div style={zoneStyle(ZONES.atasan)} className="absolute z-20">
          <LayerPiece item={atasan} shape="atasan" compact={compact} />
        </div>
      )}

      {hijab && (
        <div style={zoneStyle(ZONES.hijab)} className="absolute z-30">
          <LayerPiece item={hijab} shape="hijab" compact={compact} />
        </div>
      )}

      {sepatu && (
        <div style={zoneStyle(ZONES.sepatu)} className="absolute z-40">
          <LayerPiece item={sepatu} shape="sepatu" compact={compact} />
        </div>
      )}

      {accessorySlots.map(({ item, zone, slotKey }) => (
        <div key={item.id} style={zoneStyle(zone)} className="absolute z-50">
          <LayerPiece
            item={item}
            shape={slotKey === "kalung" ? "kalung" : "aksesoris"}
            compact={compact}
          />
        </div>
      ))}
    </div>
  );
}

// Siluet dasar manekin abstrak tanpa fitur gender (design.md bagian 9).
function MannequinSilhouette({ hasHijab }: { hasHijab: boolean }) {
  return (
    <svg
      viewBox="0 0 200 400"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    >
      {/* Kepala oval polos jika tanpa hijab */}
      {!hasHijab && (
        <ellipse
          cx="100"
          cy="40"
          rx="20"
          ry="25"
          fill="rgba(248, 241, 227, 0.38)"
          stroke="rgba(68, 45, 28, 0.32)"
          strokeWidth="1.5"
        />
      )}
      {/* Leher */}
      <rect
        x="92"
        y="66"
        width="16"
        height="16"
        rx="6"
        fill="rgba(248, 241, 227, 0.32)"
        stroke="rgba(68, 45, 28, 0.28)"
        strokeWidth="1.5"
      />
      {/* Batang tubuh netral */}
      <path
        d="M62 84 C62 80 138 80 138 84 L130 204 C130 210 70 210 70 204 Z"
        fill="rgba(248, 241, 227, 0.32)"
        stroke="rgba(68, 45, 28, 0.28)"
        strokeWidth="1.5"
      />
      {/* Lengan kiri dan kanan */}
      <rect
        x="34"
        y="88"
        width="20"
        height="112"
        rx="10"
        fill="rgba(248, 241, 227, 0.26)"
        stroke="rgba(68, 45, 28, 0.26)"
        strokeWidth="1.5"
      />
      <rect
        x="146"
        y="88"
        width="20"
        height="112"
        rx="10"
        fill="rgba(248, 241, 227, 0.26)"
        stroke="rgba(68, 45, 28, 0.26)"
        strokeWidth="1.5"
      />
      {/* Kaki kiri dan kanan */}
      <rect
        x="72"
        y="208"
        width="24"
        height="152"
        rx="12"
        fill="rgba(248, 241, 227, 0.28)"
        stroke="rgba(68, 45, 28, 0.26)"
        strokeWidth="1.5"
      />
      <rect
        x="104"
        y="208"
        width="24"
        height="152"
        rx="12"
        fill="rgba(248, 241, 227, 0.28)"
        stroke="rgba(68, 45, 28, 0.26)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

type PieceShape = "atasan" | "bawahan" | "hijab" | "sepatu" | "kalung" | "aksesoris";

// Menggambar satu pakaian: foto bersudut 12 px bila ada, atau bentuk SVG berwarna item bila tanpa foto.
function LayerPiece({
  item,
  shape,
  compact,
}: {
  item: BoardItem;
  shape: PieceShape;
  compact: boolean;
}) {
  const opacityClass = item.deleted ? "opacity-55" : "";

  if (item.photo) {
    return (
      <div
        title={`${item.name} (${item.colorName})`}
        className={`h-full w-full overflow-hidden border-2 border-ivory shadow-md ${
          compact ? "rounded-[8px]" : "rounded-[12px]"
        } ${opacityClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div title={`${item.name} (${item.colorName})`} className={`h-full w-full ${opacityClass}`}>
      <ShapeSvg shape={shape} fill={item.colorHex} />
    </div>
  );
}

// Bentuk-bentuk pakaian tanpa foto dengan garis tepi tipis Ivory (design.md bagian 9).
function ShapeSvg({ shape, fill }: { shape: PieceShape; fill: string }) {
  const stroke = "var(--ivory)";

  switch (shape) {
    case "hijab":
      // Bentuk tetesan menutupi kepala dan bahu atas.
      return (
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <path
            d="M50 6 C26 6 14 28 14 54 C14 78 28 94 50 94 C72 94 86 78 86 54 C86 28 74 6 50 6 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3.5"
          />
          <ellipse
            cx="50"
            cy="44"
            rx="19"
            ry="23"
            fill="rgba(248, 241, 227, 0.55)"
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      );

    case "atasan":
      // Trapesium dengan lengan kiri dan kanan.
      return (
        <svg viewBox="0 0 120 100" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <path
            d="M34 8 L46 8 Q60 18 74 8 L86 8 L114 34 L98 52 L86 38 L88 92 L32 92 L34 38 L22 52 L6 34 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "bawahan":
      // Dua kaki celana/rok panjang.
      return (
        <svg viewBox="0 0 100 120" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <path
            d="M18 6 L82 6 L88 114 L55 114 L50 38 L45 114 L12 114 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "sepatu":
      // Dua kapsul sepatu.
      return (
        <svg viewBox="0 0 120 40" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <rect
            x="6"
            y="6"
            width="46"
            height="28"
            rx="14"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
          />
          <rect
            x="68"
            y="6"
            width="46"
            height="28"
            rx="14"
            fill={fill}
            stroke={stroke}
            strokeWidth="3"
          />
        </svg>
      );

    case "kalung":
      // Lengkungan kalung dengan liontin kecil.
      return (
        <svg viewBox="0 0 100 40" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <path
            d="M12 8 Q50 34 88 8"
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M12 8 Q50 34 88 8"
            fill="none"
            stroke={fill}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="24" r="7" fill={fill} stroke={stroke} strokeWidth="2.5" />
        </svg>
      );

    default:
      // Lingkaran kecil untuk jam, cincin, atau aksesoris lainnya.
      return (
        <svg viewBox="0 0 40 40" className="h-full w-full drop-shadow-sm" aria-hidden="true">
          <circle cx="20" cy="20" r="16" fill={fill} stroke={stroke} strokeWidth="3.5" />
        </svg>
      );
  }
}
