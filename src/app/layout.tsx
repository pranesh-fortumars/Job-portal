import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { FirebaseClientProvider } from "@/firebase";
import { BRANDING } from '@/lib/branding';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export const metadata: Metadata = {
  title: `${BRANDING.siteName} | India's All-in-One Job Portal`,
  description: "Connect with MNCs, Corporates, Retail Shops, and Skilled Workers across India. Hiring simplified for everyone.",
  icons: {
    icon: [
      { url: BRANDING.faviconUrl, type: 'image/png' },
    ],
    shortcut: { url: BRANDING.faviconUrl, type: 'image/png' },
    apple: { url: BRANDING.faviconUrl, type: 'image/png' },
  }
};

import { Suspense } from 'react';
import { NavigationLoader } from '@/components/providers/NavigationLoader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Explicit head tags for maximum browser compatibility */}
        <link rel="icon" type="image/png" href={BRANDING.faviconUrl} />
        <link rel="apple-touch-icon" href={BRANDING.faviconUrl} />
        <link rel="shortcut icon" href={BRANDING.faviconUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0">
        <FirebaseClientProvider>
          <LanguageProvider>
            <Suspense fallback={null}>
              <NavigationLoader />
            </Suspense>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <MobileBottomNav />
            <Toaster />
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
