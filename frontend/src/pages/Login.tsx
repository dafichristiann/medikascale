import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Plus } from 'lucide-react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f7fc] px-4 py-8">
      <div className="login-shell w-full max-w-[430px] rounded-2xl border border-[#e4eaf2] bg-white p-8 shadow-[0_20px_55px_rgba(33,67,109,.1)] sm:p-10">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e7f1ff] text-[#2778e6]"><Plus size={30} strokeWidth={2.4} /></div>
          <h1 className="text-3xl font-bold text-blue-600">🏥 MedikaScale</h1>
          <p className="mt-2 text-sm text-[#718096]">Sistem manajemen klinik anak yang terintegrasi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              disabled={loading}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              disabled={loading}
              className="mt-1 w-full"
            />
          </div>

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Memproses...' : 'Masuk ke akun'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Demo: <code>dokter</code> / <code>dokter123</code> · <code>perawat</code> / <code>perawat123</code>
        </p>
      </div>
    </div>
  );
};
