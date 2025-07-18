import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Clock, Zap, MapPin, Flag, Users, Target } from 'lucide-react';
import type { RaceData } from '../../types/race';

interface RaceStatsProps {
  raceData: RaceData;
  selectedBoat?: number;
}

export function RaceStats({ raceData, selectedBoat }: RaceStatsProps) {
  const raceStatistics = useMemo(() => {
    const totalBoats = raceData.setup.teams?.length || 0;
    const allTeams = raceData.leaderboard.tags?.flatMap(tag => tag.teams) || [];
    
    const finishedBoats = allTeams.filter(team => team.finished).length;
    const racingBoats = allTeams.filter(team => team.started && !team.finished).length;
    const notStartedBoats = totalBoats - finishedBoats - racingBoats;

    // Calculate race duration
    let minStartTime = Infinity;
    let maxFinishTime = -Infinity;
    
    (raceData.positions || []).forEach(boat => {
      if (boat.moments?.length > 0) {
        minStartTime = Math.min(minStartTime, boat.moments[0].at);
        maxFinishTime = Math.max(maxFinishTime, boat.moments[boat.moments.length - 1].at);
      }
    });

    const raceDuration = maxFinishTime - minStartTime;

    // Calculate average speeds
    const speedStats = (raceData.positions || []).map(boat => {
      const teamInfo = raceData.setup.teams.find(t => t.id === boat.id);
      const leaderboardData = allTeams.find(t => t.id === boat.id);
      
      if (!boat.moments || boat.moments.length < 2) return null;

      // Calculate total distance and time
      let totalDistance = 0;
      let totalTime = 0;
      
      for (let index = 1; index < boat.moments.length; index++) {
        const prev = boat.moments[index - 1];
        const curr = boat.moments[index];
        
        const distance = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
        const time = (curr.at - prev.at) / 3600; // hours
        
        totalDistance += distance;
        totalTime += time;
      }

      const avgSpeed = totalTime > 0 ? totalDistance / totalTime : 0;

      return {
        id: boat.id,
        name: teamInfo?.name || `Boat ${boat.id}`,
        country: teamInfo?.country || 'Unknown',
        avgSpeed: Math.round(avgSpeed * 10) / 10,
        totalDistance: Math.round(totalDistance * 10) / 10,
        finished: leaderboardData?.finished || false,
        elapsedTime: leaderboardData?.elapsed || 0,
        rank: leaderboardData?.rankR || 0
      };
    }).filter(Boolean);

    return {
      totalBoats,
      finishedBoats,
      racingBoats,
      notStartedBoats,
      raceDuration,
      speedStats,
      completionRate: (finishedBoats / totalBoats) * 100
    };
  }, [raceData]);

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

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const pieData = [
    { name: 'Finished', value: raceStatistics.finishedBoats, color: '#22c55e' },
    { name: 'Racing', value: raceStatistics.racingBoats, color: '#3b82f6' },
    { name: 'Not Started', value: raceStatistics.notStartedBoats, color: '#6b7280' }
  ];

  const topSpeedData = raceStatistics.speedStats
    .sort((a, b) => b.avgSpeed - a.avgSpeed)
    .slice(0, 10)
    .map(boat => ({
      name: boat.name.length > 15 ? boat.name.substring(0, 15) + '...' : boat.name,
      speed: boat.avgSpeed,
      fullName: boat.name
    }));

  const selectedBoatStats = selectedBoat 
    ? raceStatistics.speedStats.find(boat => boat.id === selectedBoat)
    : null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{raceStatistics.totalBoats}</p>
                <p className="text-sm text-gray-600">Total Boats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{raceStatistics.finishedBoats}</p>
                <p className="text-sm text-gray-600">Finished</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{raceStatistics.racingBoats}</p>
                <p className="text-sm text-gray-600">Still Racing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{raceStatistics.completionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Boat Stats */}
      {selectedBoatStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Selected Boat Performance
            </CardTitle>
            <CardDescription>
              Detailed statistics for {selectedBoatStats.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Average Speed</p>
                <p className="text-2xl font-bold text-blue-600">{selectedBoatStats.avgSpeed} kts</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-green-600">{selectedBoatStats.totalDistance} nm</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Current Rank</p>
                <p className="text-2xl font-bold text-purple-600">#{selectedBoatStats.rank}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <Badge variant={selectedBoatStats.finished ? "default" : "secondary"}>
                  {selectedBoatStats.finished ? 'Finished' : 'Racing'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Statistics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="progress">Race Progress</TabsTrigger>
          <TabsTrigger value="classes">Class Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Speeds Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Top Average Speeds
                </CardTitle>
                <CardDescription>
                  Fastest boats by average speed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSpeedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={80}
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
                        formatter={(value: number, name: string, props: any) => [
                          `${value.toFixed(1)} kts`, 
                          props.payload.fullName
                        ]}
                      />
                      <Bar dataKey="speed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Race Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Race Status Distribution
                </CardTitle>
                <CardDescription>
                  Current status of all boats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Race Progress Overview
              </CardTitle>
              <CardDescription>
                Overall race completion and timing statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Race Completion</span>
                  <span className="text-sm text-gray-600">{raceStatistics.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={raceStatistics.completionRate} className="w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{raceStatistics.finishedBoats}</p>
                  <p className="text-sm text-gray-600">Boats Finished</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Flag className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{raceStatistics.racingBoats}</p>
                  <p className="text-sm text-gray-600">Still Racing</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-600">{raceStatistics.notStartedBoats}</p>
                  <p className="text-sm text-gray-600">Not Started</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Race Duration</p>
                <p className="text-lg font-mono">{formatDuration(raceStatistics.raceDuration)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {raceData.leaderboard.tags.map((tag, tagIndex) => (
              <Card key={tagIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    {tag.name || `Class ${tagIndex + 1}`}
                  </CardTitle>
                  <CardDescription>
                    Class statistics and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{tag.teams.length}</p>
                      <p className="text-xs text-gray-600">Total Boats</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {tag.teams.filter(t => t.finished).length}
                      </p>
                      <p className="text-xs text-gray-600">Finished</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {((tag.teams.filter(t => t.finished).length / tag.teams.length) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-600">Completion</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Class Progress</span>
                      <span className="text-sm text-gray-600">
                        {tag.teams.filter(t => t.finished).length} / {tag.teams.length}
                      </span>
                    </div>
                    <Progress 
                      value={(tag.teams.filter(t => t.finished).length / tag.teams.length) * 100} 
                      className="w-full" 
                    />
                  </div>

                  {/* Top 3 in class */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Top 3 in Class</p>
                    {tag.teams
                      .sort((a, b) => a.rankR - b.rankR)
                      .slice(0, 3)
                      .map((team, rank) => {
                        const teamInfo = raceData.setup.teams.find(t => t.id === team.id);
                        return (
                          <div key={team.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                {rank + 1}
                              </Badge>
                              <span>{teamInfo?.name || `Boat ${team.id}`}</span>
                            </div>
                            <span className="font-mono text-xs">{team.elapsedFormatted}</span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}