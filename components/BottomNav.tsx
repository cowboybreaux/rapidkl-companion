import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/nav';

export default function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline/80 bg-surface/95 shadow-[0_-8px_24px_rgba(16,42,67,0.08)] backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-xl">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-1 flex-col items-center gap-0.5 py-2"
              aria-current={active ? 'page' : undefined}
            >
              <span className={`rounded-xl px-5 py-1 transition-colors ${active ? 'bg-accent/10' : 'group-hover:bg-elevated/70'}`}>
                <Icon size={20} className={active ? 'text-accent' : 'text-ink-tertiary'} />
              </span>
              <span className={`text-[11px] ${active ? 'font-medium text-ink-primary' : 'text-ink-tertiary'}`}>
                {item.short}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
