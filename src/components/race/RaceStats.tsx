import { Trophy, Clock, MapPin, Users, Waves, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Race } from '../../types/race'

interface RaceStatsProps {
  race: Race
}

export function RaceStats({ race }: RaceStatsProps) {
  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return 'In Progress'
    const hours = Math.round((endTime - startTime) / (1000 * 60 * 60))
    return `${hours} hours`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getClassStats = () => {
    const classes = race.boats.reduce((acc, boat) => {
      acc[boat.class] = (acc[boat.class] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(classes).map(([className, count]) => ({
      name: className,
      count
    }))
  }

  const getFinishedBoats = () => {
    return race.boats.filter(boat => boat.finishTime && !boat.retired && !boat.dnf).length
  }

  const getRetiredBoats = () => {
    return race.boats.filter(boat => boat.retired || boat.dnf).length
  }

  const classStats = getClassStats()
  const finishedBoats = getFinishedBoats()
  const retiredBoats = getRetiredBoats()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Race Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Race Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <Badge variant={race.status === 'finished' ? 'default' : 'secondary'}>
              {race.status === 'finished' ? 'Completed' : race.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Boats</span>
            <span className="font-semibold">{race.boats.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Finished</span>
            <span className="font-semibold text-green-600">{finishedBoats}</span>
          </div>
          {retiredBoats > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Retired/DNF</span>
              <span className="font-semibold text-red-600">{retiredBoats}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timing Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Race Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Start Time</span>
            <p className="font-semibold text-sm">{formatDate(race.startTime)}</p>
          </div>
          {race.endTime && (
            <div>
              <span className="text-sm text-gray-600">Duration</span>
              <p className="font-semibold">{formatDuration(race.startTime, race.endTime)}</p>
            </div>
          )}
          {race.status === 'finished' && race.endTime && (
            <div>
              <span className="text-sm text-gray-600">Finished</span>
              <p className="font-semibold text-sm">{formatDate(race.endTime)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Course Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Marks</span>
            <span className="font-semibold">{race.course.marks.length}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Key Marks</span>
            <div className="mt-1 space-y-1">
              {race.course.marks.slice(0, 2).map((mark) => (
                <p key={mark.id} className="text-xs text-gray-700">{mark.name}</p>
              ))}
              {race.course.marks.length > 2 && (
                <p className="text-xs text-gray-500">+{race.course.marks.length - 2} more</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Class Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {classStats.map((classInfo) => (
            <div key={classInfo.name} className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {classInfo.name}
              </Badge>
              <span className="font-semibold">{classInfo.count}</span>
            </div>
          ))}
          {classStats.length === 0 && (
            <p className="text-sm text-gray-500">No class data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}