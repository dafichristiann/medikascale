import { MainLayout } from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import { DokterDashboard } from '../components/dashboard/DokterDashboard';
import { PerawatDashboard } from '../components/dashboard/PerawatDashboard';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <MainLayout>
      {(user?.role_id === 'dokter' || user?.role_id === 'admin') && <DokterDashboard />}
      {user?.role_id === 'perawat' && <PerawatDashboard />}
      {!user?.role_id && (
        <div className="text-center py-8 text-gray-600">Role tidak dikenali</div>
      )}
    </MainLayout>
  );
};
