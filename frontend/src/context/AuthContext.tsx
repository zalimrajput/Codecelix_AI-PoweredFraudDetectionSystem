import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, LoginCredentials, RegisterPayload, AuthContextType } from '../types/auth';
import * as authApi from '../api/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'codecelix_auth_token';
const ROLE_KEY = 'codecelix_user_role';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem(ROLE_KEY) as UserRole;
    return savedRole || 'ADMIN';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  });

  useEffect(() => {
    // Check if token exists to load initial user profile
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      authApi.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setRoleState(userData.role);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid or backend is not connected yet
          // Keep role accessible for frontend UI evaluation
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      setRoleState('ANALYST');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(ROLE_KEY, response.user.role);
      setUser(response.user);
      setRoleState(response.user.role);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(payload);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(ROLE_KEY, response.user.role);
      setUser(response.user);
      setRoleState(response.user.role);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    setUser(null);
    setRoleState('ANALYST');
    setIsAuthenticated(false);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(ROLE_KEY, newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
