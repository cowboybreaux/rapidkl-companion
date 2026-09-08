import { Bell, Home, TrainFront, LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'RapidKL Hub', short: 'Hub', icon: Home },
  { href: '/map', label: 'KTM Live Map', short: 'Map', icon: TrainFront },
  { href: '/alerts', label: 'Alerts', short: 'Alerts', icon: Bell },
];
