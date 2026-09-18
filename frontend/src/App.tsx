import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AppLayout from '@/layouts/AppLayout';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Antrian from '@/pages/Antrian';
import Arsip from '@/pages/Arsip';
import Resep from '@/pages/Resep';
import Antropometri from '@/pages/Antropometri';
import Layanan from '@/pages/Layanan';
import Lab from '@/pages/Lab';
import Admin from '@/pages/Admin';
import Forbidden from '@/pages/Forbidden';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/antrian"
              element={
                <ProtectedRoute requirePermission="antrian.view">
                  <Antrian />
                </ProtectedRoute>
              }
            />
            <Route
              path="/arsip"
              element={
                <ProtectedRoute requirePermission="arsip.view">
                  <Arsip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resep"
              element={
                <ProtectedRoute requireAnyPermission={['resep.kirim', 'resep.proses']}>
                  <Resep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/antropometri"
              element={
                <ProtectedRoute requirePermission="antropometri.input">
                  <Antropometri />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab"
              element={
                <ProtectedRoute requirePermission="lab.kelola">
                  <Lab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requirePermission="admin.kelola">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/layanan" element={<Layanan />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
