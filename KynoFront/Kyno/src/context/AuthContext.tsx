import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/authService';
import { isAuthenticated as checkAuth } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await checkAuth();
      if (authenticated) {
        try {
          const userData = await authService.getMe();
          console.log('AuthContext.checkAuthStatus - fetched user:', userData);
          setUser(userData);
        } catch (getMeError) {
          console.log('Erreur lors de la récupération des données utilisateur:', getMeError);
          // Si getMe échoue, c'est que le token est invalide ou qu'il y a un problème serveur
          setUser(null);
          await authService.logout();
        }
      }
    } catch (error) {
      console.log('Utilisateur non authentifié ou token invalide');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.login(credentials);
      console.log('AuthContext.login - user after login:', userData);
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.register(data);
      console.log('AuthContext.register - user after register:', userData);
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      console.log('AuthContext.refreshUser - refreshed user:', userData);
      setUser(userData);
    } catch (error) {
      console.log('Erreur refresh user - token probablement invalide');
      // Si le refresh échoue, déconnecter l'utilisateur
      setUser(null);
      await authService.logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
