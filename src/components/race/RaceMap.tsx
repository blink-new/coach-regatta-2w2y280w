import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Race } from '../../types/race'

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface RaceMapProps {
  race: Race
  selectedBoats: string[]
  className?: string
}

export function RaceMap({ race, selectedBoats, className = '' }: RaceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const boatMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const trackLayersRef = useRef<Map<string, L.Polyline>>(new Map())

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([-33.8568, 151.2153], 10)
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add course markers
    const startIcon = L.divIcon({
      className: 'bg-green-500 rounded-full border-2 border-white shadow-lg',
      html: '<div class="w-4 h-4 bg-green-500 rounded-full"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    const finishIcon = L.divIcon({
      className: 'bg-red-500 rounded-full border-2 border-white shadow-lg',
      html: '<div class="w-4 h-4 bg-red-500 rounded-full"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    // Add start line
    L.marker([race.course.start.lat, race.course.start.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup('Start Line')

    // Add finish line
    L.marker([race.course.finish.lat, race.course.finish.lng], { icon: finishIcon })
      .addTo(map)
      .bindPopup('Finish Line')

    // Add course marks
    race.course.marks.forEach(mark => {
      const markIcon = L.divIcon({
        className: 'bg-yellow-500 rounded-full border-2 border-white shadow-lg',
        html: '<div class="w-3 h-3 bg-yellow-500 rounded-full"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })
      
      L.marker([mark.lat, mark.lng], { icon: markIcon })
        .addTo(map)
        .bindPopup(mark.name)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [race])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Clear existing boat markers and tracks
    boatMarkersRef.current.forEach(marker => map.removeLayer(marker))
    trackLayersRef.current.forEach(track => map.removeLayer(track))
    boatMarkersRef.current.clear()
    trackLayersRef.current.clear()

    // Add boat tracks and current positions
    race.boats.forEach(boat => {
      const isSelected = selectedBoats.length === 0 || selectedBoats.includes(boat.id)
      if (!isSelected) return

      // Create boat track
      const trackPoints: [number, number][] = boat.positions.map(pos => [pos.lat, pos.lng])
      const track = L.polyline(trackPoints, {
        color: boat.color,
        weight: 3,
        opacity: 0.8
      }).addTo(map)

      trackLayersRef.current.set(boat.id, track)

      // Add current position marker
      if (boat.currentPosition) {
        const boatIcon = L.divIcon({
          className: 'boat-marker',
          html: `
            <div class="relative">
              <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg" style="background-color: ${boat.color}"></div>
              <div class="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const marker = L.marker([boat.currentPosition.lat, boat.currentPosition.lng], { icon: boatIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${boat.name}</h3>
              <p class="text-sm text-gray-600">${boat.sailNumber} • ${boat.class}</p>
              <p class="text-sm">Speed: ${boat.currentPosition.speed.toFixed(1)} kts</p>
              <p class="text-sm">Heading: ${boat.currentPosition.heading.toFixed(0)}°</p>
            </div>
          `)

        boatMarkersRef.current.set(boat.id, marker)
      }
    })

    // Fit map to show all boats
    if (race.boats.length > 0) {
      const group = new L.FeatureGroup([...boatMarkersRef.current.values(), ...trackLayersRef.current.values()])
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [race, selectedBoats])

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h3 className="font-semibold text-sm mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Finish</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Mark</span>
          </div>
        </div>
      </div>
    </div>
  )
}