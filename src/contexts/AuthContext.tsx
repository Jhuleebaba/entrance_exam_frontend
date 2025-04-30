import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

interface User {
  email: string;
  fullName: string;
  role: 'admin' | 'student';
  examGroup?: number;
  examDateTime?: string;
  examNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (token) {
      // Verify token and get user data
      axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          if (response.data.success) {
            const userData = response.data.user;
            setUser({
              ...userData,
              // Ensure examDateTime is properly handled if it's a Date object
              examDateTime: userData.examDateTime
                ? new Date(userData.examDateTime).toISOString()
                : undefined
            });
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'admin');
            localStorage.setItem('userRole', userData.role);
          } else {
            handleLogout();
          }
        })
        .catch(() => {
          handleLogout();
        });
    } else if (userRole) {
      // If token is missing but userRole exists, clean up localStorage
      handleLogout();
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userData.role);
    // Ensure examDateTime is properly handled if it's a Date object
    setUser({
      ...userData,
      examDateTime: userData.examDateTime
        ? new Date(userData.examDateTime).toISOString()
        : undefined
    });
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 