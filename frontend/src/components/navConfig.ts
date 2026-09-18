import {
  LayoutDashboard,
  Users,
  Archive,
  MessagesSquare,
  Ruler,
  ListChecks,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Kalau kosong, menu ini selalu tampil untuk siapa pun yang sudah login (mis. Dashboard). */
  permission?: string;
}

// Sidebar dibangun dari daftar ini + permission user yang login, BUKAN dari
// nama role. Kalau admin menambah permission baru ke sebuah role lewat
// panel RBAC, menu ini otomatis menyesuaikan tanpa perlu ubah kode.
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/antrian', label: 'Antrian pasien', icon: Users, permission: 'antrian.view' },
  { path: '/antropometri', label: 'Antropometri', icon: Ruler, permission: 'antropometri.input' },
  { path: '/arsip', label: 'Arsip rekam medis', icon: Archive, permission: 'arsip.view' },
  { path: '/resep', label: 'Pesan resep', icon: MessagesSquare, permission: 'resep.kirim' },
  { path: '/resep', label: 'Resep masuk', icon: MessagesSquare, permission: 'resep.proses' },
  { path: '/lab', label: 'Lab & Radiologi', icon: FlaskConical, permission: 'lab.kelola' },
  { path: '/layanan', label: 'Layanan', icon: ListChecks },
];
