import React, { createContext, useContext, useState, useEffect } from "react";
import { UserData } from "../types/Interfaces";

interface AuthContextProps {
  user: UserData | null;
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
  token: string | null;
  setUser: (user: UserData | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      fetchUserData(savedToken);
    }
  }, []);

  const fetchUserData = async (tokenToUse: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          "Content-Type": "application/ld+json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data: UserData = await response.json();
      setUser(data);
      setIsLoggedIn(true);
      setToken(tokenToUse);
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    fetchUserData(newToken);
  };
  
  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsLoggedIn(false);
    setToken(null);
  };

  const refreshUser = () => {
    const currentToken = localStorage.getItem("authToken");
    if (currentToken) {
      fetchUserData(currentToken);
    }
  };


  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, login, logout, refreshUser, token, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
