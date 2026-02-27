import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Cleanup } from '@/components/Cleanup';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Withdraw App',
  description: 'Вывод средств',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Cleanup />
      </body>
    </html>
  );
}