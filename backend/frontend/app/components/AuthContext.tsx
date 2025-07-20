"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  jwt?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Debug log to track user state on every render
  useEffect(() => {
    console.log("AuthProvider user:", user);
  }, [user]);

  useEffect(() => {
    // On mount, fetch user info from backend using cookie
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
    // Optionally, call backend to clear cookie
    // fetch("/api/users/logout", { method: "POST" });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
