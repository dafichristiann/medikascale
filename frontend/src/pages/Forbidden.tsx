import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <ShieldAlert size={40} className="text-status-red" />
      <h1 className="text-xl font-bold">Akses ditolak</h1>
      <p className="text-slate text-sm max-w-sm">
        Akun Anda tidak memiliki hak akses (permission) untuk membuka halaman ini. Hubungi admin bila menurut Anda ini keliru.
      </p>
      <Link to="/dashboard" className="text-teal-dark font-semibold text-sm underline">
        Kembali ke dashboard
      </Link>
    </div>
  );
}
