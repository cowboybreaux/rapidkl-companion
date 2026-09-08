import 'server-only';

import { Readable } from 'node:stream';
import csv from 'csv-parser';
import JSZip from 'jszip';
import stationDirectoryData from './stationDirectory.json';
import type { GtfsStation, LineId, StationLineKey } from './types';

const RAPIDKL_GTFS_URL =
  'https://api.data.gov.my/gtfs-static/prasarana?category=rapid-rail-kl';
const KTMB_GTFS_URL = 'https://api.data.gov.my/gtfs-static/ktmb';
const CACHE_TTL_MS = 6 * 60 * 60 * 1_000;

type RawStopRow = {
  stop_id?: string;
  stop_name?: string;
  stop_lat?: string;
  stop_lon?: string;
};

type FeedStop = {
  stopId: string;
  name: string;
  latitude: number;
  longitude: number;
};

type DirectoryRecord = {
  id: string;
  sequence: number;
  lineKey: StationLineKey;
  lineId: LineId;
  lineName: string;
  code: string;
  name: string;
  structure: string;
  district: string;
  connections: string;
};

const stationDirectory = stationDirectoryData as DirectoryRecord[];
const RAPID_PREFIX: Partial<Record<StationLineKey, string>> = {
  kelana: 'KJ',
  ampang: 'AG',
  mrt: 'KG',
  monorail: 'MR',
  putrajaya: 'PY',
};

let cache: { expiresAt: number; stations: GtfsStation[] } | null = null;

function parseStopsCsv(contents: string): Promise<FeedStop[]> {
  return new Promise((resolve, reject) => {
    const stops: FeedStop[] = [];

    Readable.from([contents])
      .pipe(csv())
      .on('data', (row: RawStopRow) => {
        const stopId = row.stop_id?.trim();
        const name = row.stop_name?.trim();
        const latitude = Number(row.stop_lat);
        const longitude = Number(row.stop_lon);

        if (
          stopId &&
          name &&
          Number.isFinite(latitude) &&
          Number.isFinite(longitude) &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
        ) {
          stops.push({ stopId, name, latitude, longitude });
        }
      })
      .on('end', () => resolve(stops))
      .on('error', reject);
  });
}

function normalizeStationName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\bperhentian\b/g, '')
    .replace(/\bkg\b/g, 'kampung')
    .replace(/\bjln\b/g, 'jalan')
    .replace(/\bbdr\b/g, 'bandar')
    .replace(/\btasek\b/g, 'tasik')
    .replace(/\btelok\b/g, 'teluk')
    .replace(/\btanjong\b/g, 'tanjung')
    .replace(/\bkentomenn\b/g, 'kentonmen')
    .replace(/\bmidvalley\b/g, 'mid valley')
    .replace(/\s+/g, ' ')
    .trim();
}

function namesLooselyMatch(left: string, right: string): boolean {
  const ignoredWords = new Set(['bbcc', 'trx']);
  const leftTokens = new Set(normalizeStationName(left).split(' ').filter((token) => !ignoredWords.has(token)));
  const rightTokens = new Set(normalizeStationName(right).split(' ').filter((token) => !ignoredWords.has(token)));
  return (
    [...leftTokens].every((token) => rightTokens.has(token)) ||
    [...rightTokens].every((token) => leftTokens.has(token))
  );
}

function findFeedStop(entry: DirectoryRecord, rapidStops: FeedStop[], ktmbStops: FeedStop[]): FeedStop | undefined {
  // Segambut Utara opened after the current KTMB stops.txt station list was
  // published. Keep its verified station coordinates until it appears there.
  if (entry.id === 'ktm-port:KA05A') {
    return { stopId: 'KA05A', name: 'SEGAMBUT UTARA', latitude: 3.192, longitude: 101.65507 };
  }

  const pool = entry.lineId === 'ktm'
    ? ktmbStops
    : rapidStops.filter((stop) => stop.stopId.startsWith(RAPID_PREFIX[entry.lineKey] ?? ''));
  const normalizedName = normalizeStationName(entry.name);

  const exactName = pool.find((stop) => normalizeStationName(stop.name) === normalizedName);
  if (exactName) return exactName;

  const ktmbAliases: Partial<Record<string, string>> = {
    'ktm-batu:KB04': 'BDR TASEK SELATAN',
    'ktm-port:KD19': 'PEL KLANG SEL',
  };
  const alias = ktmbAliases[entry.id];
  if (alias) return pool.find((stop) => stop.name === alias);

  const looseMatches = pool.filter((stop) => namesLooselyMatch(stop.name, entry.name));
  if (looseMatches.length === 1) return looseMatches[0];

  if (entry.lineId !== 'ktm') {
    const matchingCode = pool.find((stop) => stop.stopId === entry.code);
    if (matchingCode) return matchingCode;
  }

  return undefined;
}

async function downloadStops(url: string, sourceName: string): Promise<FeedStop[]> {
  const response = await fetch(url, { next: { revalidate: CACHE_TTL_MS / 1_000 } });
  if (!response.ok) throw new Error(`${sourceName} GTFS download failed with status ${response.status}`);

  const archive = await JSZip.loadAsync(await response.arrayBuffer());
  const stopsFile = Object.values(archive.files).find(
    (file) => !file.dir && !file.name.startsWith('__MACOSX/') && /(^|\/)stops\.txt$/i.test(file.name),
  );
  if (!stopsFile) throw new Error(`${sourceName} GTFS archive does not contain stops.txt`);

  return parseStopsCsv(await stopsFile.async('string'));
}

export async function fetchStations(): Promise<GtfsStation[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.stations;

  const [rapidStops, ktmbStops] = await Promise.all([
    downloadStops(RAPIDKL_GTFS_URL, 'RapidKL'),
    downloadStops(KTMB_GTFS_URL, 'KTMB'),
  ]);

  const stations = stationDirectory.flatMap((entry) => {
    const source = findFeedStop(entry, rapidStops, ktmbStops);
    if (!source) {
      console.warn(`No GTFS coordinate match for ${entry.id} (${entry.name})`);
      return [];
    }

    return [{
      stopId: entry.id,
      sourceStopId: source.stopId,
      code: entry.lineId === 'ktm' ? entry.code : source.stopId,
      lineId: entry.lineId,
      lineKey: entry.lineKey,
      name: entry.name,
      latitude: source.latitude,
      longitude: source.longitude,
      sequence: entry.sequence,
      structure: entry.structure,
      district: entry.district,
      connections: entry.connections,
    } satisfies GtfsStation];
  });

  if (!stations.length) throw new Error('No station coordinates could be matched from the GTFS feeds');

  cache = { expiresAt: Date.now() + CACHE_TTL_MS, stations };
  return stations;
}
