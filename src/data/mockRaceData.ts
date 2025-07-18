import { Race, Boat, BoatPosition } from '../types/race'

// Generate realistic sailing positions around Sydney Harbour
const generateBoatTrack = (boatId: string, startLat: number, startLng: number, color: string): Boat => {
  const positions: BoatPosition[] = []
  const startTime = Date.now() - 3600000 // 1 hour ago
  
  let lat = startLat
  let lng = startLng
  let heading = Math.random() * 360
  
  // Generate 60 positions (1 per minute for the last hour)
  for (let i = 0; i < 60; i++) {
    const timestamp = startTime + (i * 60000)
    const speed = 8 + Math.random() * 12 // 8-20 knots
    
    // Simulate realistic sailing movement
    heading += (Math.random() - 0.5) * 30 // Vary heading by ±15°
    const distance = (speed * 0.000539957) / 60 // Convert knots to degrees per minute
    
    lat += Math.cos(heading * Math.PI / 180) * distance
    lng += Math.sin(heading * Math.PI / 180) * distance
    
    positions.push({
      id: `${boatId}-${i}`,
      lat,
      lng,
      timestamp,
      speed,
      heading
    })
  }
  
  return {
    id: boatId,
    name: `Yacht ${boatId.toUpperCase()}`,
    sailNumber: `AUS${Math.floor(Math.random() * 9000) + 1000}`,
    class: Math.random() > 0.5 ? 'IRC' : 'ORCi',
    color,
    positions,
    currentPosition: positions[positions.length - 1]
  }
}

export const mockRace: Race = {
  id: 'sydney-hobart-2024',
  name: 'Sydney to Hobart Yacht Race 2024',
  startTime: Date.now() - 3600000,
  status: 'active',
  boats: [
    generateBoatTrack('wild-oats', -33.8568, 151.2153, '#e11d48'),
    generateBoatTrack('comanche', -33.8570, 151.2155, '#2563eb'),
    generateBoatTrack('scallywag', -33.8572, 151.2157, '#16a34a'),
    generateBoatTrack('black-jack', -33.8574, 151.2159, '#dc2626'),
    generateBoatTrack('perpetual-loyal', -33.8576, 151.2161, '#7c3aed'),
    generateBoatTrack('andoo-comanche', -33.8578, 151.2163, '#ea580c'),
    generateBoatTrack('law-connect', -33.8580, 151.2165, '#0891b2'),
    generateBoatTrack('master-lock', -33.8582, 151.2167, '#be185d')
  ],
  course: {
    start: { lat: -33.8568, lng: 151.2153 },
    marks: [
      { id: 'mark-1', lat: -33.9, lng: 151.3, name: 'Sydney Heads' },
      { id: 'mark-2', lat: -35.5, lng: 150.8, name: 'Jervis Bay' },
      { id: 'mark-3', lat: -37.2, lng: 149.9, name: 'Gabo Island' }
    ],
    finish: { lat: -42.8826, lng: 147.3257 }
  }
}