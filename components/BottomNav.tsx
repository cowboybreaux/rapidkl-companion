import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/nav';

export default function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex border-t border-hairline bg-surface md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5"
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} className={active ? 'text-accent' : 'text-ink-tertiary'} />
            <span
              className={`text-[11px] ${active ? 'font-medium text-ink-primary' : 'text-ink-tertiary'}`}
            >
              {item.short}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
