import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MOCK_USERS } from '@/data/mockData';
import { USE_MOCK } from '@/api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-navy-deep to-navy-mid">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-9">
        <div className="flex items-center gap-2 font-extrabold text-lg mb-1">
          <span className="w-2.5 h-2.5 rounded bg-teal inline-block" />
          MedikaScale
        </div>
        <p className="text-slate text-sm mb-6">Masuk dengan akun sesuai peran Anda.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="dokter / perawat / apoteker / lab"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-status-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-teal hover:bg-teal-dark text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-60"
          >
            {submitting ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[12px] font-semibold text-slate mb-2.5">Pilih Cepat Akun Demo (Password: demo123):</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Dokter', u: 'dokter' },
              { label: 'Perawat', u: 'perawat' },
              { label: 'Apoteker', u: 'apoteker' },
              { label: 'Lab', u: 'lab' },
              { label: 'Admin', u: 'admin' },
            ].map((acc) => (
              <button
                key={acc.u}
                type="button"
                onClick={() => {
                  setUsername(acc.u);
                  setPassword('demo123');
                }}
                className="text-[11.5px] font-semibold border border-border rounded-lg py-1.5 px-2 hover:border-teal hover:bg-teal-tint transition text-center"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
