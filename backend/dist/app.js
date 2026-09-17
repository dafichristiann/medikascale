import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import aantrianRoutes from './routes/aantrianRoutes.js';
import antropometriRoutes from './routes/antropometriRoutes.js';
import pasienRoutes from './routes/pasienRoutes.js';
let ioInstance = null;
export function getIO() {
    return ioInstance;
}
export function emitAntrianUpdate(payload) {
    ioInstance?.emit('antrian:update', payload);
}
export function createApp() {
    const app = express();
    app.use(cors({ origin: config.frontendUrl, credentials: true }));
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/antrian', aantrianRoutes);
    app.use('/api/antropometri', antropometriRoutes);
    app.use('/api/pasien', pasienRoutes);
    app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    return app;
}
export function setupWebSocket(app) {
    const httpServer = createServer(app);
    const io = new SocketIOServer(httpServer, {
        cors: { origin: config.frontendUrl, credentials: true },
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
    ioInstance = io;
    return io;
}
//# sourceMappingURL=app.js.map