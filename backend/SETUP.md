# MedikaScale Backend - Setup & Running Guide

## Prerequisites

### Required Software
- **Node.js** 20+ (download from nodejs.org)
- **PostgreSQL** 12+ (download from postgresql.org)
- **npm** (comes with Node.js)

### Check Installation
```bash
node --version    # Should be v20+
npm --version     # Should be 10+
psql --version    # Should be 12+
```

---

## Step 1: PostgreSQL Setup

### Windows

**Install PostgreSQL:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer, choose default port 5432
3. Set password for `postgres` user (remember this!)
4. Complete installation

**Create Database:**
```bash
# Open PowerShell as Administrator
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE medikal_scale;
\q
```

### Mac/Linux

```bash
# Mac (using Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
createdb medikal_scale
```

---

## Step 2: Backend Setup

### Clone/Navigate to Backend Folder
```bash
cd "D:\Perkuliahan\semester 7\medis\backend"
```

### Install Dependencies
```bash
npm install
```

### Configure Environment

Edit `.env` file:
```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medikal_scale
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

Replace `your_postgres_password` with the password you set during PostgreSQL installation.

### Build TypeScript
```bash
npm run build
```

### Create Database Tables
```bash
npm run db:migrate
```

### Seed Demo Data
```bash
npm run db:seed
```

---

## Step 3: Start Backend Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

**Expected Output:**
```
Server running on http://localhost:3000
Database connected to medikal_scale
WebSocket ready for real-time updates
```

---

## Step 4: Verify Backend Working

### Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dokter","password":"dokter123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "username": "dokter",
    "role_id": "dokter",
    "permissions": [...]
  }
}
```

### Test Queue Endpoint
```bash
curl -X GET http://localhost:3000/api/antrian \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Demo Credentials

Use these to test login:

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | dokter | dokter123 |
| Nurse | perawat | perawat123 |

---

## Connect Frontend to Backend

### Update Frontend .env
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Start Frontend
```bash
cd ../frontend
npm run dev
```

### Test Connection
1. Open http://localhost:5173
2. Login with `dokter` / `dokter123`
3. Should see dashboard

---

## Database Schema

### Tables Created

**users**
- id, username, password_hash, role_id, permissions[], created_at

**roles**
- id, name (admin, dokter, perawat, staff_antrian)

**pasien**
- id, no_rm, nama, tanggal_lahir, no_telepon, alamat

**kunjungan** (Visits/Queue)
- id, pasien_id, no_antrian, tanggal_kunjungan, poli, layanan
- status_antrian (putih/hijau/kuning/merah), prioritas, created_at, updated_at

**antrian_log** (Audit trail)
- id, kunjungan_id, status_lama, status_baru, changed_by, changed_at

**antropometri** (Measurements)
- id, kunjungan_id, tinggi, berat, lingkar_kepala, umur_bulan
- created_by_user_id, created_at

---

## API Endpoints

### Authentication
```
POST   /api/auth/login              - Login with credentials
POST   /api/auth/refresh            - Refresh JWT token
```

### Antrian (Queue)
```
GET    /api/antrian?filters         - List queues (poli, layanan, status, tanggal)
GET    /api/antrian/:id             - Get single queue detail
PUT    /api/antrian/:id/status      - Update queue status & prioritas
GET    /api/antrian/log/:kunjungan_id - Get status change history
```

### Antropometri (Measurements)
```
POST   /api/antropometri            - Create new measurement
GET    /api/antropometri/pasien/:pasien_id - Get patient measurement history
GET    /api/antropometri/report     - Generate report (poli, date range)
```

### Pasien (Patients)
```
GET    /api/pasien/:id              - Get patient detail
GET    /api/pasien/:pasien_id/kunjungan - Get patient visits
```

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Change PORT in .env to 3001
PORT=3001
npm start
```

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solutions:
1. Check PostgreSQL is running:
   - Windows: Services app → PostgreSQL
   - Mac: brew services list
   - Linux: sudo systemctl status postgresql

2. Verify DB credentials in .env

3. Test connection:
   psql -U postgres -h localhost -d medikal_scale
```

### Migration Error
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE medikal_scale;"
psql -U postgres -c "CREATE DATABASE medikal_scale;"
npm run db:migrate
npm run db:seed
```

### JWT Token Expired
- Token expires after 24 hours
- Use POST /api/auth/refresh to get new token
- Frontend handles auto-refresh

### CORS Error
- Check FRONTEND_URL in .env matches your frontend URL
- Default: http://localhost:5173

---

## npm Scripts

```bash
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
npm run dev          # Run with auto-reload (ts-node)
npm run db:migrate   # Create database schema
npm run db:seed      # Load demo data
npm run lint         # TypeScript check
npm run clean        # Remove dist/ and node_modules
```

---

## Environment Variables (.env)

```
# Database Connection
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port
DB_NAME=medikal_scale     # Database name
DB_USER=postgres          # DB username
DB_PASSWORD=postgres      # DB password

# JWT Configuration
JWT_SECRET=change_this_in_production  # Secret key for JWT
JWT_EXPIRE=24h            # Token expiration time

# Server
PORT=3000                 # Server port
NODE_ENV=development      # development or production

# CORS
FRONTEND_URL=http://localhost:5173  # Frontend URL for CORS
```

---

## Production Deployment

### Environment Variables (Production)
```
DB_PASSWORD=strong_production_password
JWT_SECRET=very_long_random_secret_key_here
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://app.yourdomain.com
```

### Build
```bash
npm run build
npm start
```

### Docker (Optional)
```bash
docker build -t medikal-backend .
docker run -p 3000:3000 --env-file .env medikal-backend
```

---

## WebSocket Events

### Real-time Antrian Updates

**Backend broadcasts to frontend:**
```javascript
socket.emit('antrian:update', {
  kunjungan_id: 'xxx',
  status: 'hijau',
  prioritas: false,
  timestamp: new Date()
});

socket.emit('antrian:new', {
  kunjungan_id: 'xxx',
  no_antrian: 'A001',
  nama_pasien: 'Budi Santoso',
  poli: 'Umum'
});

socket.emit('antrian:call', {
  no_antrian: 'A001',
  poli: 'Umum',
  ruangan: 'Ruang 1'
});
```

---

## Testing Backend APIs

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dokter","password":"dokter123"}'
```

**Get Queues (replace TOKEN):**
```bash
curl -X GET http://localhost:3000/api/antrian \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Download Postman
2. Create new request
3. Method: POST
4. URL: http://localhost:3000/api/auth/login
5. Body (JSON):
   ```json
   {
     "username": "dokter",
     "password": "dokter123"
   }
   ```
6. Send
7. Copy token from response
8. Use token in Authorization header for other requests

---

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database
3. ✅ Configure .env
4. ✅ Run migrations
5. ✅ Seed demo data
6. ✅ Start backend (`npm run dev`)
7. ✅ Update frontend .env with backend URLs
8. ✅ Start frontend (`npm run dev`)
9. ✅ Test login with demo credentials

---

**Backend Ready!** Start with: `npm run dev`
