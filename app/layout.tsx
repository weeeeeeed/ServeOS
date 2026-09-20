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
  themeColor: '#faf8f5',
};

export const metadata: Metadata = {
  title: {
    default: 'ServeOS - Premium Restaurant Operating System',
    template: '%s | ServeOS',
  },
  description:
    'Cozy, calm, premium restaurant operating system: contactless QR menus, live KDS kitchen display, floor radar, staff, accounting & marketing.',
  keywords: [
    'serveos restaurant operating system',
    'restaurant qr menu',
    'botanical restaurant pos',
    'kitchen display system',
    'restaurant floor plan',
    'restaurant accounting ledger',
  ],
  authors: [{ name: 'ServeOS' }],
  creator: 'ServeOS',
  metadataBase: new URL('https://serveos.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://serveos.app',
    title: 'ServeOS - Premium Restaurant Operating System',
    description:
      'The modern restaurant operating system: QR ordering, live orders, kitchen display, analytics, and floor management.',
    siteName: 'ServeOS',
  },
  manifest: '/manifest.json',
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
