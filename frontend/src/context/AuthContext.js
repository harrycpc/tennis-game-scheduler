import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tennis_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      const userData = response.data; // { id, name, email, role, token }
      setUser(userData);
      localStorage.setItem('tennis_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      return false;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      await axiosInstance.post('/api/auth/register', { name, email, password });
      return true;
    } catch (error) {
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('tennis_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        isAuthenticated: user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
