import type { Metadata } from 'next';
import './globals.css';
import { AppCanvas } from '@/components/3d/AppCanvas';
import { Header } from '@/components/ui/Header';
import { NavigationSync } from '@/components/ui/NavigationSync';
import { ThemeScript } from '@/components/ui/ThemeScript';

export const metadata: Metadata = {
  title: 'AURA 3D — Camera-Driven Luxury Shortlets',
  description:
    'Experience luxury properties through continuous 3D camera travel. Immersive 360° panoramas, interactive spatial exploration, and seamless reservations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased overflow-x-hidden">
        {/* Navigation sync for camera modes without remounting canvas */}
        <NavigationSync />

        {/* Persistent 3D WebGL Canvas */}
        <AppCanvas />

        {/* Global Glass Header */}
        <Header />

        {/* HTML Sandwich Overlay */}
        <main className="relative z-10 pointer-events-none min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
