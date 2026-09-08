import type { LineId, StationLineKey } from './types';

export interface StationLineOption {
  key: StationLineKey;
  lineId: LineId;
  code: string;
  name: string;
}

export const STATION_LINE_OPTIONS: StationLineOption[] = [
  { key: 'kelana', lineId: 'kelana', code: 'KJ', name: 'LRT Kelana Jaya Line' },
  { key: 'ampang', lineId: 'ampang', code: 'AG', name: 'LRT Ampang Line' },
  { key: 'mrt', lineId: 'mrt', code: 'KG', name: 'MRT Kajang Line' },
  { key: 'monorail', lineId: 'monorail', code: 'MR', name: 'KL Monorail Line' },
  { key: 'putrajaya', lineId: 'putrajaya', code: 'PY', name: 'MRT Putrajaya Line' },
  { key: 'ktm-batu', lineId: 'ktm', code: 'KTM', name: 'Batu Caves – Pulau Sebang' },
  { key: 'ktm-port', lineId: 'ktm', code: 'KTM', name: 'Tanjung Malim – Port Klang' },
];

export const STATION_LINE_BY_KEY = Object.fromEntries(
  STATION_LINE_OPTIONS.map((line) => [line.key, line]),
) as Record<StationLineKey, StationLineOption>;
