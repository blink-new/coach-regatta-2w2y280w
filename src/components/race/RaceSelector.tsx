import { useState } from 'react'
import { Calendar, MapPin, Trophy, Users, Clock, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { HistoricalRace } from '../../types/race'
import { historicalRaces } from '../../data/historicalRaces'

interface RaceSelectorProps {
  onRaceSelect: (race: HistoricalRace) => void
  selectedRaceId?: string
}

export function RaceSelector({ onRaceSelect, selectedRaceId }: RaceSelectorProps) {
  const [hoveredRace, setHoveredRace] = useState<string | null>(null)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (startTime: number, endTime: number) => {
    const hours = Math.round((endTime - startTime) / (1000 * 60 * 60))
    return `${hours} hours`
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Regatta</h1>
        <p className="text-lg text-gray-600 mb-6">
          Professional post-race analysis platform for yacht racing
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Historical Race Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Boat Performance Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Waves className="h-4 w-4" />
            <span>Weather Integration</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Race to Analyze</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {historicalRaces.map((race) => (
            <Card
              key={race.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedRaceId === race.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : hoveredRace === race.id
                  ? 'shadow-md'
                  : ''
              }`}
              onMouseEnter={() => setHoveredRace(race.id)}
              onMouseLeave={() => setHoveredRace(null)}
              onClick={() => onRaceSelect(race)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {race.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {race.year}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {race.distance} NM
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {race.boats.length}
                    </div>
                    <div className="text-xs text-gray-500">boats</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{race.location}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDate(race.startTime)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDuration(race.startTime, race.endTime)}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {race.description}
                </p>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">CLASSES</span>
                    <span className="text-xs text-gray-500">
                      {race.results?.overall.length || 0} finishers
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(race.boats.map(boat => boat.class))).map(className => (
                      <Badge key={className} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedRaceId === race.id && (
                  <div className="pt-2 border-t">
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation()
                        onRaceSelect(race)
                      }}
                    >
                      Analyze This Race
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            More historical races will be added regularly. 
            <br />
            Contact us to request specific race data analysis.
          </p>
        </div>
      </div>
    </div>
  )
}