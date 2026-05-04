import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    s.on('new-listing', ({ listing }) => {
      toast.custom(() => (
        <div style={{ background: '#111827', border: '1px solid rgba(0,230,118,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', color: '#f0f4ff', fontSize: 14 }}>
          <span style={{ fontSize: 20 }}>🍱</span>
          <div><strong>New food available!</strong><br /><span style={{ color: '#8b98b8' }}>{listing?.title}</span></div>
        </div>
      ), { duration: 4000 });
    });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join-room', user._id);
      if (user.role === 'admin') socket.emit('join-admin');
      socket.on('notification', (notif) => {
        toast(notif.message, { icon: notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : 'ℹ️', duration: 5000 });
      });
    }
  }, [socket, user]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
