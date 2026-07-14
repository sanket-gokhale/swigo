import '../styles/globals.css';
import React from 'react';
import { AuthModalProvider } from '../context/AuthModalContext';
import { LocationProvider } from '../context/LocationContext';
import AuthModal from '../components/layout/AuthModal';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="bottom-right" />
        <AuthModalProvider>
          <LocationProvider>
            {children}
            <AuthModal />
          </LocationProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
