import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AppLayout from '@/layouts/AppLayout';

import DemoRoleSelector from '@/pages/DemoRoleSelector';
import Dashboard from '@/pages/Dashboard';
import Antrian from '@/pages/Antrian';
import Arsip from '@/pages/Arsip';
import Resep from '@/pages/Resep';
import Antropometri from '@/pages/Antropometri';
import Layanan from '@/pages/Layanan';
import Lab from '@/pages/Lab';
import Admin from '@/pages/Admin';
import Forbidden from '@/pages/Forbidden';
import Sophi from '@/pages/Sophi';
import Vaksin from '@/pages/Vaksin';
import TumbuhKembang from '@/pages/TumbuhKembang';
import DenverIi from '@/pages/DenverIi';
import KonsultasiMakan from '@/pages/KonsultasiMakan';
import ResepFormPage from '@/pages/ResepFormPage';
import ResepListPage from '@/pages/ResepListPage';
import ResepDetailPage from '@/pages/ResepDetailPage';
import LabOrderPage from '@/pages/LabOrderPage';
import LabProcessPage from '@/pages/LabProcessPage';
import LabReviewPage from '@/pages/LabReviewPage';
import ArsipLokasiPage from '@/pages/ArsipLokasiPage';
import ArsipMapPage from '@/pages/ArsipMapPage';
import ArsipPinjamPage from '@/pages/ArsipPinjamPage';
import ArsipHistoryPage from '@/pages/ArsipHistoryPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/demo-role" element={<DemoRoleSelector />} />
          <Route path="/login" element={<Navigate to="/demo-role" replace />} />
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
                  <Navigate to="/arsip/map" replace />
                </ProtectedRoute>
              }
            />
            <Route path="/arsip/map" element={<ProtectedRoute requirePermission="arsip.view"><ArsipMapPage /></ProtectedRoute>} />
            <Route path="/arsip/lokasi" element={<ProtectedRoute requirePermission="arsip.manage"><ArsipLokasiPage /></ProtectedRoute>} />
            <Route path="/arsip/peminjaman" element={<ProtectedRoute requireAnyPermission={['arsip.pinjam', 'arsip.kembalikan']}><ArsipPinjamPage /></ProtectedRoute>} />
            <Route path="/arsip/riwayat" element={<ProtectedRoute requirePermission="arsip.view"><ArsipHistoryPage /></ProtectedRoute>} />
            <Route
              path="/resep"
              element={
                <ProtectedRoute requireAnyPermission={['resep.view', 'resep.process']}>
                  <ResepListPage />
                </ProtectedRoute>
              }
            />
            <Route path="/resep/baru" element={<ProtectedRoute requireAnyPermission={['resep.create', 'resep.send']}><ResepFormPage /></ProtectedRoute>} />
            <Route path="/resep/:id" element={<ProtectedRoute requirePermission="resep.view"><ResepDetailPage /></ProtectedRoute>} />
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
                  <Navigate to="/pemeriksaan" replace />
                </ProtectedRoute>
              }
            />
            <Route path="/pemeriksaan" element={<ProtectedRoute requireAnyPermission={['pemeriksaan.view', 'pemeriksaan.process']}><LabProcessPage /></ProtectedRoute>} />
            <Route path="/pemeriksaan/permintaan" element={<ProtectedRoute requirePermission="pemeriksaan.create"><LabOrderPage /></ProtectedRoute>} />
            <Route path="/pemeriksaan/:id/review" element={<ProtectedRoute requireAnyPermission={['pemeriksaan.process', 'pemeriksaan.review']}><LabReviewPage /></ProtectedRoute>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requirePermission="admin.kelola">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/layanan" element={<Layanan />} />
            <Route
              path="/sophi"
              element={
                <ProtectedRoute requirePermission="sophi.view">
                  <Sophi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vaksin"
              element={
                <ProtectedRoute requirePermission="vaksin.view">
                  <Vaksin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tumbuh-kembang"
              element={
                <ProtectedRoute requirePermission="tumbuh_kembang.view">
                  <TumbuhKembang />
                </ProtectedRoute>
              }
            />
            <Route
              path="/denver-ii"
              element={
                <ProtectedRoute requirePermission="denver_ii.view">
                  <DenverIi />
                </ProtectedRoute>
              }
            />
            <Route
              path="/konsultasi-makan"
              element={
                <ProtectedRoute requirePermission="konsultasi_makan.view">
                  <KonsultasiMakan />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/demo-role" replace />} />
          <Route path="*" element={<Navigate to="/demo-role" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
