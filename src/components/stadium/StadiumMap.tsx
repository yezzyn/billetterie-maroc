'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export interface MapSeat {
  id: string;
  rowNumber: string; // row letter
  seatNumber: string;
  status: 'available' | 'locked' | 'sold';
  price: number;
  entrance?: string;
  gate?: string;
  access?: string;
  block?: string;
}

export interface MapZone {
  id: string;
  name: string;
  block: string;
  category: string;
  color: string;
  entrance: string;
  gate: string;
  seats: MapSeat[];
}

interface StadiumMapProps {
  zones: MapZone[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  maxSeats?: number;
  shape?: 'oval' | 'rectangular'; // stadium bowl shape from StadiumConfig
}

const CX = 600;
const CY = 450;
// Pitch radii (horizontal pitch)
const FIELD_RX = 250;
const FIELD_RY = 160;
const GAP = 18; // gap between pitch and first row
const ROW_STEP = 14; // distance between concentric rows
const ROWS_SHOWN = 5;
const SEATS_PER_ROW = 12;

const CATEGORY_COLORS: Record<string, string> = {
  CAT1: '#dc2626',
  CAT2: '#3b82f6',
  CAT3: '#10b981'
};

// Position → angular half (radians, y-down: 0=east, π/2=south, π=west, 3π/2=north)
const POSITION_RANGES: Record<string, [number, number]> = {
  north: [Math.PI, 2 * Math.PI],
  south: [0, Math.PI],
  east: [-Math.PI / 2, Math.PI / 2],
  west: [Math.PI / 2, (3 * Math.PI) / 2]
};

function positionOf(block: string): keyof typeof POSITION_RANGES {
  if (block.startsWith('3')) return 'north';
  if (block.startsWith('1')) return 'south';
  if (block.startsWith('2')) return 'east';
  return 'west';
}

const polar = (angle: number, rx: number, ry: number) => ({
  x: CX + Math.cos(angle) * rx,
  y: CY + Math.sin(angle) * ry
});

function seatColor(seat: MapSeat, selected: boolean, category: string) {
  if (selected) return '#22c55e';
  if (seat.status === 'sold') return '#ef4444';
  if (seat.status === 'locked') return '#f97316';
  return CATEGORY_COLORS[category] ?? '#3b82f6';
}

export function StadiumMap({
  zones,
  selectedSeats,
  onSeatSelect,
  maxSeats = 4,
  shape = 'oval'
}: StadiumMapProps) {
  const t = useTranslations('stadium');

  // Zone bands: split each position's half-circle between its zones
  const placed = useMemo(() => {
    const groups: Record<string, MapZone[]> = { north: [], south: [], east: [], west: [] };
    for (const z of zones) groups[positionOf(z.block)].push(z);

    const result: {
      zone: MapZone;
      band: { start: number; end: number };
      labelPos: { x: number; y: number };
      bandPath: string;
      seats: { seat: MapSeat; x: number; y: number }[];
    }[] = [];

    for (const [position, list] of Object.entries(groups)) {
      if (list.length === 0) continue;
      const [from, to] = POSITION_RANGES[position];
      const span = (to - from) / list.length;

      list.forEach((zone, i) => {
        const start = from + i * span + 0.015;
        const end = from + (i + 1) * span - 0.015;

        // Curved band path (outer arc + reversed inner arc, hugging the pitch)
        const outerRx = FIELD_RX + GAP + ROWS_SHOWN * ROW_STEP + 10;
        const outerRy = FIELD_RY + GAP + ROWS_SHOWN * ROW_STEP + 10;
        const innerRx = FIELD_RX + 6;
        const innerRy = FIELD_RY + 6;
        const steps = 24;
        const outer: string[] = [];
        const inner: string[] = [];
        for (let s = 0; s <= steps; s++) {
          const a = start + ((end - start) * s) / steps;
          const po = polar(a, outerRx, outerRy);
          const pi = polar(a, innerRx, innerRy);
          outer.push(`${s === 0 ? 'M' : 'L'} ${po.x.toFixed(1)} ${po.y.toFixed(1)}`);
          inner.unshift(`L ${pi.x.toFixed(1)} ${pi.y.toFixed(1)}`);
        }
        const bandPath = `${outer.join(' ')} ${inner.join(' ')} Z`;

        // Seats on concentric arcs (10 per row like real stands)
        const shown = zone.seats.slice(0, ROWS_SHOWN * SEATS_PER_ROW);
        const seats = shown.map((seat, idx) => {
          const row = Math.floor(idx / SEATS_PER_ROW);
          const inRow = idx % SEATS_PER_ROW;
          const a = start + ((end - start) * (inRow + 0.5)) / SEATS_PER_ROW;
          const rx = FIELD_RX + GAP + 8 + row * ROW_STEP;
          const ry = FIELD_RY + GAP + 8 + row * ROW_STEP;
          const p = polar(a, rx, ry);
          return { seat, ...p };
        });

        const mid = (start + end) / 2;
        const labelPos = polar(mid, outerRx + 26, outerRy + 26);

        result.push({ zone, band: { start, end }, labelPos, bandPath, seats });
      });
    }
    return result;
  }, [zones]);

  const canSelect = (seat: MapSeat) => {
    if (seat.status !== 'available') return false;
    if (selectedSeats.includes(seat.id)) return true;
    return selectedSeats.length < maxSeats;
  };

  return (
    <div className="from-slate-100 via-blue-50/20 to-slate-100 w-full rounded-3xl bg-gradient-to-b p-6 shadow-inner lg:p-10">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">{t('title')}</h2>
        <p className="text-gray-600">{t('hint')}</p>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <svg
          viewBox="0 0 1200 900"
          className="h-auto w-full max-w-6xl"
          style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))' }}
          role="img"
          aria-label={t('title')}
        >
          <defs>
            <pattern id="stripePattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#10b981" />
              <rect width="20" height="40" fill="#059669" opacity="0.35" />
            </pattern>
          </defs>

          {/* Stadium bowl (oval or rectangular from the saved config) */}
          {shape === 'oval' ? (
            <>
              <ellipse cx={CX} cy={CY} rx="560" ry="410" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="3" />
              <ellipse
                cx={CX}
                cy={CY}
                rx="535"
                ry="385"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="8,8"
                opacity="0.5"
              />
            </>
          ) : (
            <>
              <rect
                x={CX - 560}
                y={CY - 400}
                width={1120}
                height={800}
                rx="60"
                fill="#f8fafc"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <rect
                x={CX - 535}
                y={CY - 375}
                width={1070}
                height={750}
                rx="48"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="8,8"
                opacity="0.5"
              />
            </>
          )}

          {/* Curved stands hugging the pitch */}
          {placed.map(({ zone, bandPath, seats, labelPos }) => (
            <g key={zone.id}>
              <path
                d={bandPath}
                fill={zone.color}
                opacity="0.15"
                stroke={zone.color}
                strokeWidth="2"
              />

              {seats.map(({ seat, x, y }) => {
                const selected = selectedSeats.includes(seat.id);
                const selectable = canSelect(seat);
                return (
                  <circle
                    key={seat.id}
                    cx={x}
                    cy={y}
                    r={selected ? 7 : 4.5}
                    fill={seatColor(seat, selected, zone.category)}
                    opacity={seat.status === 'sold' ? 0.4 : seat.status === 'locked' ? 0.6 : 1}
                    stroke={selected ? '#16a34a' : '#ffffff'}
                    strokeWidth={selected ? 2.5 : 0.8}
                    style={{
                      cursor: selectable ? 'pointer' : 'not-allowed',
                      transition: 'r 0.15s ease, fill 0.15s ease'
                    }}
                    onClick={() => selectable && onSeatSelect(seat.id)}
                  >
                    <title>
                      {`${zone.name} · ${zone.category} · Block ${zone.block}\n${t('row')} ${seat.rowNumber} - ${t('seat')} ${seat.seatNumber}\n${seat.price} MAD`}
                    </title>
                  </circle>
                );
              })}

              {/* Block + category label outside the curve */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                fill={zone.color}
                fontSize="15"
                fontWeight="bold"
              >
                {zone.block}
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 14}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="10"
              >
                {zone.category}
              </text>
            </g>
          ))}

          {/* Pitch — horizontal ellipse */}
          <g>
            <ellipse
              cx={CX}
              cy={CY}
              rx={FIELD_RX}
              ry={FIELD_RY}
              fill="url(#stripePattern)"
              stroke="#ffffff"
              strokeWidth="4"
            />
            <g stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.9">
              <line x1={CX} y1={CY - FIELD_RY + 12} x2={CX} y2={CY + FIELD_RY - 12} />
              <circle cx={CX} cy={CY} r="50" />
              <circle cx={CX} cy={CY} r="5" fill="#ffffff" />
              {/* Left penalty area */}
              <path d={`M ${CX - FIELD_RX + 8} ${CY - 80} L ${CX - FIELD_RX + 78} ${CY - 80} L ${CX - FIELD_RX + 78} ${CY + 80} L ${CX - FIELD_RX + 8} ${CY + 80}`} />
              <path d={`M ${CX - FIELD_RX + 8} ${CY - 35} L ${CX - FIELD_RX + 38} ${CY - 35} L ${CX - FIELD_RX + 38} ${CY + 35} L ${CX - FIELD_RX + 8} ${CY + 35}`} />
              <circle cx={CX - FIELD_RX + 62} cy={CY} r="4" fill="#ffffff" />
              {/* Right penalty area */}
              <path d={`M ${CX + FIELD_RX - 8} ${CY - 80} L ${CX + FIELD_RX - 78} ${CY - 80} L ${CX + FIELD_RX - 78} ${CY + 80} L ${CX + FIELD_RX - 8} ${CY + 80}`} />
              <path d={`M ${CX + FIELD_RX - 8} ${CY - 35} L ${CX + FIELD_RX - 38} ${CY - 35} L ${CX + FIELD_RX - 38} ${CY + 35} L ${CX + FIELD_RX - 8} ${CY + 35}`} />
              <circle cx={CX + FIELD_RX - 62} cy={CY} r="4" fill="#ffffff" />
            </g>
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              opacity="0.25"
              fontSize="26"
              fontWeight="bold"
              letterSpacing="8"
            >
              {t('pitch')}
            </text>
          </g>
        </svg>
      </div>

      {/* Category legend */}
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
          {t('legend')}
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-3">
            <div className="h-6 w-6 rounded-full border-2 border-white bg-red-600 shadow-lg" />
            <div>
              <p className="text-sm font-bold text-gray-900">CAT 1</p>
              <p className="text-xs text-gray-600">VIP — 500 MAD</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
            <div className="h-6 w-6 rounded-full border-2 border-white bg-blue-600 shadow-lg" />
            <div>
              <p className="text-sm font-bold text-gray-900">CAT 2</p>
              <p className="text-xs text-gray-600">Premium — 250 MAD</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-3">
            <div className="h-6 w-6 rounded-full border-2 border-white bg-green-600 shadow-lg" />
            <div>
              <p className="text-sm font-bold text-gray-900">CAT 3</p>
              <p className="text-xs text-gray-600">Standard — 150 MAD</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
            <div className="h-6 w-6 rounded-full border-2 border-white bg-red-500 opacity-40" />
            <div>
              <p className="text-sm font-bold text-gray-900">{t('sold')}</p>
              <p className="text-xs text-gray-600">{t('locked')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
