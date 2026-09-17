# API Integration Guide

## Authentication Endpoints

### POST /api/auth/login
Login user dengan credentials.

**Request:**
```json
{
  "username": "dokter",
  "password": "demo123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "username": "dokter",
    "role_id": "dokter",
    "permissions": ["antrian.view", "antrian.update_status", "antrian.prioritaskan", "antropometri.view", "dashboard.dokter"]
  }
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

---

### POST /api/auth/refresh
Refresh expired JWT token.

**Request:**
```json
{
  "token": "expired_token"
}
```

**Response (200):**
```json
{
  "token": "new_token_here",
  "user": { ... }
}
```

---

## Antrian Endpoints

### GET /api/antrian?filters
Fetch queue list dengan optional filters.

**Query Parameters:**
- `poli` (string): Filter by medical department
- `layanan` (string): Filter by service
- `status` (string): putih|hijau|kuning|merah
- `prioritas` (boolean): Only priority patients
- `date` (string): YYYY-MM-DD format
- `limit` (number): Default 50
- `offset` (number): Pagination offset

**Response (200):**
```json
[
  {
    "id": "kunjungan-123",
    "pasien_id": "pasien-456",
    "no_antrian": "A001",
    "tanggal_kunjungan": "2026-09-17",
    "poli": "Umum",
    "layanan": "Konsultasi",
    "status_antrian": "hijau",
    "prioritas": false,
    "created_at": "2026-09-17T08:00:00Z",
    "updated_at": "2026-09-17T08:05:00Z"
  }
]
```

---

### GET /api/antrian/:id
Fetch single queue detail.

**Response (200):**
```json
{
  "id": "kunjungan-123",
  "pasien_id": "pasien-456",
  "no_antrian": "A001",
  "tanggal_kunjungan": "2026-09-17",
  "poli": "Umum",
  "layanan": "Konsultasi",
  "status_antrian": "hijau",
  "prioritas": false,
  "created_at": "2026-09-17T08:00:00Z",
  "updated_at": "2026-09-17T08:05:00Z"
}
```

---

### PUT /api/antrian/:id/status
Update antrian status & prioritas.

**Request:**
```json
{
  "status": "kuning",
  "prioritas": true
}
```

**Response (200):**
```json
{
  "message": "Status updated",
  "id": "kunjungan-123",
  "status_antrian": "kuning",
  "prioritas": true
}
```

---

### GET /api/antrian/log/:kunjungan_id
Fetch status change history.

**Response (200):**
```json
[
  {
    "id": "log-1",
    "kunjungan_id": "kunjungan-123",
    "status_lama": "putih",
    "status_baru": "hijau",
    "changed_by": "user-789",
    "changed_at": "2026-09-17T08:02:00Z"
  },
  {
    "id": "log-2",
    "kunjungan_id": "kunjungan-123",
    "status_lama": "hijau",
    "status_baru": "kuning",
    "changed_by": "user-789",
    "changed_at": "2026-09-17T08:05:00Z"
  }
]
```

---

## Antropometri Endpoints

### POST /api/antropometri
Input pengukuran antropometri baru.

**Request:**
```json
{
  "kunjungan_id": "kunjungan-123",
  "tinggi": 65.5,
  "berat": 8.2,
  "lingkar_kepala": 42.3,
  "catatan": "Bayi tenang, pengukuran lancar"
}
```

**Response (201):**
```json
{
  "id": "antro-789",
  "kunjungan_id": "kunjungan-123",
  "tinggi": 65.5,
  "berat": 8.2,
  "lingkar_kepala": 42.3,
  "umur_bulan": 6,
  "created_by_user_id": "user-456",
  "created_at": "2026-09-17T08:10:00Z"
}
```

**Validation Error (400):**
```json
{
  "message": "Validation failed",
  "errors": {
    "tinggi": "Must be between 50-220 cm",
    "berat": "Must be between 2-150 kg"
  }
}
```

---

### GET /api/antropometri/pasien/:pasien_id
Fetch riwayat pengukuran per pasien.

**Query Parameters:**
- `limit` (number): Default 30
- `offset` (number): Pagination

**Response (200):**
```json
[
  {
    "id": "antro-789",
    "kunjungan_id": "kunjungan-123",
    "tinggi": 65.5,
    "berat": 8.2,
    "lingkar_kepala": 42.3,
    "umur_bulan": 6,
    "percentile": 45,
    "status_gizi": "normal",
    "created_at": "2026-09-17T08:10:00Z"
  }
]
```

---

### GET /api/antropometri/report?filters
Laporan antropometri dengan agregasi.

**Query Parameters:**
- `start_date` (string): YYYY-MM-DD
- `end_date` (string): YYYY-MM-DD
- `poli` (string): Filter by department

**Response (200):**
```json
{
  "total": 150,
  "normal": 120,
  "at_risk": 20,
  "malnutrition": 10,
  "data": [
    {
      "id": "antro-1",
      "created_at": "2026-09-17",
      "poli": "Umum",
      "tinggi": 65.5,
      "berat": 8.2,
      "status": "normal"
    }
  ]
}
```

---

## Pasien Endpoints

### GET /api/pasien/:id
Fetch pasien detail.

**Response (200):**
```json
{
  "id": "pasien-456",
  "no_rm": "RM-001",
  "nama": "Budi Santoso",
  "tanggal_lahir": "2025-03-15",
  "no_telepon": "081234567890",
  "alamat": "Jl. Merdeka No. 10"
}
```

---

## Kunjungan Endpoints

### GET /api/kunjungan?filters
Fetch list kunjungan dengan agregasi data.

**Query Parameters:**
- `tanggal` (string): YYYY-MM-DD atau "TODAY"
- `poli` (string): Filter by department
- `limit` (number): Default 50

**Response (200):**
```json
[
  {
    "id": "kunjungan-123",
    "pasien_id": "pasien-456",
    "pasien": {
      "nama": "Budi Santoso",
      "no_rm": "RM-001"
    },
    "no_antrian": "A001",
    "tanggal_kunjungan": "2026-09-17",
    "poli": "Umum",
    "layanan": "Konsultasi",
    "status_antrian": "hijau",
    "created_at": "2026-09-17T08:00:00Z"
  }
]
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
```

### Event: antrian:update
Dipancarkan saat status antrian berubah.

```javascript
socket.on('antrian:update', (data) => {
  console.log('Queue updated:', {
    kunjungan_id: data.kunjungan_id,
    status: data.status,        // 'hijau', 'kuning', 'merah', dll
    prioritas: data.prioritas,  // boolean
    timestamp: data.timestamp
  });
});
```

### Event: antrian:new
Dipancarkan saat antrian baru masuk.

```javascript
socket.on('antrian:new', (data) => {
  console.log('New queue:', {
    kunjungan_id: data.kunjungan_id,
    no_antrian: data.no_antrian,
    nama_pasien: data.nama_pasien,
    poli: data.poli
  });
});
```

### Event: antrian:call
Dipancarkan saat panggilan antrian (untuk display layar ruang tunggu).

```javascript
socket.on('antrian:call', (data) => {
  console.log('Queue called:', {
    no_antrian: data.no_antrian,
    poli: data.poli,
    ruangan: data.ruangan
  });
});
```

---

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Validation error / Bad request
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `422`: Unprocessable entity
- `500`: Server error

### Auth Error Handling (Frontend)
```typescript
// In api.ts interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Rate Limiting

Recommended untuk production:
- Auth endpoints: 5 requests/minute per IP
- API endpoints: 60 requests/minute per user
- WebSocket: Keep-alive ping every 30 seconds

---

## CORS Configuration Required

Backend harus allow:
```
Origin: https://app.medikascale.com (production)
        http://localhost:5173 (development)
Methods: GET, POST, PUT, DELETE, OPTIONS
Headers: Content-Type, Authorization
Credentials: true
```

---

**API Version:** 1.0.0
**Last Updated:** Sept 17, 2026
