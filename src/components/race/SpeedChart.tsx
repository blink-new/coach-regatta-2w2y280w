import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import type { RaceData, PositionMoment } from '../../types/race';

interface SpeedChartProps {
  raceData: RaceData;
  selectedBoat?: number;
  compareBoats?: number[];
}

interface ChartDataPoint {
  timestamp: number;
  time: string;
  [key: string]: number | string; // Dynamic boat speed properties
}

export function SpeedChart({ raceData, selectedBoat, compareBoats = [] }: SpeedChartProps) {
  const chartData = useMemo(() => {
    if (!raceData.positions.length) return [];

    // Get all boats to display
    const boatsToShow = selectedBoat 
      ? [selectedBoat, ...compareBoats.filter(id => id !== selectedBoat)]
      : compareBoats.length > 0 
        ? compareBoats 
        : raceData.positions.slice(0, 5).map(boat => boat.id); // Show first 5 boats if none selected

    // Get all unique timestamps
    const allTimestamps = new Set<number>();
    raceData.positions.forEach(boat => {
      if (boatsToShow.includes(boat.id)) {
        boat.moments.forEach(moment => {
          allTimestamps.add(moment.at);
        });
      }
    });

    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Create chart data
    const data: ChartDataPoint[] = sortedTimestamps.map(timestamp => {
      const dataPoint: ChartDataPoint = {
        timestamp,
        time: new Date(timestamp * 1000).toLocaleTimeString()
      };

      boatsToShow.forEach(boatId => {
        const boat = raceData.positions.find(b => b.id === boatId);
        const teamInfo = raceData.setup.teams.find(t => t.id === boatId);
        const boatName = teamInfo?.name || `Boat ${boatId}`;

        if (boat) {
          // Find the closest moment to this timestamp
          const moment = boat.moments.find(m => m.at === timestamp);
          if (moment) {
            // Calculate speed if not provided
            let speed = moment.speed || 0;
            
            // If speed is not in the data, calculate it from position changes
            if (!moment.speed) {
              const prevMoment = boat.moments.find(m => m.at < timestamp);
              if (prevMoment) {
                const timeDiff = (timestamp - prevMoment.at) / 3600; // hours
                const distance = calculateDistance(
                  prevMoment.lat, prevMoment.lon,
                  moment.lat, moment.lon
                );
                speed = timeDiff > 0 ? distance / timeDiff : 0; // knots
              }
            }

            dataPoint[boatName] = Math.round(speed * 10) / 10; // Round to 1 decimal
          }
        }
      });

      return dataPoint;
    });

    // Filter out data points where all boats have 0 speed
    return data.filter(point => {
      return boatsToShow.some(boatId => {
        const teamInfo = raceData.setup.teams.find(t => t.id === boatId);
        const boatName = teamInfo?.name || `Boat ${boatId}`;
        return (point[boatName] as number) > 0;
      });
    });
  }, [raceData, selectedBoat, compareBoats]);

  // Calculate distance between two lat/lon points in nautical miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getBoatColors = () => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
      '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
    ];
    
    const boatsToShow = selectedBoat 
      ? [selectedBoat, ...compareBoats.filter(id => id !== selectedBoat)]
      : compareBoats.length > 0 
        ? compareBoats 
        : raceData.positions.slice(0, 5).map(boat => boat.id);

    return boatsToShow.reduce((acc, boatId, index) => {
      const teamInfo = raceData.setup.teams.find(t => t.id === boatId);
      const boatName = teamInfo?.name || `Boat ${boatId}`;
      acc[boatName] = teamInfo?.color || colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  };

  const boatColors = getBoatColors();
  const boatNames = Object.keys(boatColors);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData.length) return {};

    return boatNames.reduce((acc, boatName) => {
      const speeds = chartData
        .map(point => point[boatName] as number)
        .filter(speed => speed > 0);

      if (speeds.length > 0) {
        acc[boatName] = {
          max: Math.max(...speeds),
          avg: speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length,
          min: Math.min(...speeds)
        };
      }

      return acc;
    }, {} as Record<string, { max: number; avg: number; min: number }>);
  }, [chartData, boatNames]);

  if (!chartData.length) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No speed data available</p>
            <p className="text-sm">Select a boat to view speed analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Speed Analysis
        </CardTitle>
        <CardDescription>
          Boat speed over time during the race
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Speed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boatNames.slice(0, 3).map(boatName => {
            const stat = stats[boatName];
            if (!stat) return null;

            return (
              <div key={boatName} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: boatColors[boatName] }}
                  />
                  <h4 className="font-medium text-sm truncate">{boatName}</h4>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-mono font-medium">{stat.max.toFixed(1)} kts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg:</span>
                    <span className="font-mono font-medium">{stat.avg.toFixed(1)} kts</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-mono font-medium">{stat.min.toFixed(1)} kts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Speed Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                label={{ value: 'Speed (knots)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)} kts`, 
                  name
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              
              {boatNames.map(boatName => (
                <Line
                  key={boatName}
                  type="monotone"
                  dataKey={boatName}
                  stroke={boatColors[boatName]}
                  strokeWidth={selectedBoat && raceData.setup.teams.find(t => t.id === selectedBoat)?.name === boatName ? 3 : 2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Time axis shows race progression</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Speed calculated from GPS positions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}