/**
 * @file layout.tsx
 * @description Root layout with metadata, fonts, and providers
 * @dependencies globals.css, next/font
 * @created 2026-02-22
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MemoMed AI — Контроль приёма лекарств',
  description:
    'AI-ассистент для контроля приёма лекарств. Помогает пожилым пациентам не пропускать приём и позволяет родственникам следить за дисциплиной.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MemoMed AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#7e57c2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${montserrat.variable} antialiased`}>{children}</body>
    </html>
  );
}
