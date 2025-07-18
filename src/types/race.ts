export interface BoatPosition {
  id: string
  lat: number
  lng: number
  timestamp: number
  speed: number
  heading: number
}

export interface Boat {
  id: string
  name: string
  sailNumber: string
  class: string
  color: string
  positions: BoatPosition[]
  currentPosition?: BoatPosition
  // Additional metadata for post-race analysis
  skipper?: string
  yacht?: string
  finishTime?: number
  retired?: boolean
  dnf?: boolean
}

export interface Race {
  id: string
  name: string
  startTime: number
  endTime?: number
  status: 'upcoming' | 'active' | 'finished'
  boats: Boat[]
  course: {
    start: { lat: number; lng: number }
    marks: Array<{ id: string; lat: number; lng: number; name: string }>
    finish: { lat: number; lng: number }
  }
  // Additional metadata for historical races
  description?: string
  distance?: number
  location?: string
  year?: number
  weather?: WeatherCondition[]
}

export interface WeatherCondition {
  timestamp: number
  windSpeed: number
  windDirection: number
  waveHeight?: number
  temperature?: number
  pressure?: number
  location: { lat: number; lng: number }
}

export interface Sector {
  id: string
  name: string
  startMark: string
  endMark: string
  distance: number
}

export interface PerformanceMetrics {
  boatId: string
  totalDistance: number
  averageSpeed: number
  maxSpeed: number
  currentPosition: number
  timeElapsed: number
  estimatedFinishTime?: number
  // Additional metrics for post-race analysis
  finishPosition?: number
  totalTime?: number
  correctedTime?: number
  vmg?: number // Velocity Made Good
  tackingEfficiency?: number
}

export interface RaceAnalysis {
  raceId: string
  selectedBoats: string[]
  selectedClasses: string[]
  timeRange?: { start: number; end: number }
  weatherFilter?: boolean
  sectorAnalysis?: boolean
}

// Historical race data structure (matches original repository format)
export interface HistoricalRace {
  id: string
  name: string
  year: number
  location: string
  description: string
  startTime: number
  endTime: number
  distance: number
  boats: Boat[]
  course: Race['course']
  weather?: WeatherCondition[]
  results?: {
    overall: Array<{ boatId: string; position: number; totalTime: number }>
    byClass: Record<string, Array<{ boatId: string; position: number; correctedTime: number }>>
  }
}