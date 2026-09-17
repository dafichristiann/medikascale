import { useAuthStore } from '../../store/authStore';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b border-[#e7ebf1] bg-white px-6 py-4 shadow-[0_2px_10px_rgba(28,45,72,.04)]">
      <div className="flex items-center justify-between">
        <div className="app-brand flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">🏥</span>
          <h1 className="text-xl font-semibold text-gray-900">MedikaScale</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs capitalize text-gray-500">{user?.role_id}</p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
