# MedikaScale - Full Stack Integration Guide

## Project Structure

```
medis/
├── frontend/          # React 18 + TypeScript dashboard
│   ├── src/
│   ├── dist/          # Production build
│   ├── package.json
│   ├── .env           # Frontend config
│   └── README.md
│
├── backend/           # Node.js + Express + PostgreSQL API
│   ├── src/
│   ├── dist/          # Compiled JavaScript
│   ├── package.json
│   ├── .env           # Backend config
│   └── SETUP.md
```

---

## Quick Start (5 minutes)

### Terminal 1: Start Backend

```bash
cd backend
npm install                # First time only
npm run db:migrate        # First time only
npm run db:seed          # First time only
npm run dev              # Runs on http://localhost:3000
```

**Wait for:** `Server running on http://localhost:3000`

### Terminal 2: Start Frontend

```bash
cd frontend
npm install              # First time only
npm run dev             # Runs on http://localhost:5173
```

**Wait for:** Open http://localhost:5173

### Terminal 3 (Optional): Database

```bash
# Check database status
psql -U postgres -d medikal_scale

# View tables
\dt

# Exit
\q
```

---

## Environment Configuration

### Backend (.env)

**Location:** `backend/.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medikal_scale
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=24h
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

**Location:** `frontend/.env`

```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## Login Flow

1. Open http://localhost:5173
2. See login page (redirect from `/dashboard`)
3. Enter credentials:
   - Username: `dokter`
   - Password: `dokter123`
4. Frontend POST to `http://localhost:3000/api/auth/login`
5. Backend validates, returns JWT token
6. Frontend stores token in localStorage
7. Redirects to `/dashboard`
8. WebSocket connects to `http://localhost:3000`

---

## Features to Test

### 1. Authentication
- Login with dokter/dokter123
- Verify token in localStorage (DevTools)
- Logout clears token

### 2. Real-time Antrian
- Backend: Add/update queue status
- Frontend: Auto-updates via WebSocket
- Falls back to polling if WebSocket fails

### 3. Antropometri
- Input measurement data
- Charts update with history
- Export PDF/CSV

### 4. Role-Based Access
- Login as `dokter` — see dokter dashboard
- Login as `perawat` — see perawat dashboard
- Try accessing restricted routes — should see permission denied

### 5. WebSocket Events
- Open browser DevTools Console
- Check for WebSocket connection
- Monitor network tab for Socket.io messages

---

## API Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"dokter","password":"dokter123"}'
```

**Get Queues (replace TOKEN with actual token):**
```bash
curl -X GET "http://localhost:3000/api/antrian?tanggal_kunjungan=2026-09-17" \
  -H "Authorization: Bearer TOKEN"
```

**Update Queue Status:**
```bash
curl -X PUT http://localhost:3000/api/antrian/kunjungan-id/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"status":"hijau","prioritas":false}'
```

### Using Postman

1. Import collection from backend repo (if available)
2. Set base URL: `http://localhost:3000/api`
3. Add Authorization header with JWT token
4. Test each endpoint

---

## Troubleshooting

### Frontend Can't Connect to Backend

**Error:** "ERR_CONNECTION_REFUSED" or "CORS error"

**Solution:**
1. Verify backend running: `http://localhost:3000`
2. Check frontend .env: `VITE_API_URL=http://localhost:3000/api`
3. Restart frontend: `npm run dev`

### Database Connection Failed

**Error:** "connect ECONNREFUSED 127.0.0.1:5432"

**Solution:**
1. Start PostgreSQL service
2. Verify credentials in backend/.env
3. Test: `psql -U postgres -d medikal_scale`
4. Recreate if needed:
   ```bash
   psql -U postgres -c "DROP DATABASE medikal_scale;"
   psql -U postgres -c "CREATE DATABASE medikal_scale;"
   npm run db:migrate
   npm run db:seed
   ```

### WebSocket Connection Fails

**Error:** "WebSocket connection failed"

**Solution:**
1. Backend should be running
2. Check CORS config (FRONTEND_URL in .env)
3. Fallback polling activates automatically
4. Check browser console for details

### Login Returns 401

**Error:** "Invalid credentials" or "User not found"

**Solution:**
1. Verify you seeded data: `npm run db:seed`
2. Check credentials are correct
3. Verify backend running on correct port
4. Check database has users table

### Port Already in Use

**Error:** "EADDRINUSE :::3000" or similar

**Solution:**
1. Kill process on port: `lsof -i :3000` (Mac/Linux)
2. Or change PORT in backend/.env to 3001
3. Update frontend .env to match new backend port

---

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id VARCHAR(50) NOT NULL,
  permissions JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### kunjungan (Queue/Visits)
```sql
CREATE TABLE kunjungan (
  id UUID PRIMARY KEY,
  pasien_id UUID NOT NULL,
  no_antrian VARCHAR(10) NOT NULL,
  tanggal_kunjungan DATE NOT NULL,
  poli VARCHAR(100) NOT NULL,
  layanan VARCHAR(100) NOT NULL,
  status_antrian VARCHAR(20), -- putih, hijau, kuning, merah
  prioritas BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### antropometri (Measurements)
```sql
CREATE TABLE antropometri (
  id UUID PRIMARY KEY,
  kunjungan_id UUID NOT NULL,
  tinggi DECIMAL(5,2),     -- cm
  berat DECIMAL(5,2),      -- kg
  lingkar_kepala DECIMAL(5,2),
  umur_bulan INT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Performance Monitoring

### Frontend
- DevTools Performance tab
- Lighthouse audit
- Network tab for API calls

### Backend
- Terminal logs (request/response times)
- Database query time
- WebSocket message frequency

---

## Security Checklist

- [ ] JWT_SECRET changed in .env
- [ ] DB_PASSWORD changed to strong password
- [ ] FRONTEND_URL set correctly for CORS
- [ ] NODE_ENV=development for dev, production for prod
- [ ] HTTPS enabled in production
- [ ] Rate limiting on auth endpoints (consider adding)
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (React escaping + input validation)

---

## Production Deployment

### Backend Deployment

1. **Environment:**
   ```
   NODE_ENV=production
   JWT_SECRET=very_long_random_secret
   DB_PASSWORD=strong_password
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Build:** `npm run build`

3. **Start:** `npm start`

### Frontend Deployment

1. **Update .env:**
   ```
   VITE_API_URL=https://api.yourdomain.com/api
   VITE_SOCKET_URL=https://api.yourdomain.com
   ```

2. **Build:** `npm run build`

3. **Deploy dist/ to CDN or static host**

### Database

- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Heroku Postgres)
- Regular backups
- Monitor performance
- Set up replication for high availability

---

## Demo Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin | admin123 | All features |
| Doctor | dokter | dokter123 | Antrian, antropometri, dokter dashboard |
| Nurse | perawat | perawat123 | Antrian, antropometri, perawat dashboard |

---

## File Locations

### Frontend
- **Entry:** `frontend/src/main.tsx`
- **Routes:** `frontend/src/App.tsx`
- **Login:** `frontend/src/pages/Login.tsx`
- **Components:** `frontend/src/components/`
- **API:** `frontend/src/services/api.ts`
- **Store:** `frontend/src/store/`

### Backend
- **Entry:** `backend/src/server.ts`
- **App:** `backend/src/app.ts`
- **Routes:** `backend/src/routes/`
- **Controllers:** `backend/src/controllers/`
- **Database:** `backend/src/db/`
- **Config:** `backend/src/config/`

---

## Next Steps

### Phase 1 (Current)
- ✅ Frontend dashboard (antrian, antropometri)
- ✅ Backend API (all endpoints)
- ✅ Authentication & real-time

### Phase 2 (Future)
- Rekam medis module integration
- Lab & radiologi integration
- Advanced reporting & analytics

### Phase 3 (Future)
- Mobile app (React Native)
- Offline mode (IndexedDB)
- SMS/Email notifications
- Payment integration

---

## Support Resources

### Frontend
- `frontend/README.md` — Feature overview
- `frontend/QUICK_START.md` — 2-minute setup
- `frontend/API_INTEGRATION.md` — API endpoints
- `frontend/DEPLOYMENT.md` — Deployment options
- `frontend/DESIGN_SYSTEM.md` — UI specifications

### Backend
- `backend/SETUP.md` — Installation & setup
- `backend/README.md` — API documentation

---

## Testing Checklist

- [ ] Backend runs on localhost:3000
- [ ] Frontend runs on localhost:5173
- [ ] Can login with demo credentials
- [ ] Dashboard loads without errors
- [ ] Real-time antrian updates work
- [ ] Antropometri input saves data
- [ ] Charts display correctly
- [ ] Export PDF/CSV works
- [ ] WebSocket connects
- [ ] Token refresh works
- [ ] Permission gates enforce access

---

**Full Stack Ready!** 🚀

Start backend: `npm run dev` (in backend folder)
Start frontend: `npm run dev` (in frontend folder)
