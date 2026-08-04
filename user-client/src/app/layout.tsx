import type { Metadata } from 'next';
import '../styles/globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: 'Swigo - Food & Property Delivery',
  description: 'Swigo is your ultimate platform for food delivery, tiffin services, and property rentals. Fast, reliable, and convenient.',
  keywords: 'swigo, food delivery, tiffin service, property rental, fast delivery',
  openGraph: {
    title: 'Swigo - Food & Property Delivery',
    description: 'Swigo is your ultimate platform for food delivery, tiffin services, and property rentals.',
    url: 'https://swigo.me',
    siteName: 'Swigo',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'add-your-google-site-verification-code',
  },
};
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
