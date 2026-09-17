import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const connectWebSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket || connectWebSocket();
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onAntrianUpdate = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on('antrian:update', callback);
};

export const onAntrianNew = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on('antrian:new', callback);
};

export const onAntrianCall = (callback: (data: any) => void) => {
  const sock = getSocket();
  sock.on('antrian:call', callback);
};

export const offAntrianUpdate = () => {
  const sock = getSocket();
  sock.off('antrian:update');
};

export const offAntrianNew = () => {
  const sock = getSocket();
  sock.off('antrian:new');
};

export const offAntrianCall = () => {
  const sock = getSocket();
  sock.off('antrian:call');
};
