# MedikaScale Frontend Dashboard

React + TypeScript frontend untuk sistem manajemen klinik anak dengan modul Antrian, Antropometri, dan role-based views.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Server akan berjalan di `http://localhost:5173`

## Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan:

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Struktur Project

```
src/
├── components/        # Reusable components
│   ├── layout/       # Header, Sidebar, MainLayout
│   ├── antrian/      # Queue management components
│   ├── antropometri/ # Measurement & charts
│   ├── dashboard/    # Role-based dashboards
│   └── common/       # Shared UI components
├── pages/            # Page components
├── services/         # API & WebSocket services
├── store/            # Zustand state management
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Helper utilities & export functions
```

## Features

### Authentication
- Login dengan username/password
- JWT token management + auto-refresh
- Permission-based route protection

### Antrian (Queue Management)
- Real-time antrian list dengan WebSocket
- Status updates (putih → hijau → kuning → merah)
- Prioritas marking (Dokter only)
- Filter by poli, layanan, status

### Antropometri (Measurements)
- Input form dengan validasi (tinggi, berat, lingkar kepala)
- WHO growth charts (Line charts via Recharts)
- Riwayat pengukuran per pasien
- Laporan bulanan dengan export CSV/PDF

### Dashboard
- **Dokter**: Total antrian, pasien prioritas, rata-rata waktu tunggu
- **Perawat**: Antrian hari ini, quick input antropometri, pending measurements

### Real-time Updates
- WebSocket integration via Socket.io
- Auto-update antrian list saat ada perubahan status
- Fallback polling setiap 5 detik jika WebSocket fail

### Export & Print
- Export laporan antropometri ke CSV
- Generate PDF kartu grafik WHO
- HTML2Canvas + jsPDF untuk rendering

## Build & Production

```bash
npm run build  # Production build ke dist/
npm run preview  # Preview production build
```

## API Contract

Backend perlu menyediakan endpoints:

```
POST   /api/auth/login          → { token, user }
POST   /api/auth/refresh        → { token }

GET    /api/antrian?filters
GET    /api/antrian/:id
PUT    /api/antrian/:id/status
GET    /api/antrian/log/:kunjungan_id

POST   /api/antropometri
GET    /api/antropometri/pasien/:pasien_id
GET    /api/antropometri/report?filters

GET    /api/pasien/:id
GET    /api/kunjungan?filters

WebSocket: /socket.io
  - antrian:update
  - antrian:new
  - antrian:call
```

## Tech Stack

- **React 18** + TypeScript
- **Tailwind CSS** - styling
- **React Router v6** - navigation
- **Zustand** - state management
- **Axios** - HTTP client
- **Socket.io** - real-time WebSocket
- **Recharts** - charting (WHO graphs)
- **React Hook Form** + Zod - form validation
- **jsPDF** + html2canvas - PDF export

## Notes

- Placeholder pages untuk Rekam Medis, Lab & Radiologi, Resep (integrasi Modul Orang B nanti)
- WebSocket reconnection otomatis dengan exponential backoff
- Form validation menggunakan Zod schema
- Permission gates di component level & routes
- WCAG 2.1 semantic HTML + keyboard navigation

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build production
npm run preview  # Preview production build
npm run lint     # Run TypeScript check
```

Mobile responsive: Sidebar collapsible, Tailwind responsive classes.
