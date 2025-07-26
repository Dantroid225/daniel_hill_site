import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '@/services/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'admin';
}

interface AdminAuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      checkAuthStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/api/admin/profile');
      setAdmin(response.data.data);
    } catch (error) {
      console.error('Admin auth check failed:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/admin/login', { email, password });
      const { token, user } = response.data.data;

      localStorage.setItem('adminToken', token);
      setAdmin(user);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    try {
      await api.put('/api/admin/change-password', {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      console.error('Password change failed:', error);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        changePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// Export context for use in other files
export { AdminAuthContext };
