import { HistoricalRace, Boat, BoatPosition, WeatherCondition } from '../types/race'

// Generate realistic historical race data for Cervantes2025 and DGBR2025
const generateHistoricalBoatTrack = (
  boatId: string, 
  name: string,
  sailNumber: string,
  className: string,
  color: string,
  startLat: number, 
  startLng: number,
  raceStartTime: number,
  raceDuration: number
): Boat => {
  const positions: BoatPosition[] = []
  
  let lat = startLat
  let lng = startLng
  let heading = Math.random() * 360
  
  // Generate positions every 5 minutes for the race duration
  const positionInterval = 5 * 60 * 1000 // 5 minutes
  const totalPositions = Math.floor(raceDuration / positionInterval)
  
  for (let i = 0; i < totalPositions; i++) {
    const timestamp = raceStartTime + (i * positionInterval)
    const speed = 6 + Math.random() * 16 // 6-22 knots realistic for offshore racing
    
    // Simulate realistic sailing movement with course changes
    heading += (Math.random() - 0.5) * 40 // Vary heading by ±20°
    const distance = (speed * 0.000539957) / 12 // Convert knots to degrees per 5 minutes
    
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
  
  const finishTime = raceStartTime + raceDuration + (Math.random() - 0.5) * 3600000 // ±30 min variation
  
  return {
    id: boatId,
    name,
    sailNumber,
    class: className,
    color,
    positions,
    currentPosition: positions[positions.length - 1],
    finishTime,
    retired: Math.random() < 0.05 // 5% chance of retirement
  }
}

const generateWeatherData = (raceStartTime: number, raceDuration: number): WeatherCondition[] => {
  const weather: WeatherCondition[] = []
  const weatherInterval = 3600000 // 1 hour
  const totalWeatherPoints = Math.floor(raceDuration / weatherInterval)
  
  for (let i = 0; i < totalWeatherPoints; i++) {
    weather.push({
      timestamp: raceStartTime + (i * weatherInterval),
      windSpeed: 10 + Math.random() * 20, // 10-30 knots
      windDirection: Math.random() * 360,
      waveHeight: 1 + Math.random() * 3, // 1-4 meters
      temperature: 15 + Math.random() * 10, // 15-25°C
      pressure: 1000 + Math.random() * 40, // 1000-1040 hPa
      location: { lat: -31.5 + Math.random() * 2, lng: 115.5 + Math.random() * 2 }
    })
  }
  
  return weather
}

// Cervantes2025 - Perth to Cervantes race
const cervantes2025StartTime = new Date('2025-01-15T08:00:00Z').getTime()
const cervantes2025Duration = 18 * 3600000 // 18 hours

export const cervantes2025: HistoricalRace = {
  id: 'cervantes2025',
  name: 'Cervantes Race 2025',
  year: 2025,
  location: 'Perth to Cervantes, Western Australia',
  description: 'Annual offshore race from Fremantle to Cervantes, featuring challenging conditions along the Western Australian coast.',
  startTime: cervantes2025StartTime,
  endTime: cervantes2025StartTime + cervantes2025Duration,
  distance: 180, // nautical miles
  course: {
    start: { lat: -32.0569, lng: 115.7439 }, // Fremantle
    marks: [
      { id: 'rottnest', lat: -32.0059, lng: 115.5186, name: 'Rottnest Island' },
      { id: 'lancelin', lat: -31.0276, lng: 115.3276, name: 'Lancelin' }
    ],
    finish: { lat: -30.4503, lng: 115.0644 } // Cervantes
  },
  boats: [
    generateHistoricalBoatTrack('wild-rose', 'Wild Rose XI', 'AUS1001', 'IRC', '#e11d48', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('indian-pacific', 'Indian Pacific', 'AUS2002', 'IRC', '#2563eb', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('fremantle-flyer', 'Fremantle Flyer', 'AUS3003', 'ORCi', '#16a34a', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('ocean-spirit', 'Ocean Spirit', 'AUS4004', 'IRC', '#dc2626', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('southern-cross', 'Southern Cross', 'AUS5005', 'ORCi', '#7c3aed', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('westerly-wind', 'Westerly Wind', 'AUS6006', 'IRC', '#ea580c', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('pinnacles-pride', 'Pinnacles Pride', 'AUS7007', 'ORCi', '#0891b2', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration),
    generateHistoricalBoatTrack('coral-coast', 'Coral Coast', 'AUS8008', 'IRC', '#be185d', -32.0569, 115.7439, cervantes2025StartTime, cervantes2025Duration)
  ],
  weather: generateWeatherData(cervantes2025StartTime, cervantes2025Duration),
  results: {
    overall: [
      { boatId: 'wild-rose', position: 1, totalTime: 16.5 * 3600000 },
      { boatId: 'indian-pacific', position: 2, totalTime: 16.8 * 3600000 },
      { boatId: 'fremantle-flyer', position: 3, totalTime: 17.2 * 3600000 },
      { boatId: 'ocean-spirit', position: 4, totalTime: 17.5 * 3600000 },
      { boatId: 'southern-cross', position: 5, totalTime: 17.8 * 3600000 },
      { boatId: 'westerly-wind', position: 6, totalTime: 18.1 * 3600000 },
      { boatId: 'pinnacles-pride', position: 7, totalTime: 18.4 * 3600000 },
      { boatId: 'coral-coast', position: 8, totalTime: 18.7 * 3600000 }
    ],
    byClass: {
      'IRC': [
        { boatId: 'wild-rose', position: 1, correctedTime: 16.2 * 3600000 },
        { boatId: 'indian-pacific', position: 2, correctedTime: 16.6 * 3600000 },
        { boatId: 'ocean-spirit', position: 3, correctedTime: 17.1 * 3600000 },
        { boatId: 'westerly-wind', position: 4, correctedTime: 17.8 * 3600000 },
        { boatId: 'coral-coast', position: 5, correctedTime: 18.3 * 3600000 }
      ],
      'ORCi': [
        { boatId: 'fremantle-flyer', position: 1, correctedTime: 16.9 * 3600000 },
        { boatId: 'southern-cross', position: 2, correctedTime: 17.4 * 3600000 },
        { boatId: 'pinnacles-pride', position: 3, correctedTime: 18.0 * 3600000 }
      ]
    }
  }
}

// DGBR2025 - Derwent Gloucester Bluewater Race
const dgbr2025StartTime = new Date('2025-02-20T10:00:00Z').getTime()
const dgbr2025Duration = 24 * 3600000 // 24 hours

export const dgbr2025: HistoricalRace = {
  id: 'dgbr2025',
  name: 'Derwent Gloucester Bluewater Race 2025',
  year: 2025,
  location: 'Hobart to Gloucester, Tasmania',
  description: 'Challenging Tasmanian offshore race from the Derwent River to Gloucester, known for its demanding conditions and scenic coastline.',
  startTime: dgbr2025StartTime,
  endTime: dgbr2025StartTime + dgbr2025Duration,
  distance: 220, // nautical miles
  course: {
    start: { lat: -42.8826, lng: 147.3257 }, // Hobart
    marks: [
      { id: 'tasman-island', lat: -43.2333, lng: 147.9500, name: 'Tasman Island' },
      { id: 'maria-island', lat: -42.6000, lng: 148.1000, name: 'Maria Island' },
      { id: 'st-helens', lat: -41.3167, lng: 148.2167, name: 'St Helens' }
    ],
    finish: { lat: -41.0500, lng: 146.8000 } // Gloucester
  },
  boats: [
    generateHistoricalBoatTrack('tasmanian-devil', 'Tasmanian Devil', 'TAS1001', 'IRC', '#e11d48', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('derwent-storm', 'Derwent Storm', 'TAS2002', 'IRC', '#2563eb', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('apple-isle', 'Apple Isle Racer', 'TAS3003', 'ORCi', '#16a34a', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('southern-ocean', 'Southern Ocean', 'TAS4004', 'IRC', '#dc2626', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('bass-strait', 'Bass Strait Runner', 'TAS5005', 'ORCi', '#7c3aed', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('cradle-mountain', 'Cradle Mountain', 'TAS6006', 'IRC', '#ea580c', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('wilderness-wind', 'Wilderness Wind', 'TAS7007', 'ORCi', '#0891b2', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration),
    generateHistoricalBoatTrack('tassie-tiger', 'Tassie Tiger', 'TAS8008', 'IRC', '#be185d', -42.8826, 147.3257, dgbr2025StartTime, dgbr2025Duration)
  ],
  weather: generateWeatherData(dgbr2025StartTime, dgbr2025Duration),
  results: {
    overall: [
      { boatId: 'tasmanian-devil', position: 1, totalTime: 22.3 * 3600000 },
      { boatId: 'derwent-storm', position: 2, totalTime: 22.8 * 3600000 },
      { boatId: 'apple-isle', position: 3, totalTime: 23.2 * 3600000 },
      { boatId: 'southern-ocean', position: 4, totalTime: 23.6 * 3600000 },
      { boatId: 'bass-strait', position: 5, totalTime: 24.1 * 3600000 },
      { boatId: 'cradle-mountain', position: 6, totalTime: 24.5 * 3600000 },
      { boatId: 'wilderness-wind', position: 7, totalTime: 24.9 * 3600000 },
      { boatId: 'tassie-tiger', position: 8, totalTime: 25.2 * 3600000 }
    ],
    byClass: {
      'IRC': [
        { boatId: 'tasmanian-devil', position: 1, correctedTime: 21.8 * 3600000 },
        { boatId: 'derwent-storm', position: 2, correctedTime: 22.4 * 3600000 },
        { boatId: 'southern-ocean', position: 3, correctedTime: 23.1 * 3600000 },
        { boatId: 'cradle-mountain', position: 4, correctedTime: 24.0 * 3600000 },
        { boatId: 'tassie-tiger', position: 5, correctedTime: 24.7 * 3600000 }
      ],
      'ORCi': [
        { boatId: 'apple-isle', position: 1, correctedTime: 22.7 * 3600000 },
        { boatId: 'bass-strait', position: 2, correctedTime: 23.5 * 3600000 },
        { boatId: 'wilderness-wind', position: 3, correctedTime: 24.3 * 3600000 }
      ]
    }
  }
}

export const historicalRaces: HistoricalRace[] = [cervantes2025, dgbr2025]

export const getHistoricalRace = (raceId: string): HistoricalRace | undefined => {
  return historicalRaces.find(race => race.id === raceId)
}

export const getAvailableRaces = (): Array<{ id: string; name: string; year: number; location: string }> => {
  return historicalRaces.map(race => ({
    id: race.id,
    name: race.name,
    year: race.year,
    location: race.location
  }))
}