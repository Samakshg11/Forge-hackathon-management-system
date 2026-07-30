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
          const user = await apiClient.get('/users/me');
          setUser(user);
        } catch {
          setAccessToken(null);
          setUser(null);
        }
      } else {
        // Try silent refresh
        try {
          const res = await apiClient.post('/auth/refresh');
          setAccessToken(res.accessToken);
          setUser(res.user);
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
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const signup = async (data) => {
    const res = await apiClient.post('/auth/signup', data);
    return res;
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
    const user = await apiClient.patch('/users/me', data);
    setUser(user);
    return user;
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
