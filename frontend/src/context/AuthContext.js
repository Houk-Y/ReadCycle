import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('rc_token');
    const saved = localStorage.getItem('rc_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch {}
      authAPI.getMe()
        .then(({ data }) => { setUser(data.user); localStorage.setItem('rc_user', JSON.stringify(data.user)); })
        .catch(() => { localStorage.removeItem('rc_token'); localStorage.removeItem('rc_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('rc_token', data.token);
    localStorage.setItem('rc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('rc_token', data.token);
    localStorage.setItem('rc_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('rc_token');
    localStorage.removeItem('rc_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      localStorage.setItem('rc_user', JSON.stringify(data.user));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      isLoggedIn: !!user,
      isAdmin: user?.role === 'admin',
      login, register, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};