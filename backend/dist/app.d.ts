import { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
export declare function getIO(): SocketIOServer | null;
export declare function emitAntrianUpdate(payload: Record<string, unknown>): void;
export declare function createApp(): Express;
export declare function setupWebSocket(app: Express): SocketIOServer;
