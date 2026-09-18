// Automated End-to-End Test Suite for MedikaScale Backend

async function runTests() {
  const BASE_URL = 'http://localhost:3000/api';
  console.log('🧪 Starting MedikaScale Backend Verification Tests...\n');

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

    // 3. Test GET /layanan
    console.log('\n3. Testing GET /layanan');
    const layananRes = await fetch(`${BASE_URL}/layanan`);
    const layananData = await layananRes.json();
    assert(layananRes.status === 200, 'GET /layanan status 200 OK');
    assert(Array.isArray(layananData) && layananData.length >= 5, 'Returns 5 catalog services');
    assert(layananData[0].nama === 'SOAPIE', 'First service is SOAPIE');

    // 4. Test GET /antrian
    console.log('\n4. Testing GET /antrian');
    const antrianRes = await fetch(`${BASE_URL}/antrian`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const antrianData = await antrianRes.json();
    assert(antrianRes.status === 200, 'GET /antrian status 200 OK');
    assert(Array.isArray(antrianData), 'Returns array of kunjungan');
    assert(antrianData.length >= 4, 'Has at least 4 kunjungan today');
    assert(antrianData[0].pasien && antrianData[0].pasien.nama, 'Nested pasien object present');
    assert(antrianData[0].layanan && antrianData[0].layanan.nama, 'Nested layanan object present');

    // 5. Test PATCH /antrian/:id/status
    console.log('\n5. Testing PATCH /antrian/101/status (Dokter)');
    const updateStatusRes = await fetch(`${BASE_URL}/antrian/101/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({ status: 'merah' }),
    });
    const updateStatusData = await updateStatusRes.json();
    assert(updateStatusRes.status === 200, 'PATCH /antrian/101/status status 200 OK');
    assert(updateStatusData.status_antrian === 'merah', 'Status updated to merah');

    // 6. Test RBAC Guard (Dokter cannot prioritize - only perawat has antrian.prioritaskan)
    console.log('\n6. Testing RBAC Forbidden check (Dokter cannot prioritize)');
    const forbiddenRes = await fetch(`${BASE_URL}/antrian/101/prioritas`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({ prioritas: true }),
    });
    assert(forbiddenRes.status === 403, 'Dokter blocked with 403 Forbidden on antrian.prioritaskan');

    // 7. Test PATCH /antrian/:id/prioritas (Perawat has permission)
    console.log('\n7. Testing PATCH /antrian/101/prioritas (Perawat)');
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

    // 8. Test POST /antropometri with WHO LMS calculations
    console.log('\n8. Testing POST /antropometri (Perawat)');
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
    console.log('     Hasil WHO:', {
      BB_U: antropometriData.z_score_bb_u,
      TB_U: antropometriData.z_score_tb_u,
      BB_TB: antropometriData.z_score_bb_tb,
      LK_U: antropometriData.z_score_lk_u,
      interpretasi: antropometriData.interpretasi,
    });

    // 9. Test GET /dashboard/summary
    console.log('\n9. Testing GET /dashboard/summary');
    const dashboardRes = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const dashboardData = await dashboardRes.json();
    assert(dashboardRes.status === 200, 'GET /dashboard/summary status 200 OK');
    assert(typeof dashboardData.total_pasien === 'number', 'total_pasien is returned');
    assert(typeof dashboardData.prioritas_aktif === 'number', 'prioritas_aktif is returned');

    // 10. Test WhatsApp Chatbot Simulation
    console.log('\n10. Testing Chatbot WhatsApp State Machine');
    const waPhone = '089876543210';

    // Step A: Greeting
    const wa1 = await (
      await fetch(`${BASE_URL}/wa/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: waPhone, message: 'Halo' }),
      })
    ).json();
    assert(wa1.success === true, 'WA Greeting success');
    assert(wa1.reply.includes('Layanan Mandiri WhatsApp MedikaScale'), 'WA Greeting text returned');

    // Step B: Choose 1 (Daftar)
    const wa2 = await (
      await fetch(`${BASE_URL}/wa/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: waPhone, message: '1' }),
      })
    ).json();
    assert(wa2.state === 'INPUT_RM', 'WA transitioned to INPUT_RM');

    // Step C: Send RM-2022-009981 (Siti Aminah, but already has queue today) -> test existing check
    const wa3 = await (
      await fetch(`${BASE_URL}/wa/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: waPhone, message: 'RM-2022-009981' }),
      })
    ).json();
    assert(wa3.state === 'PILIH_LAYANAN', 'WA verified patient and asks for service');

    // Step D: Choose service 2 (Vaksin) -> should inform already registered or create
    const wa4 = await (
      await fetch(`${BASE_URL}/wa/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: waPhone, message: '2' }),
      })
    ).json();
    assert(wa4.success === true, 'WA service selection handled');
    assert(wa4.reply.includes('sudah memiliki antrian') || wa4.reply.includes('BERHASIL'), 'WA handled duplicate or created queue');

    // 11. Test Stubs (Arsip, Resep, Lab)
    console.log('\n11. Testing Stubs Modul Orang B');
    const arsipRes = await fetch(`${BASE_URL}/arsip/cari?q=Bilqis`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const arsipData = await arsipRes.json();
    assert(arsipRes.status === 200, 'Stub GET /arsip/cari 200 OK');
    assert(Array.isArray(arsipData) && arsipData.length > 0, 'Arsip stub returns results');

    const resepRes = await fetch(`${BASE_URL}/resep?kunjungan_id=103`, {
      headers: { Authorization: `Bearer ${dokterToken}` },
    });
    const resepData = await resepRes.json();
    assert(resepRes.status === 200, 'Stub GET /resep 200 OK');
    assert(Array.isArray(resepData) && resepData.length > 0, 'Resep stub returns thread');

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
