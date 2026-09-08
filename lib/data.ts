import { KtmStation, KtmTrain, Line, NearbyStation, ServiceAlert } from './types';

export const LINES: Line[] = [
  { id: 'kelana', status: 'normal', headway: '4 min', statusDetail: 'Trains are operating to schedule between Gombak and Putra Heights. Platforms are moderately busy in the city centre.' },
  { id: 'ampang', status: 'delayed', headway: '9 min', statusDetail: 'A scheduled inspection near Chan Sow Lin is extending wait times. Allow an additional 5–10 minutes for your journey.' },
  { id: 'mrt', status: 'normal', headway: '5 min', statusDetail: 'Kajang Line services are running normally in both directions with no reported station closures.' },
  { id: 'monorail', status: 'normal', headway: '6 min', statusDetail: 'KL Monorail services are operating normally between KL Sentral and Titiwangsa.' },
  { id: 'ktm', status: 'disrupted', headway: '18 min', statusDetail: 'A signalling issue is affecting KTM Komuter services near Bank Negara. Some trains may be held or rescheduled.' },
  { id: 'putrajaya', status: 'normal', headway: '5 min', statusDetail: 'Putrajaya Line trains are operating normally between Kwasa Damansara and Putrajaya Sentral.' },
];

export const NEARBY_STATIONS: NearbyStation[] = [
  { id: 'klcc', name: 'KLCC', code: 'KJ10', lineId: 'kelana', distanceKm: 0.4, etaMinutes: 3, address: 'Jalan Ampang, 50450 Kuala Lumpur, Malaysia', latitude: 3.159167, longitude: 101.713889, status: 'Operating normally', statusDetail: 'All entrances, lifts and platforms are open.', arrivals: [{ lineId: 'kelana', destination: 'Putra Heights', minutes: 3, platform: 'Platform 1' }, { lineId: 'kelana', destination: 'Gombak', minutes: 7, platform: 'Platform 2' }] },
  { id: 'masjid-jamek', name: 'Masjid Jamek', code: 'KJ13 · AG7 · SP7', lineId: 'ampang', distanceKm: 0.9, etaMinutes: 7, address: 'Jalan Tun Perak, 50050 Kuala Lumpur, Malaysia', latitude: 3.149667, longitude: 101.696417, status: 'Minor delays', statusDetail: 'Ampang Line services are running at reduced frequency.', arrivals: [{ lineId: 'kelana', destination: 'Gombak', minutes: 4, platform: 'Platform 2' }, { lineId: 'ampang', destination: 'Ampang', minutes: 7, platform: 'Platform 1' }] },
  { id: 'bukit-bintang', name: 'Bukit Bintang', code: 'KG18A', lineId: 'mrt', distanceKm: 1.1, etaMinutes: 5, address: 'Jalan Bukit Bintang, Bukit Bintang, 55100 Kuala Lumpur, Malaysia', latitude: 3.146503, longitude: 101.710947, status: 'Operating normally', statusDetail: 'Kajang Line platforms and all station entrances are open.', arrivals: [{ lineId: 'mrt', destination: 'Kajang', minutes: 5, platform: 'Platform 1' }, { lineId: 'mrt', destination: 'Kwasa Damansara', minutes: 9, platform: 'Platform 2' }] },
  { id: 'hang-tuah', name: 'BBCC – Hang Tuah', code: 'AG9 · SP9 · MR4', lineId: 'monorail', distanceKm: 1.6, etaMinutes: 6, address: 'Bukit Bintang City Centre, Jalan Hang Tuah, Pudu, 55200 Kuala Lumpur, Malaysia', latitude: 3.13988, longitude: 101.7063, status: 'Operating normally', statusDetail: 'LRT and Monorail interchange paths are operating normally.', arrivals: [{ lineId: 'monorail', destination: 'Titiwangsa', minutes: 6, platform: 'Platform 2' }, { lineId: 'ampang', destination: 'Sentul Timur', minutes: 8, platform: 'Platform 1' }] },
  { id: 'kl-sentral', name: 'KL Sentral', code: 'KA01 · KJ15 · MR1', lineId: 'ktm', distanceKm: 2.3, etaMinutes: 18, address: 'Kuala Lumpur Sentral, 50470 Kuala Lumpur, Malaysia', latitude: 3.1343, longitude: 101.6864, status: 'Service disruption', statusDetail: 'KTM Komuter departures may be delayed by 15–20 minutes.', arrivals: [{ lineId: 'kelana', destination: 'Putra Heights', minutes: 2, platform: 'Platform 1' }, { lineId: 'ktm', destination: 'Batu Caves', minutes: 18, platform: 'Platform 3' }] },
  { id: 'pasar-seni', name: 'Pasar Seni', code: 'KJ14 · KG16', lineId: 'kelana', distanceKm: 1.8, etaMinutes: 9, address: 'Jalan Sultan, 50000 Kuala Lumpur, Malaysia', latitude: 3.1425, longitude: 101.69528, status: 'Operating normally', statusDetail: 'The LRT–MRT paid interchange link is open.', arrivals: [{ lineId: 'kelana', destination: 'Gombak', minutes: 4, platform: 'Platform 2' }, { lineId: 'mrt', destination: 'Kajang', minutes: 9, platform: 'Platform 1' }] },
];

export const KTM_STATIONS: KtmStation[] = [
  { id: 'batu-caves', name: 'Batu Caves', code: 'KA01' },
  { id: 'sentul', name: 'Sentul', code: 'KA03' },
  { id: 'bank-negara', name: 'Bank Negara', code: 'KA04' },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', code: 'KA05' },
  { id: 'kl-sentral', name: 'KL Sentral', code: 'KB01' },
  { id: 'mid-valley', name: 'Mid Valley', code: 'KB02' },
];

// afterStationIndex: the train is currently between this station and the next
export const KTM_TRAINS: KtmTrain[] = [
  {
    id: 't1',
    direction: 'Southbound',
    from: 'Batu Caves',
    to: 'Mid Valley',
    progress: 0.4,
    etaMinutes: 3,
    afterStationIndex: 1,
  },
  {
    id: 't2',
    direction: 'Northbound',
    from: 'Mid Valley',
    to: 'Batu Caves',
    progress: 0.65,
    etaMinutes: 4,
    afterStationIndex: 3,
  },
  {
    id: 't3',
    direction: 'Northbound',
    from: 'KL Sentral',
    to: 'Bank Negara',
    progress: 0.2,
    etaMinutes: 6,
    afterStationIndex: 0,
  },
];

export const ALERTS: ServiceAlert[] = [
  {
    id: 'a1',
    lineId: 'ktm',
    severity: 'critical',
    title: 'Disruption between Kuala Lumpur and Bank Negara',
    description:
      'A signalling fault is causing trains to single-track through this section. Expect delays of 15–20 minutes.',
    timestamp: '12 min ago',
  },
  {
    id: 'a2',
    lineId: 'kelana',
    severity: 'warning',
    title: 'Higher than usual passenger volume',
    description:
      'Trains are running with reduced spacing between Gombak and Kelana Jaya during peak hours.',
    timestamp: '28 min ago',
  },
  {
    id: 'a3',
    lineId: 'monorail',
    severity: 'info',
    title: 'Platform doors under maintenance',
    description:
      'Bukit Bintang station platform doors are being serviced overnight. No impact to train frequency.',
    timestamp: '1 hr ago',
  },
  {
    id: 'a4',
    lineId: 'ampang',
    severity: 'warning',
    title: 'Reduced frequency for scheduled inspection',
    description:
      'A routine technical inspection between Chan Sow Lin and Ampang is extending headways to 9 minutes.',
    timestamp: '2 hr ago',
  },
  {
    id: 'a5',
    lineId: 'mrt',
    severity: 'info',
    title: 'Lift out of service at Semantan',
    description:
      'The station lift is undergoing repair. Please use the escalator or seek assistance from station staff.',
    timestamp: '3 hr ago',
  },
];
