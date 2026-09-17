# MedikaScale Frontend - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Backend API running at `VITE_API_URL`
- [ ] WebSocket server running at `VITE_SOCKET_URL`
- [ ] CORS configured on backend for frontend domain
- [ ] JWT secret synced between frontend & backend
- [ ] Database migrations completed (kunjungan, antrian_log, antropometri tables)

### 2. Code Quality
- [ ] TypeScript compilation passes: `npm run build`
- [ ] No console errors in production build
- [ ] Accessibility audit passed (keyboard nav, color contrast)
- [ ] Security: No hardcoded secrets, API keys in env vars only

### 3. Build Artifacts
```bash
npm run build
# dist/ folder contains:
# - index.html (0.84 kB)
# - assets/*.css (5.07 kB)
# - assets/vendor*.js (React, Router, Zustand)
# - assets/charts*.js (Recharts)
# - assets/ui*.js (jsPDF, html2canvas)
# - assets/index*.js (App logic)
```

## Deployment Options

### Option 1: Static Host (Vercel, Netlify, GitHub Pages)

**Steps:**
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variables in hosting dashboard:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`

**Netlify Example:**
```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

**Vercel Example:**
```json
{
  "env": ["VITE_API_URL", "VITE_SOCKET_URL"],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Option 2: Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/dist ./dist
ENV VITE_API_URL=http://api:3000/api
ENV VITE_SOCKET_URL=http://api:3000
EXPOSE 3000
CMD ["http-server", "dist", "-p", "3000"]
```

**Build & run:**
```bash
docker build -t medikascale-frontend .
docker run -p 3000:3000 \
  -e VITE_API_URL=http://api:3000/api \
  -e VITE_SOCKET_URL=http://api:3000 \
  medikascale-frontend
```

### Option 3: Node.js Server (Express)

**server.js:**
```javascript
import express from 'express';
import path from 'path';

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Run:**
```bash
npm run build
node server.js
```

## Environment Configuration

### .env.production
```
VITE_API_URL=https://api.medikascale.com/api
VITE_SOCKET_URL=https://api.medikascale.com
```

### CORS Configuration (Backend)
```javascript
// Express example
app.use(cors({
  origin: 'https://app.medikascale.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

### WebSocket Configuration (Backend)
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: 'https://app.medikascale.com',
    credentials: true,
  },
});
```

## Performance Optimization

### Current Bundle Size
- Vendor (React, Router): 592 KB (gzip: 190 KB)
- Charts (Recharts): 377 KB (gzip: 109 KB)
- UI (jsPDF, html2canvas): 600 KB (gzip: 176 KB)
- App Logic: 34 KB (gzip: 7 KB)
- CSS: 5 KB (gzip: 1.5 KB)

### Optimization Tips

1. **Lazy Load Pages** (if needed):
```typescript
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
```

2. **Image Optimization**: Use WebP for charts export preview

3. **Caching Strategy**: Set Cache-Control headers on dist/
```
/index.html: no-cache, must-revalidate
/assets/*: public, max-age=31536000, immutable
```

## Security Checklist

- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] CSP headers set (Content-Security-Policy)
- [ ] X-Frame-Options: SAMEORIGIN (prevent clickjacking)
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security enabled (HSTS)
- [ ] JWT token stored in localStorage (consider httpOnly cookie for production)
- [ ] API validation on backend (trust but verify)
- [ ] Rate limiting on auth endpoints

**Example Security Headers (Nginx):**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## Monitoring & Logging

### Client-side Error Tracking (Optional)
```typescript
// Sentry example
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxx@sentry.io/yyyy",
  environment: "production",
});
```

### Backend Logging
- Log failed login attempts
- Monitor API response times
- Track WebSocket disconnections
- Alert on high error rates

## Rollback Plan

1. Keep previous `dist/` as backup
2. Git tag each production release: `git tag -a v1.0.0`
3. If deploy fails: revert to previous build
4. Monitor error tracking post-deploy (24-48 hours)

## Post-Deployment

1. Test login flow with real backend
2. Verify antrian real-time updates via WebSocket
3. Test antropometri chart rendering
4. Check export PDF/CSV functionality
5. Mobile responsiveness verification
6. Performance audit (Lighthouse)

## Troubleshooting

### WebSocket Connection Fails
- Check CORS config on backend
- Verify Socket.io server running
- Check firewall/proxy settings
- Fallback to polling should work

### API 401 Unauthorized
- Check JWT token validity
- Verify backend token validation
- Clear localStorage & re-login

### Charts Not Rendering
- Check Recharts bundle loaded
- Verify data format matches chart expectations
- Check browser console for errors

## Support & Monitoring

- Error tracking: Sentry or similar
- Uptime monitoring: Pingdom, Datadog
- Performance monitoring: New Relic, DataDog
- Log aggregation: ELK Stack, Splunk

---

**Last Updated:** Sept 17, 2026
**Frontend Version:** 0.0.0
**Deployment:** Production-Ready
