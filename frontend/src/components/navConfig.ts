import {
  LayoutDashboard,
  Users,
  Archive,
  Brain,
  MessagesSquare,
  Ruler,
  ListChecks,
  FlaskConical,
  Shield,
  TrendingUp,
  Activity,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Kalau kosong, menu ini selalu tampil untuk siapa pun yang sudah login (mis. Dashboard). */
  permission?: string;
  /** Judul kelompok navigasi opsional. */
  group?: string;
}

// Sidebar dibangun dari daftar ini + permission user yang login, BUKAN dari
// nama role. Kalau admin menambah permission baru ke sebuah role lewat
// panel RBAC, menu ini otomatis menyesuaikan tanpa perlu ubah kode.
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/antrian', label: 'Antrian pasien', icon: Users, permission: 'antrian.view' },
  { path: '/antropometri', label: 'Antropometri', icon: Ruler, permission: 'antropometri.input' },
  { path: '/arsip/map', label: 'Arsip rekam medis', icon: Archive, permission: 'arsip.view' },
  { path: '/resep/baru', label: 'Buat e-Resep', icon: MessagesSquare, permission: 'resep.create' },
  { path: '/resep', label: 'Resep masuk', icon: MessagesSquare, permission: 'resep.proses' },
  { path: '/pemeriksaan', label: 'Lab & Radiologi', icon: FlaskConical, permission: 'pemeriksaan.view' },
  { path: '/layanan', label: 'Layanan', icon: ListChecks },
  {
    path: '/sophi',
    label: 'SOPHI',
    icon: Brain,
    permission: 'sophi.view',
    group: 'Klinik & Tumbuh Kembang',
  },
  {
    path: '/vaksin',
    label: 'Vaksin',
    icon: Shield,
    permission: 'vaksin.view',
    group: 'Klinik & Tumbuh Kembang',
  },
  {
    path: '/tumbuh-kembang',
    label: 'Konsultasi tumbuh kembang',
    icon: TrendingUp,
    permission: 'tumbuh_kembang.view',
    group: 'Klinik & Tumbuh Kembang',
  },
  {
    path: '/denver-ii',
    label: 'Denver II',
    icon: Activity,
    permission: 'denver_ii.view',
    group: 'Klinik & Tumbuh Kembang',
  },
  {
    path: '/konsultasi-makan',
    label: 'Konsultasi makan',
    icon: Utensils,
    permission: 'konsultasi_makan.view',
    group: 'Klinik & Tumbuh Kembang',
  },
  { path: '/admin', label: 'Kelola Admin', icon: Shield, permission: 'admin.kelola' },
];
