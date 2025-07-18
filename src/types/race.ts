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
}