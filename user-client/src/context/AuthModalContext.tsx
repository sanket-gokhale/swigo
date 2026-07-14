'use client';
import React, { createContext, useContext, useState } from 'react';

interface AuthModalContextType {
  isOpen: boolean;
  openModal: (onSuccess?: () => void) => void;
  closeModal: () => void;
  onSuccessAction: (() => void) | null;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onSuccessAction, setOnSuccessAction] = useState<(() => void) | null>(null);

  const openModal = (onSuccess?: () => void) => {
    if (onSuccess) setOnSuccessAction(() => onSuccess);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setOnSuccessAction(null);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, onSuccessAction }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
