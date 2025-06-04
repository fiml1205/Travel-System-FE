'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextProps {
  isOpen: boolean;
  mode: number; // 1 = login, 2 = register
  userType: number; // 1 = customer, 2 = company
  openModal: (mode?: number, userType?: number) => void;
  closeModal: () => void;
  setMode: (mode: number) => void;
  setUserType: (type: number) => void;
}

const AuthModalContext = createContext<AuthModalContextProps | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<1 | 2>(1); // default login
  const [userType, setUserType] = useState<1 | 2>(1); // default customer

  const openModal = (mode: number = 1, userType: number = 1) => {
    setMode(mode);
    setUserType(userType);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, userType, openModal, closeModal, setMode, setUserType }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
};
