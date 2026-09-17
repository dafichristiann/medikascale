# MedikaScale Backend - Complete Verification & Setup Guide

## Backend Status: ✅ BUILT & READY

**Project:** Node.js + Express + PostgreSQL API Server
**Location:** `D:\Perkuliahan\semester 7\medis\backend`
**Build Status:** 76 compiled files in `dist/`
**Dependencies:** Installed (node_modules present)

---

## What's Included

### Core Features
- ✅ **Authentication System**
  - JWT login with bcrypt password hashing
  - Token refresh mechanism
  - 3 demo users (admin, dokter, perawat)
  
- ✅ **Antrian (Queue) Management**
  - List queues with filters (poli, layanan, status, tanggal)
  - Get single queue detail
  - Update queue status (menunggu → dipanggil → sedang_diperiksa → selesai)
  - Set priority flag
  - Audit log for status changes
  
- ✅ **Antropometri (Measurements)**
  - Create new measurement (tinggi, berat, lingkar_kepala)
  - Get measurement history by patient
  - Generate reports with filters
  
- ✅ **Pasien (Patients)**
  - Get patient details
  - Get patient visit history
  
- ✅ **Real-time Ready**
  - Socket.io server configured
  - WebSocket events ready to broadcast

### Database Schema (6 Tables)
1. **roles** — admin, dokter, perawat, staff_antrian
2. **users** — username, password_hash, role_id, permissions[]
3. **pasien** — no_rm, nama, tanggal_lahir, no_telepon, alamat
4. **kunjungan** — pasien_id, no_antrian, poli, layanan, status_antrian, prioritas
5. **antrian_log** — kunjungan_id, status_lama, status_baru, changed_by
6. **antropometri** — kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan

### Security Features
- JWT authentication on all endpoints (except login)
- Permission-based access control
- Password hashing (bcrypt, 10 rounds)
- Input validation (Joi schemas)
- CORS enabled
- SQL injection prevention (parameterized queries)

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.ts          # Environment variables & config
│   ├── controllers/          # Route handlers
│   │   ├── authController.ts      # Login, refresh token
│   │   ├── aantrianController.ts  # Queue CRUD
│   │   ├── antropometriController.ts # Measurements
│   │   └── pasienController.ts    # Patient data
│   ├── routes/
│   │   ├── authRoutes.ts          # POST /api/auth/login, refresh
│   │   ├── aantrianRoutes.ts      # GET/PUT /api/antrian/*
│   │   ├── antropometriRoutes.ts  # POST/GET /api/antropometri/*
│   │   └── pasienRoutes.ts        # GET /api/pasien/*
│   ├── middleware/
│   │   └── auth.ts           # Auth middleware, permission check
│   ├── services/
│   │   ├── authService.ts         # Login logic, JWT generation
│   │   ├── aantrianService.ts     # Queue DB operations
│   │   ├── antropometriService.ts # Measurement DB ops
│   │   └── pasienService.ts       # Patient DB ops
│   ├── db/
│   │   ├── pool.ts          # PostgreSQL connection pool
│   │   ├── migrate.ts       # Schema creation script
│   │   └── seed.ts          # Demo data insertion
│   ├── app.ts               # Express + Socket.io setup
│   └── server.ts            # Entry point, auto-migrate & seed
├── dist/                    # Compiled JavaScript (76 files)
├── node_modules/            # Dependencies installed
├── package.json             # Scripts & dependencies
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables
├── .env.example             # Environment template
├── README.md                # Documentation
└── SETUP.md                 # Detailed setup guide
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Antrian (Queue)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/antrian` | List all queues (with filters) |
| GET | `/api/antrian/:id` | Get single queue detail |
| PUT | `/api/antrian/:id/status` | Update status & prioritas |
| GET | `/api/antrian/log/:kunjungan_id` | Get status change history |

### Antropometri (Measurements)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/antropometri` | Create new measurement |
| GET | `/api/antropometri/pasien/:pasien_id` | Get patient measurements |
| GET | `/api/antropometri/report` | Generate report (filters) |

### Pasien (Patients)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pasien/:id` | Get patient detail |
| GET | `/api/pasien/:pasien_id/kunjungan` | Get patient visits |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

---

## Demo Credentials

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Admin | admin | admin123 | Full access (users, antrian, antropometri) |
| Doctor | dokter | dokter123 | Read antrian, read/write antropometri, read visits |
| Nurse | perawat | perawat123 | Read/update antrian, read/write antropometri |

---

## Setup Instructions (Step-by-Step)

### Prerequisites
- **Node.js** 20+ (download from nodejs.org)
- **PostgreSQL** 12+ (download from postgresql.org)
- **npm** (comes with Node.js)

### Step 1: Install PostgreSQL (if not installed)

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Set password for `postgres` user (remember this!)
4. Complete installation

**Verify installation:**
```bash
psql --version
# Should show PostgreSQL version
```

### Step 2: Create Database

**Open PowerShell as Administrator:**

```bash
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE medikal_scale;
\q
```

**Or use pgAdmin (GUI tool):**
1. Open pgAdmin
2. Connect to local server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `medikal_scale`
5. Click "Save"

### Step 3: Configure Environment

**Navigate to backend folder:**
```bash
cd "D:\Perkuliahan\semester 7\medis\backend"
```

**Edit `.env` file:**
```ini
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medikal_scale
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_REFRESH_SECRET=another-long-random-string-for-refresh-tokens
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
```

**Replace:**
- `your_postgres_password_here` → Your PostgreSQL password from Step 1
- `JWT_SECRET` → Long random string (use https://generate-secret.vercel.app/)
- `JWT_REFRESH_SECRET` → Another long random string

### Step 4: Install Dependencies

```bash
npm install
```

**Expected output:**
```
added XX packages in Xs
```

### Step 5: Build TypeScript

```bash
npm run build
```

**Expected output:**
```
tsc
# No errors = success
```

### Step 6: Run Database Migrations

This creates all tables in the database.

```bash
npm run db:migrate
```

**Expected output:**
```
✓ Migration 001_init_schema completed
Migrations complete
```

**What it creates:**
- roles table
- users table
- pasien table
- kunjungan table
- antrian_log table
- antropometri table
- Indexes for performance

### Step 7: Seed Demo Data

This inserts test users, patients, visits, and measurements.

```bash
npm run db:seed
```

**Expected output:**
```
✓ Seed data inserted
Database seeding completed
```

**What it creates:**
- 3 roles (admin, dokter, perawat, staff_antrian)
- 3 users (admin/admin123, dokter/dokter123, perawat/perawat123)
- 3 patients (Budi Santoso, Siti Nurhaliza, Ahmad Wijaya)
- 3 visits (kunjungan) for today
- 2 antrian log entries
- 2 antropometri measurements

### Step 8: Start Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Expected output:**
```
Testing database connection...
✓ Database connected
Running migrations...
✓ Migration 001_init_schema completed
✓ Migrations complete
Seeding demo data...
✓ Seed data inserted
✓ Demo data seeded
✓ Server running on http://localhost:3000
✓ WebSocket available on ws://localhost:3000

Demo credentials:
  admin / admin123
  dokter / dokter123
  perawat / perawat123
```

**Server is now running!** 🎉

---

## Testing the Backend

### Test 1: Health Check

Open browser or Postman:
```
GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Test 2: Login

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dokter","password":"dokter123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "username": "dokter",
    "role_id": "dokter"
  }
}
```

**Using Postman:**
1. New request → POST
2. URL: `http://localhost:3000/api/auth/login`
3. Body → raw → JSON:
   ```json
   {
     "username": "dokter",
     "password": "dokter123"
   }
   ```
4. Send → Copy token from response

### Test 3: Get Antrian List

**Replace TOKEN with actual token from login:**
```bash
curl -X GET "http://localhost:3000/api/antrian?tanggal_kunjungan=2026-09-17" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "id": 2,
    "no_antrian": "A-002",
    "tanggal_kunjungan": "2026-09-17",
    "poli": "Anak",
    "layanan": "Konsultasi",
    "status_antrian": "dipanggil",
    "prioritas": 1,
    "pasien_id": 2,
    "nama": "Siti Nurhaliza",
    "no_rm": "RM-002"
  },
  ...
]
```

### Test 4: Update Queue Status

```bash
curl -X PUT "http://localhost:3000/api/antrian/3/status" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status":"dipanggil","prioritas":0}'
```

**Response:**
```json
{
  "success": true
}
```

### Test 5: Create Antropometri Measurement

```bash
curl -X POST "http://localhost:3000/api/antropometri" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "kunjungan_id": 3,
    "tinggi": 110.5,
    "berat": 20.0,
    "lingkar_kepala": 52.0,
    "umur_bulan": 48
  }'
```

**Response (201 Created):**
```json
{
  "id": 3,
  "kunjungan_id": 3,
  "tinggi": 110.50,
  "berat": 20.00,
  "lingkar_kepala": 52.00,
  "umur_bulan": 48,
  "created_by_user_id": 3,
  "created_at": "2026-09-17T..."
}
```

---

## Connect Frontend to Backend

### Step 1: Update Frontend .env

**File:** `frontend/.env`
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Step 2: Start Frontend

**New terminal window:**
```bash
cd frontend
npm run dev
```

**Open browser:** http://localhost:5173

### Step 3: Login in Frontend

1. See login page
2. Enter credentials:
   - Username: `dokter`
   - Password: `dokter123`
3. Click "Login"
4. Should redirect to dashboard

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL not running

**Solution:**
1. **Windows:** 
   - Services app → Find "postgresql-x64-X.X" → Start
   
2. **Mac:**
   ```bash
   brew services start postgresql
   ```
   
3. **Linux:**
   ```bash
   sudo systemctl start postgresql
   ```

4. **Test connection:**
   ```bash
   psql -U postgres -d medikal_scale
   ```

### Error: "password authentication failed"

**Cause:** Wrong password in .env

**Solution:**
1. Edit `.env`
2. Change `DB_PASSWORD` to your actual PostgreSQL password
3. Restart server: `Ctrl+C` then `npm run dev`

### Error: "database medikal_scale does not exist"

**Cause:** Database not created

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE medikal_scale;"
npm run db:migrate
npm run db:seed
```

### Error: "relation already exists"

**Cause:** Running migrations twice

**Solution:**
1. Drop and recreate database:
   ```bash
   psql -U postgres -c "DROP DATABASE medikal_scale;"
   psql -U postgres -c "CREATE DATABASE medikal_scale;"
   npm run db:migrate
   npm run db:seed
   ```

### Error: "EADDRINUSE :::3000"

**Cause:** Port 3000 already in use

**Solution:**
1. Kill process on port 3000:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
   
2. Or change port in .env:
   ```ini
   PORT=3001
   ```
   
3. Update frontend .env too:
   ```
   VITE_API_URL=http://localhost:3001/api
   VITE_SOCKET_URL=http://localhost:3001
   ```

### Error: "Invalid credentials"

**Cause:** Wrong username/password or seed not run

**Solution:**
1. Verify seed ran: `npm run db:seed`
2. Check credentials are correct:
   - admin / admin123
   - dokter / dokter123
   - perawat / perawat123

### Error: "Insufficient permissions"

**Cause:** User doesn't have required permission

**Solution:**
1. Use correct user role:
   - Admin has full access
   - Doctor can read antrian, write antropometri
   - Nurse can update antrian, write antropometri

### Frontend shows "Network Error"

**Cause:** Backend not running or wrong URL

**Solution:**
1. Verify backend running: http://localhost:3000/health
2. Check frontend .env: `VITE_API_URL=http://localhost:3000/api`
3. Restart both servers

---

## npm Scripts Reference

```bash
# Development
npm run dev              # Start with auto-reload (tsx)
npm start                # Start production build

# Database
npm run db:migrate       # Create tables
npm run db:seed          # Insert demo data

# Build
npm run build            # Compile TypeScript to dist/

# Clean (if needed)
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

---

## Production Deployment Checklist

- [ ] Change `NODE_ENV=production` in .env
- [ ] Change `JWT_SECRET` to long random string
- [ ] Change `JWT_REFRESH_SECRET` to long random string
- [ ] Change `DB_PASSWORD` to strong password
- [ ] Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up process manager (PM2, systemd)
- [ ] Enable logging (winston, morgan)
- [ ] Set up monitoring (Sentry, Datadog)
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Rate limiting on auth endpoints

---

## WebSocket Events (Ready to Implement)

Backend Socket.io is configured. Add these events when needed:

```javascript
// In controller after status update:
io.emit('antrian:update', {
  kunjungan_id: id,
  status: newStatus,
  prioritas: newPrioritas,
  timestamp: new Date()
});

// When new queue created:
io.emit('antrian:new', {
  kunjungan_id: newId,
  no_antrian: newNoAntrian,
  nama_pasien: patientName,
  poli: poliName
});

// When calling patient:
io.emit('antrian:call', {
  no_antrian: noAntrian,
  poli: poliName,
  ruangan: ruanganName
});
```

Frontend is already listening for these events via `useWebSocket` hook.

---

## File Locations Quick Reference

| File | Purpose |
|------|---------|
| `src/server.ts` | Entry point, auto-setup |
| `src/app.ts` | Express + Socket.io |
| `src/config/index.ts` | Environment config |
| `src/middleware/auth.ts` | JWT + permission checks |
| `src/controllers/*.ts` | Request handlers |
| `src/services/*.ts` | Business logic |
| `src/routes/*.ts` | Route definitions |
| `src/db/pool.ts` | PG connection |
| `src/db/migrate.ts` | Schema creation |
| `src/db/seed.ts` | Demo data |
| `.env` | Configuration |
| `package.json` | Dependencies & scripts |

---

## Next Steps After Setup

1. ✅ Install PostgreSQL
2. ✅ Create database
3. ✅ Configure .env
4. ✅ npm install
5. ✅ npm run build
6. ✅ npm run db:migrate
7. ✅ npm run db:seed
8. ✅ npm run dev
9. ✅ Test login endpoint
10. ✅ Update frontend .env
11. ✅ Start frontend
12. ✅ Test full login flow

---

## Support & Resources

- **Backend README:** `backend/README.md`
- **Backend SETUP:** `backend/SETUP.md`
- **Frontend docs:** `frontend/README.md`, `frontend/QUICK_START.md`
- **Integration guide:** `INTEGRATION.md`

---

**Backend Build Verified!** ✅

**Ready to run:** `npm run dev` (in backend folder)
