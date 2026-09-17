import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/DashboardPage';
import { AntrianPage } from './pages/AntrianPage';
import { AntropolopoPage } from './pages/AntropolopoPage';
import { RekamMedisPage } from './pages/RekamMedisPage';
import { LabRadiologiPage } from './pages/LabRadiologiPage';
import { ResepPage } from './pages/ResepPage';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/antrian"
          element={
            <ProtectedRoute requiredPermission="antrian.view">
              <AntrianPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/antropometri"
          element={
            <ProtectedRoute requiredPermission="antropometri.view">
              <AntropolopoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rekam-medis"
          element={
            <ProtectedRoute requiredPermission="rekam_medis.view">
              <MainLayout>
                <RekamMedisPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lab-radiologi"
          element={
            <ProtectedRoute requiredPermission="lab.view">
              <MainLayout>
                <LabRadiologiPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resep"
          element={
            <ProtectedRoute requiredPermission="resep.view">
              <MainLayout>
                <ResepPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
