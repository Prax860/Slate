// Environment configuration for Socket.io connection

import { WS_URL } from './apiClient';

export const getSocketConfig = () => {
  return {
    url: WS_URL,
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelayMax: 5000,
  };
};
