import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/nav';

export default function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-64 md:flex-col md:border-r md:border-hairline md:bg-surface">
      <div className="px-6 py-6">
        <img
          src="/rapidkl-logo.png"
          alt="RapidKL"
          className="h-9 w-auto mix-blend-multiply"
        />
        <p className="mt-2 text-xs text-ink-tertiary">Rail companion</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-elevated font-medium text-ink-primary'
                  : 'text-ink-secondary hover:bg-elevated/60 hover:text-ink-primary'
              }`}
            >
              <Icon size={18} className={active ? 'text-accent' : 'text-ink-tertiary'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-6 py-4">
        <p className="text-xs text-ink-tertiary">Data refreshes automatically</p>
      </div>
    </aside>
  );
}
