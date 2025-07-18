import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Clock, Users, Zap, MapPin, Wind, Thermometer } from 'lucide-react'
import { Race } from '../../types/race'
import { formatDistanceToNow, format } from 'date-fns'

interface RaceStatsProps {
  race: Race
}

export function RaceStats({ race }: RaceStatsProps) {
  const activeBoats = race.boats.filter(boat => boat.currentPosition)
  const averageSpeed = activeBoats.reduce((sum, boat) => 
    sum + (boat.currentPosition?.speed || 0), 0
  ) / activeBoats.length

  const fastestBoat = activeBoats.reduce((fastest, boat) => 
    (boat.currentPosition?.speed || 0) > (fastest.currentPosition?.speed || 0) ? boat : fastest
  , activeBoats[0])

  const raceDistance = 628 // Sydney to Hobart distance in nautical miles
  const elapsedTime = Date.now() - race.startTime
  const elapsedHours = elapsedTime / (1000 * 60 * 60)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Race Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge 
                variant={race.status === 'active' ? 'default' : 'secondary'}
                className={race.status === 'active' ? 'bg-green-500' : ''}
              >
                {race.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDistanceToNow(race.startTime)}</p>
              <p className="text-sm text-gray-600">elapsed</p>
            </div>
            <div className="text-xs text-gray-500">
              Started: {format(new Date(race.startTime), 'MMM dd, HH:mm')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-500" />
            <span>Fleet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{race.boats.length}</p>
              <p className="text-sm text-gray-600">boats racing</p>
            </div>
            <div className="flex space-x-4 text-xs">
              <div>
                <p className="font-semibold">{race.boats.filter(b => b.class === 'IRC').length}</p>
                <p className="text-gray-600">IRC</p>
              </div>
              <div>
                <p className="font-semibold">{race.boats.filter(b => b.class === 'ORCi').length}</p>
                <p className="text-gray-600">ORCi</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Speed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{averageSpeed.toFixed(1)}</p>
              <p className="text-sm text-gray-600">avg knots</p>
            </div>
            {fastestBoat && (
              <div className="text-xs">
                <p className="font-semibold">Fastest: {fastestBoat.name}</p>
                <p className="text-gray-600">{fastestBoat.currentPosition?.speed.toFixed(1)} kts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span>Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{raceDistance}</p>
              <p className="text-sm text-gray-600">nautical miles</p>
            </div>
            <div className="text-xs">
              <p className="text-gray-600">Sydney → Hobart</p>
              <p className="font-semibold">ETA: ~{Math.round(raceDistance / averageSpeed)}h remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather conditions card */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Wind className="h-4 w-4 text-blue-500" />
            <span>Weather Conditions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Wind className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-lg font-bold">15-20 kts</p>
                <p className="text-sm text-gray-600">SW Wind</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-lg font-bold">22°C</p>
                <p className="text-sm text-gray-600">Air Temp</p>
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
            <p className="text-blue-800">
              <strong>Forecast:</strong> Moderate southwesterly winds with occasional gusts to 25 knots. 
              Sea state 2-3m. Partly cloudy conditions expected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Race information card */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Race Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Race:</span>
              <span className="font-semibold">{race.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-semibold">{raceDistance} nm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold">Sydney Harbour → Hobart</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Record:</span>
              <span className="font-semibold">1d 2h 8m 58s (2017)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}