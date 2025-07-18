import { Trophy, TrendingUp, Clock, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Race, PerformanceMetrics } from '../../types/race'
import { formatDistanceToNow } from 'date-fns'

interface LeaderboardProps {
  race: Race
  onBoatSelect: (boatId: string) => void
  selectedBoats: string[]
}

export function Leaderboard({ race, onBoatSelect, selectedBoats }: LeaderboardProps) {
  // Calculate performance metrics for each boat
  const calculateMetrics = (boat: any): PerformanceMetrics => {
    const totalDistance = boat.positions.reduce((acc: number, pos: any, index: number) => {
      if (index === 0) return 0
      const prev = boat.positions[index - 1]
      const distance = Math.sqrt(
        Math.pow((pos.lat - prev.lat) * 111000, 2) + 
        Math.pow((pos.lng - prev.lng) * 111000 * Math.cos(pos.lat * Math.PI / 180), 2)
      )
      return acc + distance
    }, 0)

    const speeds = boat.positions.map((pos: any) => pos.speed)
    const averageSpeed = speeds.reduce((a: number, b: number) => a + b, 0) / speeds.length
    const maxSpeed = Math.max(...speeds)
    const timeElapsed = boat.currentPosition ? boat.currentPosition.timestamp - race.startTime : 0

    return {
      boatId: boat.id,
      totalDistance: totalDistance / 1000, // Convert to km
      averageSpeed,
      maxSpeed,
      currentPosition: 0, // Will be set based on sorting
      timeElapsed,
    }
  }

  const boatsWithMetrics = race.boats.map(boat => ({
    ...boat,
    metrics: calculateMetrics(boat)
  }))

  // Sort by total distance (leader has traveled furthest)
  const sortedBoats = boatsWithMetrics.sort((a, b) => b.metrics.totalDistance - a.metrics.totalDistance)
  
  // Update positions
  sortedBoats.forEach((boat, index) => {
    boat.metrics.currentPosition = index + 1
  })

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Trophy className="h-5 w-5 text-gray-400" />
      case 3: return <Trophy className="h-5 w-5 text-amber-600" />
      default: return <div className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">{position}</div>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Live Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedBoats.map((boat) => (
          <div
            key={boat.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedBoats.includes(boat.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onBoatSelect(boat.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getPositionIcon(boat.metrics.currentPosition)}
                <div>
                  <h3 className="font-semibold text-gray-900">{boat.name}</h3>
                  <p className="text-sm text-gray-600">{boat.sailNumber} • {boat.class}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: boat.color }}
                />
                {boat.metrics.currentPosition <= 3 && (
                  <Badge variant="secondary" className="text-xs">
                    {boat.metrics.currentPosition === 1 ? 'Leader' : `P${boat.metrics.currentPosition}`}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-semibold">{boat.metrics.totalDistance.toFixed(1)} km</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-gray-600">Avg Speed</p>
                  <p className="font-semibold">{boat.metrics.averageSpeed.toFixed(1)} kts</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-gray-600">Max Speed</p>
                  <p className="font-semibold">{boat.metrics.maxSpeed.toFixed(1)} kts</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-gray-600">Elapsed</p>
                  <p className="font-semibold">
                    {formatDistanceToNow(race.startTime, { addSuffix: false })}
                  </p>
                </div>
              </div>
            </div>

            {boat.currentPosition && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Current: {boat.currentPosition.speed.toFixed(1)} kts • 
                  Heading {boat.currentPosition.heading.toFixed(0)}° • 
                  {formatDistanceToNow(boat.currentPosition.timestamp, { addSuffix: true })}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}