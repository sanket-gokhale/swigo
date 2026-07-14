import '../styles/globals.css';
import React from 'react';
import { LocationProvider } from '../context/LocationContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="bottom-right" />
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  );
}
