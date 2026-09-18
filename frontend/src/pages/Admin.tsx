import { useEffect, useState } from 'react';
import {
  Shield,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
} from 'lucide-react';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUserStatus,
  updateAdminUserRole,
  fetchAdminRoles,
  fetchAdminPermissions,
  updateRolePermissions,
} from '@/api/admin';
import type { AdminUser, AdminRole, Permission } from '@/types';

export default function Admin() {
  const [tab, setTab] = useState<'users' | 'matrix'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // Modal Tambah User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUser, setFormUser] = useState({
    nama: '',
    username: '',
    password: '',
    email: '',
    role_id: 2,
    no_telepon: '',
  });

  // Role Permissions Editing State: Record<roleId, Set<permissionId>>
  const [rolePermMap, setRolePermMap] = useState<Record<number, Set<number>>>({});
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, r, p] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminRoles(),
        fetchAdminPermissions(),
      ]);
      setUsers(u);
      setRoles(r);
      setPermissions(p);

      const mapping: Record<number, Set<number>> = {};
      r.forEach((role) => {
        mapping[role.id] = new Set(role.permissions.map((perm) => perm.id));
      });
      setRolePermMap(mapping);
    } catch (err: any) {
      setPesanError(err?.response?.data?.message || 'Gagal memuat data administrasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    setPesanError(null);
    setPesanSukses(null);
    try {
      const updated = await updateAdminUserStatus(user.id, !user.aktif);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, aktif: updated.aktif } : u)));
      setPesanSukses(`Status pengguna ${user.nama} berhasil diperbarui.`);
    } catch (err: any) {
      setPesanError(err?.response?.data?.message || 'Gagal memperbarui status pengguna.');
    }
  };

  const handleChangeRole = async (userId: number, newRoleId: number) => {
    setPesanError(null);
    setPesanSukses(null);
    try {
      const updated = await updateAdminUserRole(userId, newRoleId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? (updated as any) : u)));
      setPesanSukses('Role pengguna berhasil diperbarui.');
    } catch (err: any) {
      setPesanError(err?.response?.data?.message || 'Gagal mengubah role pengguna.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError(null);
    setPesanSukses(null);
    try {
      const newUser = await createAdminUser(formUser);
      setUsers((prev) => [...prev, newUser]);
      setIsModalOpen(false);
      setFormUser({
        nama: '',
        username: '',
        password: '',
        email: '',
        role_id: 2,
        no_telepon: '',
      });
      setPesanSukses(`Pengguna ${newUser.nama} berhasil ditambahkan.`);
    } catch (err: any) {
      setPesanError(err?.response?.data?.message || 'Gagal membuat pengguna baru.');
    }
  };

  const handleTogglePermission = (roleId: number, permissionId: number) => {
    setRolePermMap((prev) => {
      const currentSet = new Set(prev[roleId] || []);
      if (currentSet.has(permissionId)) {
        currentSet.delete(permissionId);
      } else {
        currentSet.add(permissionId);
      }
      return { ...prev, [roleId]: currentSet };
    });
  };

  const handleSaveRolePermissions = async (roleId: number) => {
    setSavingRoleId(roleId);
    setPesanError(null);
    setPesanSukses(null);
    try {
      const permIds = Array.from(rolePermMap[roleId] || []);
      await updateRolePermissions(roleId, permIds);
      setPesanSukses('Matriks hak akses role berhasil disimpan ke database.');
    } catch (err: any) {
      setPesanError(err?.response?.data?.message || 'Gagal menyimpan hak akses role.');
    } finally {
      setSavingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="text-teal-dark" size={24} />
            Kelola Administrasi &amp; Akses Sistem
          </h2>
          <p className="text-slate text-[13.5px]">
            Manajemen akun staf medis, penugasan role, dan konfigurasi matriks granular RBAC.
          </p>
        </div>
        {tab === 'users' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm self-start"
          >
            <UserPlus size={16} /> Tambah Staf Baru
          </button>
        )}
      </div>

      {pesanSukses && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" />
          {pesanSukses}
        </div>
      )}

      {pesanError && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600" />
          {pesanError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setTab('users')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            tab === 'users'
              ? 'border-teal-dark text-teal-dark'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <Users size={17} /> Daftar Pengguna ({users.length})
        </button>
        <button
          onClick={() => setTab('matrix')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            tab === 'matrix'
              ? 'border-teal-dark text-teal-dark'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          <Shield size={17} /> Matriks Hak Akses (RBAC)
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate text-sm">Memuat data administrasi…</div>
      ) : tab === 'users' ? (
        <div className="bg-white border border-border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11.5px] uppercase text-slate border-b border-border bg-slate-50">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role Jabatan</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4 text-center">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-ink">{u.nama}</td>
                  <td className="py-3 px-4 font-mono text-slate">{u.username}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role_id}
                      onChange={(e) => handleChangeRole(u.id, Number(e.target.value))}
                      className="border border-border rounded-md px-2 py-1 text-xs bg-white focus:outline-none focus:border-teal"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nama_tampil}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate">
                    {u.email || u.no_telepon || '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        u.aktif
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {u.aktif ? (
                        <>
                          <CheckCircle size={12} /> Aktif
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Nonaktif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className="text-xs font-medium text-slate hover:text-ink underline"
                    >
                      {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* RBAC Matrix Tab */
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg p-3">
            <b>Pemberitahuan:</b> Perubahan pada matriks permission di bawah ini langsung mengontrol otorisasi backend NestJS melalui <code>PermissionsGuard</code>. Pastikan untuk menekan tombol <b>Simpan</b> pada role yang dimodifikasi.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const assignedCount = (rolePermMap[role.id] || new Set()).size;
              const isSaving = savingRoleId === role.id;

              return (
                <div
                  key={role.id}
                  className="bg-white border border-border rounded-xl shadow-sm flex flex-col justify-between"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="font-bold text-ink text-sm">{role.nama_tampil}</h3>
                      <span className="text-[11px] text-slate font-mono">
                        Kode: {role.kode} · {assignedCount} izin aktif
                      </span>
                    </div>
                    {role.is_system && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        Sistem
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
                    {permissions.map((perm) => {
                      const isChecked = Boolean(rolePermMap[role.id]?.has(perm.id));
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-2.5 text-xs text-slate-700 hover:text-ink cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(role.id, perm.id)}
                            className="mt-0.5 rounded border-slate-300 text-teal focus:ring-teal"
                          />
                          <div>
                            <span className="font-mono font-medium text-[11.5px] text-teal-dark">
                              {perm.kode}
                            </span>
                            <p className="text-[11px] text-slate-500">{perm.deskripsi || perm.modul}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div className="p-3 border-t border-border bg-slate-50/50 flex justify-end">
                    <button
                      onClick={() => handleSaveRolePermissions(role.id)}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 bg-teal hover:bg-teal-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save size={13} /> {isSaving ? 'Menyimpan…' : 'Simpan Izin'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Tambah User Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-border w-full max-w-md p-6">
            <h3 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-teal-dark" /> Tambah Staf Baru
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  placeholder="dr. Anita Permata, Sp.A"
                  value={formUser.nama}
                  onChange={(e) => setFormUser({ ...formUser, nama: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="dokter_anita"
                    value={formUser.username}
                    onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 karakter"
                    value={formUser.password}
                    onChange={(e) => setFormUser({ ...formUser, password: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Jabatan</label>
                <select
                  value={formUser.role_id}
                  onChange={(e) => setFormUser({ ...formUser, role_id: Number(e.target.value) })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nama_tampil} ({r.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="anita@medikascale.id"
                    value={formUser.email}
                    onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formUser.no_telepon}
                    onChange={(e) => setFormUser({ ...formUser, no_telepon: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm text-slate hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  Simpan Staf
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
