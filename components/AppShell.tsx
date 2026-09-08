'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen md:flex">
      <Sidebar pathname={pathname} />

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-base/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <img
              src="/rapidkl-logo.png"
              alt="RapidKL"
              className="h-7 w-auto mix-blend-multiply"
            />
          </div>
          <span className="text-xs text-ink-tertiary">Klang Valley</span>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      <BottomNav pathname={pathname} />
    </div>
  );
}
