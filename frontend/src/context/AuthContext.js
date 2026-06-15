import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authAxios = axios.create({ baseURL: API });
  authAxios.interceptors.request.use(cfg => {
    const t = localStorage.getItem('fs_token');
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('fs_token');
    if (!t) { setLoading(false); return; }
    try {
      const { data } = await authAxios.get('/auth/me');
      if (data.success) setUser(data.user);
    } catch { localStorage.removeItem('fs_token'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAxios.post('/auth/login', { email, password });
    if (data.success) { localStorage.setItem('fs_token', data.token); setUser(data.user); }
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAxios.post('/auth/register', userData);
    if (data.success) { localStorage.setItem('fs_token', data.token); setUser(data.user); }
    return data;
  };

  const logout = () => { localStorage.removeItem('fs_token'); setUser(null); };
  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
