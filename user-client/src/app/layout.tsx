import type { Metadata } from 'next';
import { GoogleAnalytics } from "@next/third-parties/google";
import '../styles/globals.css';
import React from 'react';

export const metadata: Metadata = {
  title: {
    default: "Swigo - Find PGs, Hostels & Flats",
    template: "%s | Swigo",
  },
  description:
    "Find verified PGs, hostels, flats, and homestays across India. Book your next stay with Swigo.",
  keywords: [
    "PG Booking",
    "Hostel Booking",
    "Flats",
    "Homestay",
    "Student PG",
    "Swigo",
    "Rental Rooms",
  ],
  openGraph: {
    title: 'Swigo - Find PGs, Hostels & Flats',
    description: 'Find verified PGs, hostels, flats, and homestays across India. Book your next stay with Swigo.',
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
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
    </html>
  );
}
