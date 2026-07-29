import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { setAccessToken, getAccessToken } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      const existingToken = getAccessToken();
      if (existingToken) {
        try {
          const res = await apiClient.get('/users/me');
          setUser(res.data);
        } catch {
          setAccessToken(null);
          setUser(null);
        }
      } else {
        // Try silent refresh
        try {
          const res = await apiClient.post('/auth/refresh');
          setAccessToken(res.data.accessToken);
          setUser(res.data.user);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('forge:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('forge:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (data) => {
    const res = await apiClient.post('/auth/signup', data);
    return res.data;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout request errors
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    const res = await apiClient.patch('/users/me', data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
