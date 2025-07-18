import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TrendingUp } from 'lucide-react'
import { Race } from '../../types/race'
import { format } from 'date-fns'

interface SpeedChartProps {
  race: Race
  selectedBoats: string[]
}

export function SpeedChart({ race, selectedBoats }: SpeedChartProps) {
  // Prepare data for the chart
  const chartData = React.useMemo(() => {
    if (selectedBoats.length === 0) return []

    const selectedBoatData = race.boats.filter(boat => selectedBoats.includes(boat.id))
    if (selectedBoatData.length === 0) return []

    // Get all unique timestamps
    const allTimestamps = new Set<number>()
    selectedBoatData.forEach(boat => {
      boat.positions.forEach(pos => allTimestamps.add(pos.timestamp))
    })

    const sortedTimestamps = Array.from(allTimestamps).sort()

    return sortedTimestamps.map(timestamp => {
      const dataPoint: any = {
        timestamp,
        time: format(new Date(timestamp), 'HH:mm')
      }

      selectedBoatData.forEach(boat => {
        const position = boat.positions.find(pos => pos.timestamp === timestamp)
        if (position) {
          dataPoint[boat.id] = position.speed
        }
      })

      return dataPoint
    })
  }, [race, selectedBoats])

  const selectedBoatData = race.boats.filter(boat => selectedBoats.includes(boat.id))

  if (selectedBoats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Speed Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Select boats from the leaderboard to view speed analysis</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Speed Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                label={{ value: 'Speed (knots)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value: number, name: string) => {
                  const boat = race.boats.find(b => b.id === name)
                  return [`${value.toFixed(1)} kts`, boat?.name || name]
                }}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                formatter={(value) => {
                  const boat = race.boats.find(b => b.id === value)
                  return boat?.name || value
                }}
              />
              {selectedBoatData.map(boat => (
                <Line
                  key={boat.id}
                  type="monotone"
                  dataKey={boat.id}
                  stroke={boat.color}
                  strokeWidth={2}
                  dot={{ fill: boat.color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: boat.color, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedBoatData.map(boat => {
            const speeds = boat.positions.map(pos => pos.speed)
            const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length
            const maxSpeed = Math.max(...speeds)
            const minSpeed = Math.min(...speeds)
            
            return (
              <div key={boat.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: boat.color }}
                  />
                  <h4 className="font-semibold text-sm">{boat.name}</h4>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-semibold">{avgSpeed.toFixed(1)} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum:</span>
                    <span className="font-semibold">{maxSpeed.toFixed(1)} kts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum:</span>
                    <span className="font-semibold">{minSpeed.toFixed(1)} kts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Add React import at the top
import React from 'react'