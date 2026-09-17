# MedikaScale Backend API

Healthcare queue management system built with Node.js, Express, PostgreSQL, and Socket.io.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 12+

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL credentials

4. Run migrations and seed demo data:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | dokter | dokter123 |
| Nurse | perawat | perawat123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/refresh` - Get new access token using refresh token

### Antrian (Queue)
- `GET /api/antrian` - List kunjungan with filters (poli, layanan, status_antrian, tanggal_kunjungan)
- `GET /api/antrian/:id` - Get single kunjungan detail
- `PUT /api/antrian/:id/status` - Update status (status, prioritas)
- `GET /api/antrian/log/:kunjungan_id` - Get status change history

### Antropometri
- `POST /api/antropometri` - Create measurement (kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan)
- `GET /api/antropometri/pasien/:pasien_id` - Get patient measurement history
- `GET /api/antropometri/report` - Get aggregated report (filters: poli, tanggal_dari, tanggal_sampai)

### Pasien & Kunjungan
- `GET /api/pasien/:id` - Get patient detail
- `GET /api/pasien/:pasien_id/kunjungan` - Get patient visits (filters: status_antrian, tanggal_dari)

## WebSocket Events

Real-time updates via Socket.io:
- `antrian:new` - New queue entry
- `antrian:update` - Queue status changed
- `antrian:call` - Patient called

## Database Schema

**users** - System users with roles and permissions
**roles** - User roles (admin, dokter, perawat, staff_antrian)
**pasien** - Patient records
**kunjungan** - Visit records
**antrian_log** - Queue status change history
**antropometri** - Anthropometric measurements

## Environment Variables

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medikal_scale
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/      # Route handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── db/
│   │   ├── migrate.ts   # Database migrations
│   │   ├── seed.ts      # Demo data seeding
│   │   └── pool.ts      # Database connection pool
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Development

### Build
```bash
npm run build
```

### Start Production
```bash
npm start
```

## Authentication Flow

1. POST `/api/auth/login` with username + password → returns `token` + `refreshToken`
2. Include token in Authorization header: `Authorization: Bearer <token>`
3. Token expires in 1h, use `refreshToken` to get new token
4. POST `/api/auth/refresh` with `refreshToken` → returns new `token`

## Permission-Based Access Control

Routes validate user permissions. Example permissions:
- `antrian:read` - View queue
- `antrian:update` - Update queue status
- `antropometri:read` - View measurements
- `antropometri:write` - Create measurements
- `users:read`, `users:write` - User management

## Notes

- ponytail: WebSocket event broadcasting not yet implemented; add when frontend needs real-time updates
- Validation uses Joi; extend schemas in controllers as needed
- Timestamps auto-managed by database
- Password hashing via bcrypt (10 salt rounds)
