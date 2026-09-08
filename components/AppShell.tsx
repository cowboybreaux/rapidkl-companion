'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-[#B8CAE0]/80 bg-[#DFECF9]/95 px-4 shadow-[0_5px_20px_rgba(16,42,67,0.08)] backdrop-blur-xl">
          <img
            src="/rapidkl-logo.png"
            alt="RapidKL"
            className="h-[29px] w-auto drop-shadow-[0_2px_4px_rgba(16,42,67,0.14)]"
          />
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pt-8">
          {children}
        </main>
      </div>
      <BottomNav pathname={pathname} />
    </div>
  );
}
