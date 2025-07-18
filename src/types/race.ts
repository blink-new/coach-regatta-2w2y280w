export interface RaceInfo {
  id: string;
  name: string;
}

export interface Team {
  id: number;
  owner: string;
  country: string;
  img?: string;
  flag: string;
  sail: string;
  thumb?: string;
  name: string;
  class?: string;
  color?: string;
  boat?: string;
  skipper?: string;
  crew?: string;
  sponsor?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface RaceSetup {
  zoomLevel: number;
  tz: string;
  tab_leaderboard: string;
  laps: number;
  lapz: {
    max: number;
    laps: boolean;
  };
  adverts: Array<{
    duration: number;
    x: number;
    y: number;
    href: string;
    url: string;
  }>;
  tab_segments: string;
  useMobileViewer: boolean;
  heightometer: boolean;
  fadeFullTracksAfterTime: number;
  trackWidth: number;
  debadge: boolean;
  logo: {
    x: number;
    y: number;
    href: string;
    url: string;
  };
  ignMapKey: string | null;
  showEstimatedFinish: boolean;
  flagLate: boolean;
  showTracksDefault: string;
  motd: string | null;
  teams: Team[];
  course?: {
    marks: Array<{
      name: string;
      lat: number;
      lon: number;
      type: string;
    }>;
  };
}

export interface LeaderboardTeam {
  cElapsed: number;
  old: boolean;
  d24: number;
  started: boolean;
  finished: boolean;
  elapsed: number;
  cElapsedFormatted: string;
  rankR: number;
  rankS: number;
  tcf: string;
  dtf: number;
  id: number;
  finishAt?: number;
  elapsedFormatted: string;
  dmg: number;
  speed?: number;
  heading?: number;
  lat?: number;
  lon?: number;
  lastReport?: number;
}

export interface LeaderboardTag {
  teams: LeaderboardTeam[];
  name?: string;
  class?: string;
}

export interface Leaderboard {
  tags: LeaderboardTag[];
}

export interface PositionMoment {
  dtf: number;
  lat: number;
  lon: number;
  at: number;
  speed?: number;
  heading?: number;
  wind_speed?: number;
  wind_direction?: number;
}

export interface BoatPosition {
  id: number;
  moments: PositionMoment[];
}

export type AllPositions = BoatPosition[];

export interface RaceData {
  info: RaceInfo;
  setup: RaceSetup;
  leaderboard: Leaderboard;
  positions: AllPositions;
}

export interface HistoricalRace {
  id: string;
  name: string;
  year: number;
  location: string;
  description: string;
  startTime: number;
  endTime: number;
  distance: number;
  boats: any[];
  weather?: any[];
  results?: any;
  course?: any;
}