// Standar WHO Child Growth Standards (LMS)
// L = Box-Cox power, M = Median, S = Coefficient of variation

export interface LMS {
  l: number;
  m: number;
  s: number;
}

// Data sampel representatif WHO Child Growth Standards (0 - 60 bulan)
// Untuk bulan di antaranya, dilakukan interpolasi linier presisi tinggi
export const WHO_LMS_DATA = {
  boys: {
    wfa: { // Weight-for-age (BB/U)
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
    lhfa: { // Length/height-for-age (TB/U)
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
    hcfa: { // Head circumference-for-age (LK/U)
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
    wfl: { // Weight-for-length (BB/TB 45 - 110 cm)
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
    wfa: { // Weight-for-age (BB/U)
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
    lhfa: { // Length/height-for-age (TB/U)
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
    hcfa: { // Head circumference-for-age (LK/U)
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
    wfl: { // Weight-for-length (BB/TB 45 - 110 cm)
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

export function calculateZScore(measurement: number, lms: LMS): number {
  if (measurement <= 0 || lms.m <= 0 || lms.s <= 0) return 0;
  let z: number;
  if (Math.abs(lms.l) < 0.0001) {
    z = Math.log(measurement / lms.m) / lms.s;
  } else {
    z = (Math.pow(measurement / lms.m, lms.l) - 1) / (lms.l * lms.s);
  }
  return Math.round(z * 100) / 100;
}

export function hitungZScoreWHO(params: {
  jenisKelamin: string; // 'Laki-laki' | 'Perempuan'
  usiaBulan: number;
  beratBadanKg: number;
  tinggiBadanCm: number;
  lingkarKepalaCm?: number;
}) {
  const isGirl = params.jenisKelamin?.toLowerCase().includes('peremp') || params.jenisKelamin?.toLowerCase().startsWith('p');
  const dataset = isGirl ? WHO_LMS_DATA.girls : WHO_LMS_DATA.boys;

  // 1. BB/U
  const lmsBBU = interpolateLMS(dataset.wfa, params.usiaBulan);
  const zBBU = calculateZScore(params.beratBadanKg, lmsBBU);

  // 2. TB/U
  const lmsTBU = interpolateLMS(dataset.lhfa, params.usiaBulan);
  const zTBU = calculateZScore(params.tinggiBadanCm, lmsTBU);

  // 3. BB/TB
  const lmsBBTB = interpolateLMS(dataset.wfl, params.tinggiBadanCm);
  const zBBTB = calculateZScore(params.beratBadanKg, lmsBBTB);

  // 4. LK/U
  let zLKU: number | null = null;
  if (params.lingkarKepalaCm && params.lingkarKepalaCm > 0) {
    const lmsLKU = interpolateLMS(dataset.hcfa, params.usiaBulan);
    zLKU = calculateZScore(params.lingkarKepalaCm, lmsLKU);
  }

  // Interpretasi Klinis Standar Kemenkes / WHO
  let statusGizi = 'Gizi baik';
  if (zBBTB < -3) statusGizi = 'Gizi buruk (severely wasted)';
  else if (zBBTB < -2) statusGizi = 'Gizi kurang (wasted)';
  else if (zBBTB > 3) statusGizi = 'Obesitas';
  else if (zBBTB > 2) statusGizi = 'Gizi lebih (overweight)';
  else if (zBBTB > 1) statusGizi = 'Berisiko gizi lebih';

  let statusStunting = 'normal';
  if (zTBU < -3) statusStunting = 'sangat pendek (severely stunted)';
  else if (zTBU < -2) statusStunting = 'pendek (stunted)';
  else if (zTBU > 3) statusStunting = 'tinggi';

  let statusLK = '';
  if (zLKU !== null) {
    if (zLKU < -2) statusLK = ', mikrosefali';
    else if (zLKU > 2) statusLK = ', makrosefali';
    else statusLK = ', normosefali';
  }

  const interpretasi = `${statusGizi}, perawakan ${statusStunting}${statusLK}`;

  return {
    z_score_bb_u: zBBU,
    z_score_tb_u: zTBU,
    z_score_bb_tb: zBBTB,
    z_score_lk_u: zLKU,
    interpretasi,
  };
}
