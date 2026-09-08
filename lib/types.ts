export type LineId =
  | 'kelana'
  | 'ampang'
  | 'mrt'
  | 'monorail'
  | 'ktm'
  | 'putrajaya';

export type LineOperationalStatus = 'normal' | 'delayed' | 'disrupted';

export interface Line {
  id: LineId;
  status: LineOperationalStatus;
  headway: string;
  statusDetail: string;
}

export interface StationArrival {
  lineId: LineId;
  destination: string;
  minutes: number;
  platform: string;
}

export interface NearbyStation {
  id: string;
  name: string;
  code: string;
  lineId: LineId;
  distanceKm: number;
  etaMinutes: number;
  address: string;
  latitude: number;
  longitude: number;
  status: 'Operating normally' | 'Minor delays' | 'Service disruption';
  statusDetail: string;
  arrivals: StationArrival[];
}

export interface KtmStation {
  id: string;
  name: string;
  code: string;
}

export interface KtmTrain {
  id: string;
  direction: 'Northbound' | 'Southbound';
  from: string;
  to: string;
  progress: number;
  etaMinutes: number;
  afterStationIndex: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface ServiceAlert {
  id: string;
  lineId: LineId;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
}
