// Automated End-to-End Test Suite for MedikaScale Backend (Phase 2 & 3 Full Verification)
const { Client } = require('pg');

async function runTests() {
  const BASE_URL = 'http://localhost:3000/api';
  console.log('🧪 Starting MedikaScale Phase 3 End-to-End Verification Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test Login Dokter
    console.log('1. Testing POST /auth/login (Dokter)');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'dokter', password: 'demo123' }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Login status 200 OK');
    assert(typeof loginData.token === 'string', 'JWT token returned');
    assert(loginData.user.username === 'dokter', 'User username matches');
    assert(Array.isArray(loginData.user.permissions), 'user.permissions is array');
    assert(loginData.user.permissions.includes('antrian.view'), 'Permissions include antrian.view');
    assert(loginData.user.permissions.includes('antrian.ubah_status'), 'Permissions include antrian.ubah_status');
    const dokterToken = loginData.token;

    // 2. Test Login Perawat
    console.log('\n2. Testing POST /auth/login (Perawat)');
    const perawatRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'perawat', password: 'demo123' }),
    });
    const perawatData = await perawatRes.json();
    assert(perawatRes.status === 200, 'Perawat login status 200 OK');
    assert(perawatData.user.permissions.includes('antropometri.input'), 'Perawat has antropometri.input');
    assert(perawatData.user.permissions.includes('antrian.prioritaskan'), 'Perawat has antrian.prioritaskan');
    const perawatToken = perawatData.token;

    // 3. Test Login Admin
    console.log('\n3. Testing POST /auth/login (Admin)');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'demo123' }),
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200, 'Admin login status 200 OK');
    assert(adminData.user.permissions.includes('admin.kelola') && adminData.user.permissions.length >= 10, 'Admin has all permissions including admin.kelola');
    const adminToken = adminData.token;

    // 4. Test Login Apoteker & Resep Access
    console.log('\n4. Testing POST /auth/login (Apoteker) & GET /resep');
    const aptRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'apoteker', password: 'demo123' }),
    });
    const aptData = await aptRes.json();
    assert(aptRes.status === 200, 'Apoteker login status 200 OK');
    const apotekerToken = aptData.token;

    const aptResepRes = await fetch(`${BASE_URL}/resep?kunjungan_id=103`, {
      headers: { Authorization: `Bearer ${apotekerToken}` },
    });
    assert(aptResepRes.status === 200, 'Apoteker can access GET /resep without 403 Forbidden');
    const aptResepData = await aptResepRes.json();
    assert(Array.isArray(aptResepData) && aptResepData.length > 0, 'Apoteker receives prescription thread');

    // 5. Test GET /layanan
    console.log('\n5. Testing GET /layanan');
    const layananRes = await fetch(`${BASE_URL}/layanan`);
    const layananData = await layananRes.json();
    assert(layananRes.status === 200, 'GET /layanan status 200 OK');
    assert(Array.isArray(layananData) && layananData.length >= 5, 'Returns 5 catalog services');

    // 6. Test GET /antrian
    console.log('\n6. Testing GET /antrian');
    const antrianRes = await fetch(`${BASE_URL}/antrian`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const antrianData = await antrianRes.json();
    assert(antrianRes.status === 200, 'GET /antrian status 200 OK');
    assert(Array.isArray(antrianData) && antrianData.length >= 4, 'Has at least 4 kunjungan today');

    // 7. Test Illegal Queue Transition
    console.log('\n7. Testing Queue State Transitions');
    const testK = antrianData[0];
    let illegalTarget = 'merah';
    let validTarget = 'hijau';
    if (testK.status_antrian === 'hijau') {
      illegalTarget = 'merah';
      validTarget = 'kuning';
    } else if (testK.status_antrian === 'kuning') {
      illegalTarget = 'putih';
      validTarget = 'merah';
    } else if (testK.status_antrian === 'merah') {
      illegalTarget = 'putih';
      validTarget = 'merah';
    } else if (testK.status_antrian === 'selesai') {
      illegalTarget = 'putih';
      validTarget = 'merah';
    }

    const illegalRes = await fetch(`${BASE_URL}/antrian/${testK.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({ status: illegalTarget }),
    });
    assert(illegalRes.status === 400, `Illegal transition (${testK.status_antrian} -> ${illegalTarget}) rejected with 400 Bad Request`);

    const validRes = await fetch(`${BASE_URL}/antrian/${testK.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({ status: validTarget }),
    });
    assert(validRes.status === 200, `Valid transition (${testK.status_antrian} -> ${validTarget}) accepted with 200 OK`);

    // 8. Test RBAC Guard (Dokter cannot prioritize - only perawat has antrian.prioritaskan)
    console.log('\n8. Testing RBAC Forbidden check (Dokter cannot prioritize)');
    const forbiddenRes = await fetch(`${BASE_URL}/antrian/101/prioritas`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({ prioritas: true }),
    });
    assert(forbiddenRes.status === 403, 'Dokter blocked with 403 Forbidden on antrian.prioritaskan');

    // 9. Test PATCH /antrian/:id/prioritas (Perawat has permission)
    console.log('\n9. Testing PATCH /antrian/101/prioritas (Perawat)');
    const prioritasRes = await fetch(`${BASE_URL}/antrian/101/prioritas`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({ prioritas: true }),
    });
    const prioritasData = await prioritasRes.json();
    assert(prioritasRes.status === 200, 'Perawat successfully prioritized queue');
    assert(prioritasData.prioritas === true, 'Kunjungan marked as prioritas: true');

    // 10. Test Antropometri Validation & WHO LMS calculations
    console.log('\n10. Testing Antropometri Validation & WHO LMS calculations');
    // Test invalid negative input
    const invalidAntroRes = await fetch(`${BASE_URL}/antropometri`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({
        kunjungan_id: 103,
        pasien_id: 3,
        usia_bulan: -5,
        berat_badan_kg: -10,
        tinggi_badan_cm: 0,
      }),
    });
    assert(invalidAntroRes.status === 400, 'Negative/zero input rejected with 400 Bad Request');

    // Test valid measurement calculation
    const antropometriRes = await fetch(`${BASE_URL}/antropometri`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({
        kunjungan_id: 103,
        pasien_id: 3,
        usia_bulan: 18,
        berat_badan_kg: 10.2,
        tinggi_badan_cm: 79.5,
        lingkar_kepala_cm: 45.8,
      }),
    });
    const antropometriData = await antropometriRes.json();
    assert(antropometriRes.status === 201, 'POST /antropometri status 201 Created');
    assert(typeof antropometriData.z_score_bb_u === 'number', 'z_score_bb_u is calculated');
    assert(typeof antropometriData.z_score_tb_u === 'number', 'z_score_tb_u is calculated');
    assert(typeof antropometriData.z_score_bb_tb === 'number', 'z_score_bb_tb is calculated');
    assert(typeof antropometriData.interpretasi === 'string', 'interpretasi is generated');

    // Test severe malnutrition full interpretation length in DB (> 60 chars)
    const severeAntroRes = await fetch(`${BASE_URL}/antropometri`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({
        kunjungan_id: 103,
        pasien_id: 3,
        usia_bulan: 12,
        berat_badan_kg: 4.0,
        tinggi_badan_cm: 60.0,
        lingkar_kepala_cm: 38.0,
      }),
    });
    assert(severeAntroRes.status === 201, 'Severe malnutrition string > 60 chars stored without truncation (201 Created)');

    // Test GET /antropometri/kunjungan/:kunjunganId
    const getAntroRes = await fetch(`${BASE_URL}/antropometri/kunjungan/103`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    assert(getAntroRes.status === 200, 'Dokter can access GET /antropometri/kunjungan/103 (200 OK)');
    const getAntroData = await getAntroRes.json();
    assert(Array.isArray(getAntroData) && getAntroData.length > 0, 'Retrieves saved anthropometry list');

    // 11. Test GET /dashboard/summary
    console.log('\n11. Testing GET /dashboard/summary');
    const summaryRes = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${apotekerToken}` },
    });
    const summaryData = await summaryRes.json();
    assert(summaryRes.status === 200, 'GET /dashboard/summary accessible by Apoteker (200 OK)');
    assert(typeof summaryData.total_pasien === 'number', 'total_pasien is returned');
    assert(typeof summaryData.prioritas_aktif === 'number', 'prioritas_aktif is returned');

    // 12. Test Chatbot WhatsApp State Machine
    console.log('\n12. Testing Chatbot WhatsApp State Machine');
    const waSimulateRes = await fetch(`${BASE_URL}/wa/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: '081299998888', message: 'Halo' }),
    });
    const waData = await waSimulateRes.json();
    assert(waSimulateRes.status === 201, 'WA Greeting success');
    assert(waData.reply.includes('MedikaScale'), 'WA Greeting text returned');

    // 13. Test Stubs Modul Orang B
    console.log('\n13. Testing Stubs Modul Orang B');
    const arsipRes = await fetch(`${BASE_URL}/arsip/cari?q=Bilqis`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const arsipData = await arsipRes.json();
    assert(arsipRes.status === 200, 'Stub GET /arsip/cari 200 OK');
    assert(Array.isArray(arsipData) && arsipData.length > 0, 'Arsip stub returns results');

    const labRes = await fetch(`${BASE_URL}/lab`, {
      headers: {
        Authorization: `Bearer ${
          (
            await (
              await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'lab', password: 'demo123' }),
              })
            ).json()
          ).token
        }`,
      },
    });
    const labData = await labRes.json();
    assert(labRes.status === 200, 'Stub GET /lab 200 OK');
    assert(Array.isArray(labData) && labData.length > 0, 'Lab stub returns list');

    // 14. Test Perawat Workflow: Auto-advance status to 'hijau' after antropometri
    console.log('\n14. Testing Perawat Workflow: Auto-advance to "hijau"');
    // Ensure kunjungan 102 is reset to 'putih' for clean testing of nurse flow
    const resetClient = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/medikascale' });
    await resetClient.connect();
    await resetClient.query("UPDATE kunjungan SET status_antrian = 'putih' WHERE id = 102");
    await resetClient.end();

    const antroAdvanceRes = await fetch(`${BASE_URL}/antropometri`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({
        kunjungan_id: 102,
        pasien_id: 2,
        usia_bulan: 24,
        berat_badan_kg: 12.0,
        tinggi_badan_cm: 86.0,
        lingkar_kepala_cm: 47.0,
      }),
    });
    assert(antroAdvanceRes.status === 201, 'Perawat submits measurement');
    const checkKunjungan102 = await (await fetch(`${BASE_URL}/antrian`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    })).json();
    const k102 = checkKunjungan102.find((k) => k.id === 102);
    assert(k102 && k102.status_antrian === 'hijau', 'Kunjungan 102 auto-advanced to "hijau"');

    // 15. Test Doctor Examination 360 (POST /klinis/pemeriksaan)
    console.log('\n15. Testing Doctor Examination 360 Workflow (POST /klinis/pemeriksaan)');
    const examRes = await fetch(`${BASE_URL}/klinis/pemeriksaan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({
        kunjungan_id: 102,
        keluhan: 'Demam 3 hari, batuk berdahak',
        pemeriksaan_fisik: 'Suhu 38.5 C, faring hiperemis, ronki basah halus minimal',
        diagnosis: 'ISPA / Bronkitis Akut',
        catatan_terapi: 'Banyak minum air putih, istirahat cukup',
        resep_items: [
          { nama_obat: 'Paracetamol Drop 100mg/ml', dosis: '3 x 0.8 ml', kuantitas: 1, aturan_pakai: 'Sesudah makan bila demam' },
          { nama_obat: 'Ambroxol Sirup 15mg/5ml', dosis: '3 x 2.5 ml', kuantitas: 1, aturan_pakai: 'Sesudah makan' }
        ],
        lab_requests: [
          { tipe: 'lab', jenis_pemeriksaan: 'Darah Lengkap', catatan: 'Cek leukosit & trombosit' }
        ]
      }),
    });
    const examData = await examRes.json();
    assert(examRes.status === 201, 'Doctor submits 360 examination (201 Created)');
    assert(examData.success === true, 'Pemeriksaan saved successfully');
    assert(examData.resep !== null, 'E-resep created automatically');
    assert(examData.status_antrian === 'merah', 'Status antrian auto-advanced to "merah" due to prescription');

    // 16. Test 360 Patient Record (GET /klinis/kunjungan/:id/detail)
    console.log('\n16. Testing 360 Consolidated Patient Record (GET /klinis/kunjungan/:id/detail)');
    const detail360Res = await fetch(`${BASE_URL}/klinis/kunjungan/102/detail`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const detail360Data = await detail360Res.json();
    assert(detail360Res.status === 200, 'GET /klinis/kunjungan/102/detail status 200 OK');
    assert(detail360Data.pasien && detail360Data.pasien.id === 2, 'Detail includes patient data');
    assert(detail360Data.pemeriksaan && detail360Data.pemeriksaan.diagnosis.includes('ISPA'), 'Detail includes doctor diagnosis');
    assert(Array.isArray(detail360Data.resep) && detail360Data.resep.length > 0, 'Detail includes prescription');
    assert(Array.isArray(detail360Data.penunjang) && detail360Data.penunjang.length > 0, 'Detail includes lab test request');

    // 17. Test Notification System (GET /notifikasi & PATCH baca)
    console.log('\n17. Testing Notification Center');
    const notifApotekRes = await fetch(`${BASE_URL}/notifikasi`, {
      headers: { Authorization: `Bearer ${apotekerToken}` },
    });
    const notifApotekData = await notifApotekRes.json();
    assert(notifApotekRes.status === 200, 'GET /notifikasi for apoteker status 200 OK');
    assert(Array.isArray(notifApotekData.data) && notifApotekData.data.length > 0, 'Apoteker received notification for new prescription');
    const firstNotifId = notifApotekData.data[0].id;

    const readNotifRes = await fetch(`${BASE_URL}/notifikasi/${firstNotifId}/baca`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${apotekerToken}` },
    });
    assert(readNotifRes.status === 200, 'Mark notification as read status 200 OK');

    // 18. Test Prescription Lifecycle (Apoteker update status)
    console.log('\n18. Testing Prescription Lifecycle');
    const updateResepRes = await fetch(`${BASE_URL}/resep/${examData.resep.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apotekerToken}`,
      },
      body: JSON.stringify({ status: 'siap_diambil' }),
    });
    const updateResepData = await updateResepRes.json();
    assert(updateResepRes.status === 200, 'PATCH /resep/:id/status status 200 OK');
    assert(updateResepData.status === 'siap_diambil', 'Resep status updated to "siap_diambil"');

    // 19. Test Lab Workflow: Enter Result
    console.log('\n19. Testing Lab Workflow: Structured Result Input');
    const labAuthToken = (
      await (
        await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'lab', password: 'demo123' }),
        })
      ).json()
    ).token;

    const pendingLabs = await (await fetch(`${BASE_URL}/lab`, {
      headers: { Authorization: `Bearer ${labAuthToken}` },
    })).json();
    const targetLab = pendingLabs.find((l) => l.kunjungan_id === 102) || pendingLabs[0];

    const inputHasilRes = await fetch(`${BASE_URL}/lab/${targetLab.id}/hasil`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${labAuthToken}`,
      },
      body: JSON.stringify({
        hasil_pemeriksaan: 'Leukosit: 11.200 /uL (Meningkat ringan), Hb: 12.8 g/dL, Trombosit: 280.000 /uL',
        nilai_rujukan: 'Leukosit: 5.000 - 10.000 /uL, Hb: 11.5 - 15.5 g/dL',
      }),
    });
    const inputHasilData = await inputHasilRes.json();
    assert(inputHasilRes.status === 200, 'PATCH /lab/:id/hasil status 200 OK');
    assert(inputHasilData.status === 'selesai', 'Lab test status auto-completed');
    assert(inputHasilData.hasil_pemeriksaan.includes('Leukosit'), 'Structured results stored');

    // 20. Test Archive 8-Level Hierarchy & Dispatch Tracking
    console.log('\n20. Testing Archive 8-Level Location & Dispatch');
    const arsipCariRes = await fetch(`${BASE_URL}/arsip/cari?q=Bilqis`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const arsipList = await arsipCariRes.json();
    assert(arsipList.length > 0, 'Found archive for Bilqis');
    const arsipBilqis = arsipList[0];
    assert(arsipBilqis.gedung === 'Gedung Utama' && arsipBilqis.lantai === 'Lantai 2' && arsipBilqis.rak === 'Rak 5', '8-Level archive hierarchy intact');

    // Dispatch archive via Perawat (has arsip.minta_pengiriman)
    const kirimRes = await fetch(`${BASE_URL}/arsip/${arsipBilqis.pasien_id}/minta-pengiriman`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${perawatToken}`,
      },
      body: JSON.stringify({
        tujuan_lantai: 'Poli Anak Lt.3',
      }),
    });
    const kirimData = await kirimRes.json();
    assert(kirimRes.status === 201, 'POST /arsip/:id/minta-pengiriman status 201 Created');
    assert(kirimData.status === 'dalam_pengiriman', 'Archive dispatch status is dalam_pengiriman');

    // Verify tracking
    const trackingRes = await fetch(`${BASE_URL}/arsip/${arsipBilqis.pasien_id}/tracking`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const trackingData = await trackingRes.json();
    assert(trackingRes.status === 200, 'GET /arsip/:pasienId/tracking status 200 OK');
    assert(Array.isArray(trackingData) && trackingData.length > 0, 'Tracking history returned');

    // 21. Test Admin Management: Users, Roles, Permissions
    console.log('\n21. Testing Admin Management (Users, Roles, Permissions)');
    const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminUsers = await adminUsersRes.json();
    assert(adminUsersRes.status === 200, 'GET /admin/users status 200 OK');
    assert(Array.isArray(adminUsers) && adminUsers.length >= 4, 'Admin retrieved user list');

    const adminRolesRes = await fetch(`${BASE_URL}/admin/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminRoles = await adminRolesRes.json();
    assert(adminRolesRes.status === 200, 'GET /admin/roles status 200 OK');
    assert(Array.isArray(adminRoles) && adminRoles.length >= 5, 'Admin retrieved role list with permissions');

    const adminPermsRes = await fetch(`${BASE_URL}/admin/permissions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminPerms = await adminPermsRes.json();
    assert(adminPermsRes.status === 200, 'GET /admin/permissions status 200 OK');
    assert(adminPerms.some((p) => p.kode === 'admin.kelola'), 'Permissions include admin.kelola');

    console.log(`\n========================================`);
    console.log(`✨ TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
