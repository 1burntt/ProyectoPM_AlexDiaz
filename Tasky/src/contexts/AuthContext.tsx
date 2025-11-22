import React, { createContext, useContext, useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { setProfile, clearProfile } from "../store/profileSlice";

type User = {
  email: string;
  password: string;
  phone: number;
} | null;

type AuthContextType = {
  user: User | null;
  isAllowed: boolean;
  login: (email: string, password: string, phone: number) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const login = (email: string, password: string, phone: number): boolean => {
    const allowedEmail = email.includes('@') && email.includes('.');
    const allowedPassword = password.length >= 6;
    
    if (allowedEmail && allowedPassword) {
      setUser({ email, password, phone });
      setIsAllowed(true);
      
      // Crear perfil automáticamente al hacer login
      const newProfile = {
        id: Date.now().toString(),
        email,
        phone: phone.toString(),
        firstName: email.split('@')[0], // Nombre por defecto basado en email
        lastName: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch(setProfile(newProfile));
      return true;
    }
    
    return false;
  }

  const logout = () => {
    setUser(null);
    setIsAllowed(false);
    dispatch(clearProfile()); // Limpiar perfil al hacer logout
  }

  return (
    <AuthContext.Provider value={{ user, isAllowed, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}