import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trophy, Clock, Flag, MapPin, Anchor } from 'lucide-react';
import type { RaceData, LeaderboardTeam, Team } from '../../types/race';

interface LeaderboardProps {
  raceData: RaceData;
  onBoatSelect?: (boatId: number) => void;
  selectedBoat?: number;
}

export function Leaderboard({ raceData, onBoatSelect, selectedBoat }: LeaderboardProps) {
  const [selectedClass, setSelectedClass] = useState<number>(0);

  const getTeamInfo = (teamId: number): Team | undefined => {
    return raceData.setup.teams.find(team => team.id === teamId);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusBadge = (team: LeaderboardTeam) => {
    if (team.finished) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Finished</Badge>;
    }
    if (team.started) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Racing</Badge>;
    }
    return <Badge variant="outline">Not Started</Badge>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    }
    if (rank === 2) {
      return <Trophy className="h-4 w-4 text-gray-400" />;
    }
    if (rank === 3) {
      return <Trophy className="h-4 w-4 text-amber-600" />;
    }
    return <span className="text-sm font-medium text-gray-600">#{rank}</span>;
  };

  const currentTag = raceData.leaderboard.tags[selectedClass];
  if (!currentTag) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          Race Leaderboard
        </CardTitle>
        <CardDescription>
          Current standings for {raceData.info.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedClass.toString()} onValueChange={(value) => setSelectedClass(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            {raceData.leaderboard.tags.map((tag, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                {tag.name || `Class ${index + 1}`}
                <Badge variant="secondary" className="ml-2">
                  {tag.teams.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {raceData.leaderboard.tags.map((tag, tagIndex) => (
            <TabsContent key={tagIndex} value={tagIndex.toString()}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {tag.name || `Class ${tagIndex + 1}`}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {tag.teams.filter(t => t.finished).length} of {tag.teams.length} finished
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Boat</TableHead>
                        <TableHead>Skipper</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Elapsed Time</TableHead>
                        <TableHead>DTF</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tag.teams
                        .sort((a, b) => a.rankR - b.rankR)
                        .map((team) => {
                          const teamInfo = getTeamInfo(team.id);
                          const isSelected = selectedBoat === team.id;
                          
                          return (
                            <TableRow 
                              key={team.id}
                              className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
                              onClick={() => onBoatSelect?.(team.id)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {getRankBadge(team.rankR)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {teamInfo?.name || `Boat ${team.id}`}
                                  </div>
                                  {teamInfo?.sail && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                      <Anchor className="h-3 w-3" />
                                      {teamInfo.sail}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div>{teamInfo?.owner || 'Unknown'}</div>
                                  {teamInfo?.boat && (
                                    <div className="text-xs text-gray-500">{teamInfo.boat}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {teamInfo?.flag && (
                                    <Flag className="h-4 w-4" />
                                  )}
                                  <span>{teamInfo?.country || 'Unknown'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(team)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span className="font-mono text-sm">
                                    {team.elapsedFormatted}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span className="font-mono text-sm">
                                    {team.dtf > 0 ? `+${team.dtf}` : team.dtf}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onBoatSelect?.(team.id);
                                  }}
                                >
                                  {isSelected ? 'Selected' : 'Select'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}