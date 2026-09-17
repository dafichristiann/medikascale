# Quick Start Guide

## Installation & Setup (2 minutes)

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your backend URLs:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Start Development Server
```bash
npm run dev
```

Open browser: **http://localhost:5173**

---

## Login Credentials (Demo)

```
Username: dokter
Password: demo123
```

Or use your backend credentials.

---

## Project Layout

### Main Routes
- `/login` - Authentication
- `/dashboard` - Home (role-based)
- `/antrian` - Queue management
- `/antropometri` - Measurements & charts
- `/rekam-medis` - Medical records (placeholder)
- `/lab-radiologi` - Lab orders (placeholder)
- `/resep` - Prescriptions (placeholder)

### File Structure Quick Reference

```
src/
├── components/      # React components
├── pages/          # Page components (routed)
├── services/       # API & WebSocket
├── store/          # Zustand state
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── utils/          # Utilities
```

---

## Key Features

### Antrian (Queue)
- Real-time queue list
- Status: putih → hijau → kuning → merah
- Priority marking (Dokter only)
- Auto-refresh with WebSocket fallback

### Antropometri (Measurements)
- Input form (tinggi, berat, lingkar kepala)
- WHO growth charts (Recharts)
- Riwayat pengukuran per pasien
- Export PDF/CSV report

### Dashboards
- **Dokter**: Total antrian, prioritas count, wait time stats
- **Perawat**: Antrian, quick input antropometri, pending measurements

### Authentication
- JWT token-based
- Permission system
- Auto-logout on 401
- Role-based navigation

---

## Common Tasks

### Add a New Component

1. Create file in `src/components/[feature]/ComponentName.tsx`
2. Export from component
3. Import & use in pages

```tsx
// src/components/feature/MyComponent.tsx
export const MyComponent = () => {
  return <div>Hello</div>;
};
```

### Add a Store (Zustand)

```tsx
// src/store/myStore.ts
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: [],
  fetch: async () => {
    // Load data
  },
}));
```

### Add an API Endpoint

```tsx
// src/services/api.ts
export const myService = {
  get: async () => {
    const res = await api.get('/my-endpoint');
    return res.data;
  },
};
```

### Add a New Page

1. Create `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`

```tsx
<Route path="/my-page" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
```

---

## Debugging

### Check Browser Console
- Open DevTools (F12)
- Check Console tab for errors
- Network tab to inspect API calls

### Check WebSocket Connection
```javascript
// In browser console
socket.connected  // true/false
socket.id         // Connection ID
```

### View Network Requests
- Network tab → filter by fetch/XHR
- Check request/response headers
- Verify CORS headers present

### TypeScript Errors
```bash
npm run build  # Shows all type errors
```

---

## Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3001
```

### WebSocket Connection Fails
1. Check CORS config on backend
2. Verify backend server running
3. Check firewall/proxy settings
4. Fallback polling should work (check console)

### API 401 Unauthorized
1. Clear localStorage: `localStorage.clear()`
2. Refresh page & login again
3. Check JWT token format

### Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

## Production Build

```bash
npm run build        # Generate dist/
npm run preview      # Test production build locally
```

Deploy `dist/` folder to:
- Vercel: `vercel deploy dist`
- Netlify: Drag & drop `dist`
- Docker: See DEPLOYMENT.md
- Static host: Upload to CDN

---

## Backend Integration Checklist

- [ ] Backend API running
- [ ] WebSocket server running
- [ ] CORS enabled for frontend domain
- [ ] JWT secret configured
- [ ] Database tables created (kunjungan, antrian_log, antropometri)
- [ ] Test login endpoint works
- [ ] Test WebSocket connection
- [ ] Update .env with correct URLs

---

## npm Scripts

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # TypeScript check
```

---

## Performance Tips

- Use React DevTools (Chrome extension)
- Check bundle size: `npm run build`
- Profile with Lighthouse
- Monitor WebSocket for disconnects

---

## Support

### Documentation Files
- `README.md` - Overview & features
- `DEPLOYMENT.md` - Deployment guide
- `API_INTEGRATION.md` - API endpoints
- `DESIGN_SYSTEM.md` - UI/UX specs
- `PROJECT_SUMMARY.md` - Complete summary

### Need Help?
1. Check documentation files
2. Review error messages in console
3. Verify backend connectivity
4. Check network requests (DevTools)

---

## Next Steps

1. ✅ Install & run locally
2. ✅ Login with credentials
3. ✅ Test antrian list (real-time)
4. ✅ Test antropometri input
5. ✅ Verify WebSocket updates
6. ✅ Build for production

---

**Ready to develop!** 🚀

Start with: `npm run dev`
