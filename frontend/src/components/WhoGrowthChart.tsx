import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

export interface WhoGrowthChartProps {
  gender: 'Laki-laki' | 'Perempuan';
  usiaBulan: number;
  beratBadanKg: number;
  tinggiBadanCm: number;
  lingkarKepalaCm?: number;
  zScores?: {
    bb_u?: number;
    tb_u?: number;
    bb_tb?: number;
    lk_u?: number;
  };
}

type ChartType = 'wfa' | 'lhfa' | 'wfl' | 'hcfa';

interface LMS {
  l: number;
  m: number;
  s: number;
}

const WHO_LMS_DATA = {
  boys: {
    wfa: {
      0: { l: 0.3487, m: 3.3464, s: 0.14602 },
      3: { l: 0.1600, m: 6.4000, s: 0.12500 },
      6: { l: 0.0400, m: 7.9000, s: 0.11500 },
      9: { l: -0.0500, m: 8.9000, s: 0.11000 },
      12: { l: -0.1100, m: 9.6000, s: 0.10800 },
      18: { l: -0.1800, m: 10.9000, s: 0.10600 },
      24: { l: -0.2200, m: 12.2000, s: 0.10500 },
      36: { l: -0.2600, m: 14.3000, s: 0.10800 },
      48: { l: -0.2800, m: 16.3000, s: 0.11200 },
      60: { l: -0.2900, m: 18.3000, s: 0.11700 },
    } as Record<number, LMS>,
    lhfa: {
      0: { l: 1.0000, m: 49.8842, s: 0.03795 },
      3: { l: 1.0000, m: 61.4000, s: 0.03500 },
      6: { l: 1.0000, m: 67.6000, s: 0.03400 },
      9: { l: 1.0000, m: 72.0000, s: 0.03350 },
      12: { l: 1.0000, m: 75.7000, s: 0.03300 },
      18: { l: 1.0000, m: 82.3000, s: 0.03300 },
      24: { l: 1.0000, m: 87.8000, s: 0.03400 },
      36: { l: 1.0000, m: 96.1000, s: 0.03600 },
      48: { l: 1.0000, m: 103.300, s: 0.03800 },
      60: { l: 1.0000, m: 110.000, s: 0.04000 },
    } as Record<number, LMS>,
    hcfa: {
      0: { l: 1.0000, m: 34.5, s: 0.036 },
      3: { l: 1.0000, m: 40.5, s: 0.033 },
      6: { l: 1.0000, m: 43.3, s: 0.032 },
      9: { l: 1.0000, m: 45.0, s: 0.031 },
      12: { l: 1.0000, m: 46.1, s: 0.030 },
      18: { l: 1.0000, m: 47.4, s: 0.029 },
      24: { l: 1.0000, m: 48.3, s: 0.029 },
      36: { l: 1.0000, m: 49.5, s: 0.029 },
      48: { l: 1.0000, m: 50.4, s: 0.029 },
      60: { l: 1.0000, m: 51.1, s: 0.029 },
    } as Record<number, LMS>,
    wfl: {
      45: { l: -0.35, m: 2.4, s: 0.09 },
      55: { l: -0.35, m: 4.5, s: 0.09 },
      65: { l: -0.35, m: 7.2, s: 0.09 },
      75: { l: -0.35, m: 9.6, s: 0.09 },
      80: { l: -0.35, m: 10.6, s: 0.09 },
      85: { l: -0.35, m: 11.8, s: 0.09 },
      90: { l: -0.35, m: 13.0, s: 0.092 },
      100: { l: -0.35, m: 15.6, s: 0.095 },
      110: { l: -0.35, m: 18.5, s: 0.10 },
    } as Record<number, LMS>,
  },
  girls: {
    wfa: {
      0: { l: 0.3809, m: 3.2322, s: 0.14171 },
      3: { l: 0.1900, m: 5.8000, s: 0.12300 },
      6: { l: 0.0800, m: 7.3000, s: 0.11400 },
      9: { l: 0.0000, m: 8.2000, s: 0.11100 },
      12: { l: -0.0600, m: 8.9000, s: 0.11000 },
      18: { l: -0.1400, m: 10.2000, s: 0.11000 },
      24: { l: -0.2000, m: 11.5000, s: 0.11100 },
      36: { l: -0.2600, m: 13.9000, s: 0.11600 },
      48: { l: -0.2900, m: 16.1000, s: 0.12300 },
      60: { l: -0.3000, m: 18.2000, s: 0.13000 },
    } as Record<number, LMS>,
    lhfa: {
      0: { l: 1.0000, m: 49.1477, s: 0.03790 },
      3: { l: 1.0000, m: 59.8000, s: 0.03500 },
      6: { l: 1.0000, m: 65.7000, s: 0.03400 },
      9: { l: 1.0000, m: 70.1000, s: 0.03350 },
      12: { l: 1.0000, m: 74.0000, s: 0.03350 },
      18: { l: 1.0000, m: 80.7000, s: 0.03400 },
      24: { l: 1.0000, m: 86.4000, s: 0.03500 },
      36: { l: 1.0000, m: 95.1000, s: 0.03700 },
      48: { l: 1.0000, m: 102.700, s: 0.03900 },
      60: { l: 1.0000, m: 109.400, s: 0.04100 },
    } as Record<number, LMS>,
    hcfa: {
      0: { l: 1.0000, m: 33.9, s: 0.035 },
      3: { l: 1.0000, m: 39.5, s: 0.032 },
      6: { l: 1.0000, m: 42.2, s: 0.031 },
      9: { l: 1.0000, m: 43.8, s: 0.030 },
      12: { l: 1.0000, m: 44.9, s: 0.029 },
      18: { l: 1.0000, m: 46.2, s: 0.029 },
      24: { l: 1.0000, m: 47.2, s: 0.029 },
      36: { l: 1.0000, m: 48.5, s: 0.029 },
      48: { l: 1.0000, m: 49.5, s: 0.029 },
      60: { l: 1.0000, m: 50.3, s: 0.029 },
    } as Record<number, LMS>,
    wfl: {
      45: { l: -0.38, m: 2.3, s: 0.09 },
      55: { l: -0.38, m: 4.3, s: 0.09 },
      65: { l: -0.38, m: 6.8, s: 0.09 },
      75: { l: -0.38, m: 9.1, s: 0.09 },
      80: { l: -0.38, m: 10.1, s: 0.09 },
      85: { l: -0.38, m: 11.3, s: 0.09 },
      90: { l: -0.38, m: 12.6, s: 0.093 },
      100: { l: -0.38, m: 15.3, s: 0.098 },
      110: { l: -0.38, m: 18.2, s: 0.105 },
    } as Record<number, LMS>,
  },
};

function calculateValueFromZ(z: number, lms: LMS): number {
  if (Math.abs(lms.l) < 0.01) {
    return lms.m * Math.exp(lms.s * z);
  }
  const base = 1 + lms.l * lms.s * z;
  if (base <= 0) return lms.m;
  return lms.m * Math.pow(base, 1 / lms.l);
}

function interpolateLMS(table: Record<number, LMS>, x: number): LMS {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (x <= keys[0]) return table[keys[0]];
  if (x >= keys[keys.length - 1]) return table[keys[keys.length - 1]];

  let lower = keys[0];
  let upper = keys[keys.length - 1];

  for (let i = 0; i < keys.length - 1; i++) {
    if (x >= keys[i] && x <= keys[i + 1]) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }

  const fraction = (x - lower) / (upper - lower);
  const l1 = table[lower];
  const l2 = table[upper];

  return {
    l: l1.l + fraction * (l2.l - l1.l),
    m: l1.m + fraction * (l2.m - l1.m),
    s: l1.s + fraction * (l2.s - l1.s),
  };
}

export default function WhoGrowthChart({
  gender,
  usiaBulan,
  beratBadanKg,
  tinggiBadanCm,
  lingkarKepalaCm,
  zScores,
}: WhoGrowthChartProps) {
  const [activeTab, setActiveTab] = useState<ChartType>('wfa');

  const isBoy = gender === 'Laki-laki';
  const tableSet = isBoy ? WHO_LMS_DATA.boys : WHO_LMS_DATA.girls;

  // Chart configuration based on active tab
  let xLabel = 'Usia (Bulan)';
  let yLabel = 'Berat Badan (kg)';
  let xMin = 0;
  let xMax = 60;
  let yMin = 0;
  let yMax = 26;
  let currentX = usiaBulan;
  let currentY = beratBadanKg;
  let currentZ = zScores?.bb_u;
  let xTicks = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
  let yTicks = [0, 5, 10, 15, 20, 25];
  let currentLmsTable = tableSet.wfa;

  if (activeTab === 'lhfa') {
    xLabel = 'Usia (Bulan)';
    yLabel = 'Panjang/Tinggi Badan (cm)';
    xMin = 0;
    xMax = 60;
    yMin = 45;
    yMax = 125;
    currentX = usiaBulan;
    currentY = tinggiBadanCm;
    currentZ = zScores?.tb_u;
    xTicks = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
    yTicks = [50, 60, 70, 80, 90, 100, 110, 120];
    currentLmsTable = tableSet.lhfa;
  } else if (activeTab === 'wfl') {
    xLabel = 'Panjang/Tinggi Badan (cm)';
    yLabel = 'Berat Badan (kg)';
    xMin = 45;
    xMax = 110;
    yMin = 2;
    yMax = 25;
    currentX = tinggiBadanCm;
    currentY = beratBadanKg;
    currentZ = zScores?.bb_tb;
    xTicks = [45, 55, 65, 75, 85, 95, 105, 110];
    yTicks = [2, 6, 10, 14, 18, 22];
    currentLmsTable = tableSet.wfl;
  } else if (activeTab === 'hcfa') {
    xLabel = 'Usia (Bulan)';
    yLabel = 'Lingkar Kepala (cm)';
    xMin = 0;
    xMax = 60;
    yMin = 30;
    yMax = 55;
    currentX = usiaBulan;
    currentY = lingkarKepalaCm || 0;
    currentZ = zScores?.lk_u;
    xTicks = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];
    yTicks = [32, 36, 40, 44, 48, 52];
    currentLmsTable = tableSet.hcfa;
  }

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 300;
  const padLeft = 55;
  const padRight = 35;
  const padTop = 25;
  const padBottom = 40;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const mapX = (x: number) => padLeft + ((x - xMin) / (xMax - xMin)) * chartWidth;
  const mapY = (y: number) => padTop + chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight;

  // Generate sample points for smooth curve
  const sampleCount = 40;
  const xStep = (xMax - xMin) / sampleCount;
  const sampleXList = Array.from({ length: sampleCount + 1 }, (_, i) => xMin + i * xStep);

  const getPointsForZ = (z: number) => {
    return sampleXList.map((x) => {
      const lms = interpolateLMS(currentLmsTable, x);
      const val = calculateValueFromZ(z, lms);
      return { x, y: val, px: mapX(x), py: mapY(val) };
    });
  };

  const pointsP3 = getPointsForZ(3);
  const pointsP2 = getPointsForZ(2);
  const pointsMedian = getPointsForZ(0);
  const pointsM2 = getPointsForZ(-2);
  const pointsM3 = getPointsForZ(-3);

  const buildPath = (pts: { px: number; py: number }[]) => {
    return pts.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.px.toFixed(1)},${pt.py.toFixed(1)}`, '');
  };

  // Build polygon path between -2 SD and +2 SD (Standard Normal Green Zone)
  const buildNormalBand = () => {
    const top = pointsP2;
    const bottom = [...pointsM2].reverse();
    const all = [...top, ...bottom];
    return buildPath(all) + ' Z';
  };

  // Patient point coordinates
  const patientPx = mapX(Math.min(Math.max(currentX, xMin), xMax));
  const patientPy = mapY(Math.min(Math.max(currentY, yMin), yMax));
  const isOutOfRange = currentX < xMin || currentX > xMax || currentY < yMin || currentY > yMax;

  return (
    <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[14px] text-ink flex items-center gap-1.5">
              <Sparkles size={16} className="text-teal" />
              Kurva Pertumbuhan WHO LMS (KMS Digital)
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isBoy ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {isBoy ? '♂ Anak Laki-Laki' : '♀ Anak Perempuan'}
            </span>
          </div>
          <p className="text-xs text-slate mt-0.5">
            Plot kurva standar deviasi WHO (-3 SD s/d +3 SD). Titik biru berdenyut menandakan posisi anak saat ini.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wfa')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'wfa' ? 'bg-white text-teal shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            BB / U
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lhfa')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'lhfa' ? 'bg-white text-teal shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            TB / U
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wfl')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'wfl' ? 'bg-white text-teal shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            BB / TB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hcfa')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'hcfa' ? 'bg-white text-teal shadow-xs' : 'text-slate-600 hover:text-ink'
            }`}
          >
            LK / U
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[550px] max-h-[300px] select-none">
          <defs>
            {/* Soft green gradient for normal zone */}
            <linearGradient id="normalZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          {yTicks.map((yVal) => {
            const py = mapY(yVal);
            return (
              <g key={`y-${yVal}`}>
                <line x1={padLeft} y1={py} x2={svgWidth - padRight} y2={py} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padLeft - 8} y={py + 4} fontSize="10" fill="#64748b" textAnchor="end" fontFamily="sans-serif">
                  {yVal}
                </text>
              </g>
            );
          })}

          {xTicks.map((xVal) => {
            const px = mapX(xVal);
            return (
              <g key={`x-${xVal}`}>
                <line x1={px} y1={padTop} x2={px} y2={padTop + chartHeight} stroke="#f1f5f9" strokeWidth="1" />
                <text x={px} y={padTop + chartHeight + 16} fontSize="10" fill="#64748b" textAnchor="middle" fontFamily="sans-serif">
                  {xVal}
                </text>
              </g>
            );
          })}

          {/* Normal Zone Shade (-2 SD s/d +2 SD) */}
          <path d={buildNormalBand()} fill="url(#normalZoneGrad)" />

          {/* SD Lines */}
          {/* +3 SD */}
          <path d={buildPath(pointsP3)} fill="none" stroke="#f97316" strokeWidth="1.2" strokeDasharray="4 2" />
          <text
            x={pointsP3[pointsP3.length - 1].px + 4}
            y={pointsP3[pointsP3.length - 1].py + 3}
            fontSize="9"
            fill="#f97316"
            fontFamily="monospace"
            fontWeight="bold"
          >
            +3 SD
          </text>

          {/* +2 SD */}
          <path d={buildPath(pointsP2)} fill="none" stroke="#eab308" strokeWidth="1.4" />
          <text
            x={pointsP2[pointsP2.length - 1].px + 4}
            y={pointsP2[pointsP2.length - 1].py + 3}
            fontSize="9"
            fill="#ca8a04"
            fontFamily="monospace"
            fontWeight="bold"
          >
            +2 SD
          </text>

          {/* Median (0 SD) */}
          <path d={buildPath(pointsMedian)} fill="none" stroke="#10b981" strokeWidth="2.5" />
          <text
            x={pointsMedian[pointsMedian.length - 1].px + 4}
            y={pointsMedian[pointsMedian.length - 1].py + 3}
            fontSize="9.5"
            fill="#059669"
            fontFamily="monospace"
            fontWeight="bold"
          >
            0 (Med)
          </text>

          {/* -2 SD */}
          <path d={buildPath(pointsM2)} fill="none" stroke="#eab308" strokeWidth="1.4" />
          <text
            x={pointsM2[pointsM2.length - 1].px + 4}
            y={pointsM2[pointsM2.length - 1].py + 3}
            fontSize="9"
            fill="#ca8a04"
            fontFamily="monospace"
            fontWeight="bold"
          >
            -2 SD
          </text>

          {/* -3 SD */}
          <path d={buildPath(pointsM3)} fill="none" stroke="#ef4444" strokeWidth="1.4" strokeDasharray="4 2" />
          <text
            x={pointsM3[pointsM3.length - 1].px + 4}
            y={pointsM3[pointsM3.length - 1].py + 3}
            fontSize="9"
            fill="#ef4444"
            fontFamily="monospace"
            fontWeight="bold"
          >
            -3 SD
          </text>

          {/* Axis Labels */}
          <text
            x={padLeft + chartWidth / 2}
            y={svgHeight - 6}
            fontSize="11"
            fill="#475569"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {xLabel}
          </text>
          <text
            transform={`rotate(-90 ${16} ${padTop + chartHeight / 2})`}
            x={16}
            y={padTop + chartHeight / 2}
            fontSize="11"
            fill="#475569"
            fontWeight="600"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {yLabel}
          </text>

          {/* Plotted Patient Point (Active Marker) */}
          {currentY > 0 && !isOutOfRange && (
            <g className="animate-pulse">
              {/* Reference crosshair lines */}
              <line
                x1={patientPx}
                y1={padTop + chartHeight}
                x2={patientPx}
                y2={patientPy}
                stroke="#0284c7"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              <line
                x1={padLeft}
                y1={patientPy}
                x2={patientPx}
                y2={patientPy}
                stroke="#0284c7"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />

              {/* Pulsing ring */}
              <circle cx={patientPx} cy={patientPy} r="9" fill="#0284c7" opacity="0.25" />
              <circle cx={patientPx} cy={patientPy} r="5.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />

              {/* Point tooltip callout */}
              <g transform={`translate(${patientPx < svgWidth - 120 ? patientPx + 8 : patientPx - 110}, ${patientPy - 12})`}>
                <rect x="0" y="-12" width="105" height="22" rx="4" fill="#0f172a" opacity="0.9" />
                <text x="5" y="2" fontSize="9.5" fill="#ffffff" fontWeight="bold" fontFamily="sans-serif">
                  {currentX} · {currentY} ({currentZ !== undefined ? `${currentZ} SD` : '-'})
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & Guide Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500 inline-block" />
            <span>Zona Normal (-2 s/d +2 SD)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400 inline-block" />
            <span>Garis Batas -2 / +2 SD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-red-500 inline-block" />
            <span>Batas Kritis -3 / +3 SD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 border border-white inline-block" />
            <span className="font-semibold text-ink">Titik Pasien Saat Ini</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-500 italic">
          <Info size={12} />
          <span>Standar Baku WHO Child Growth Standard</span>
        </div>
      </div>
    </div>
  );
}
