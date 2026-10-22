import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('saferide_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('saferide_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication state
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('saferide_token');
      if (storedToken) {
        try {
          const profileData = await authService.getProfile();
          if (profileData && profileData.user) {
            // Ensure role is preserved in user object
            setUser((prev) => ({
              ...prev,
              ...profileData.user,
              id: profileData.user.id || profileData.user._id || prev?.id,
            }));
          }
        } catch (err) {
          console.warn('Session verification notice:', err?.response?.data?.message || err.message);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    if (data.token && data.user) {
      localStorage.setItem('saferide_token', data.token);
      localStorage.setItem('saferide_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || 'Login failed');
  }, []);

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('saferide_token');
    localStorage.removeItem('saferide_user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
