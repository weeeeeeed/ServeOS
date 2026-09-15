import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#eae9e4',
};

export const metadata: Metadata = {
  title: {
    default: 'BitePoint - Minimalist Restaurant Management & QR Ordering',
    template: '%s | BitePoint',
  },
  description:
    'Tactile hospitality operational platform: contactless table QR menus, live KDS dispatch, table & floor planning, and accounting ledger.',
  keywords: [
    'bitepoint restaurant management',
    'restaurant qr menu',
    'contactless dining',
    'kitchen display system',
    'table floor plan',
    'restaurant accounting ledger',
  ],
  authors: [{ name: 'BitePoint' }],
  creator: 'BitePoint',
  metadataBase: new URL('https://bitepoint.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bitepoint.app',
    title: 'BitePoint - Minimalist Restaurant Management & QR Ordering',
    description:
      'Warm Culinary Modernism: contactless table ordering, live KDS dispatch, analytics, and table QR studio.',
    siteName: 'BitePoint',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${plusJakarta.className} bg-[#eae9e4] text-[#1c1917] min-h-screen antialiased selection:bg-[#efa736] selection:text-stone-950 font-sans`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
