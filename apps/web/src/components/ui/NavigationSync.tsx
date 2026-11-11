'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCameraStore } from '@/lib/store/useCameraStore';

export function NavigationSync() {
  const pathname = usePathname();

  useEffect(() => {
    const store = useCameraStore.getState();

    if (pathname === '/') {
      store.setMode('LANDING');
    } else if (pathname === '/properties') {
      store.setMode('GALLERY');
      store.flyTo(
        {
          position: [0, 1.2, 4.5],
          target: [0, 1.2, 0],
          fov: 70,
        },
        { duration: 0.8, fovPulse: 6 }
      );
    } else if (pathname.startsWith('/properties/')) {
      store.setMode('IMMERSIVE');
      store.flyTo(
        {
          position: [0, 0, 0],
          target: [0, 0, -1],
          fov: 75,
        },
        { duration: 0.8, fovPulse: 8 }
      );
    } else if (pathname.startsWith('/admin')) {
      store.setMode('CINEMATIC');
    }
  }, [pathname]);

  return null;
}
