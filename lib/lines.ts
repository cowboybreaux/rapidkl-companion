import { LineId } from './types';

interface LineMeta {
  code: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  leftBorder: string;
}

// Every view (Hub, Map, Alerts) reads colors from this single table, so a
// line's color always means the same thing everywhere in the app.
export const LINE_META: Record<LineId, LineMeta> = {
  kelana: {
    code: 'KJL',
    name: 'Kelana Jaya Line',
    badgeBg: 'bg-line-kelana/15',
    badgeText: 'text-line-kelana',
    badgeBorder: 'border-line-kelana/40',
    leftBorder: 'border-l-line-kelana',
  },
  ampang: {
    code: 'AG',
    name: 'Ampang Line',
    badgeBg: 'bg-line-ampang/15',
    badgeText: 'text-line-ampang',
    badgeBorder: 'border-line-ampang/40',
    leftBorder: 'border-l-line-ampang',
  },
  mrt: {
    code: 'MRT',
    name: 'Kajang Line',
    badgeBg: 'bg-line-mrt/15',
    badgeText: 'text-line-mrt',
    badgeBorder: 'border-line-mrt/40',
    leftBorder: 'border-l-line-mrt',
  },
  monorail: {
    code: 'MR',
    name: 'KL Monorail',
    badgeBg: 'bg-line-monorail/15',
    badgeText: 'text-line-monorail',
    badgeBorder: 'border-line-monorail/40',
    leftBorder: 'border-l-line-monorail',
  },
  ktm: {
    code: 'KTM',
    name: 'KTM Komuter',
    badgeBg: 'bg-line-ktm/15',
    badgeText: 'text-line-ktm',
    badgeBorder: 'border-line-ktm/40',
    leftBorder: 'border-l-line-ktm',
  },
  putrajaya: {
    code: 'PYL',
    name: 'Putrajaya Line',
    badgeBg: 'bg-line-putrajaya/15',
    badgeText: 'text-line-putrajaya',
    badgeBorder: 'border-line-putrajaya/40',
    leftBorder: 'border-l-line-putrajaya',
  },
};
