import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ToastContainer } from '@/components/ui/ToastContainer';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FreightFlow — Digital Freight Marketplace for Africa',
  description:
    'Connect shippers with transporters across Africa. Real-time tracking, SMS/USSD notifications powered by Africa\'s Talking.',
  keywords: ['freight', 'logistics', 'cargo', 'Africa', 'marketplace', 'tracking'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased">
        <Providers>
          {children}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
