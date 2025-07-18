import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Loader2, Trophy, Calendar, MapPin } from 'lucide-react';
import { raceDataService } from '../../services/raceDataService';
import type { RaceInfo, RaceData } from '../../types/race';

interface RaceSelectorProps {
  selectedRace: string | null;
  onRaceSelect: (raceId: string, raceData: RaceData) => void;
}

export function RaceSelector({ selectedRace, onRaceSelect }: RaceSelectorProps) {
  const [availableRaces, setAvailableRaces] = useState<RaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRace, setLoadingRace] = useState(false);
  const [selectedRaceData, setSelectedRaceData] = useState<RaceData | null>(null);

  useEffect(() => {
    loadAvailableRaces();
  }, []);

  const loadAvailableRaces = async () => {
    try {
      const races = await raceDataService.getAvailableRaces();
      setAvailableRaces(races);
    } catch (error) {
      console.error('Failed to load available races:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceSelect = async (raceId: string) => {
    if (raceId === selectedRace) return;
    
    setLoadingRace(true);
    try {
      const raceData = await raceDataService.getRaceData(raceId);
      if (raceData) {
        setSelectedRaceData(raceData);
        onRaceSelect(raceId, raceData);
      }
    } catch (error) {
      console.error('Failed to load race data:', error);
    } finally {
      setLoadingRace(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading available races...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Select Race
          </CardTitle>
          <CardDescription>
            Choose a race to analyze boat performance and track data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRace || ''} onValueChange={handleRaceSelect} disabled={loadingRace}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a race to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {availableRaces.map((race) => (
                <SelectItem key={race.id} value={race.id}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    {race.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {loadingRace && (
            <div className="flex items-center justify-center mt-4 py-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading race data...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRaceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {selectedRaceData.info.name}
            </CardTitle>
            <CardDescription>
              Race Overview and Statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedRaceData.setup.teams.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Classes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedRaceData.leaderboard.tags.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Laps</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedRaceData.setup.laps}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Race Classes:</p>
              <div className="flex flex-wrap gap-2">
                {selectedRaceData.leaderboard.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary">
                    {tag.name || `Class ${tagIndex + 1}`} ({(tag.teams || []).length} boats)
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Finished Boats:</p>
              <div className="text-sm text-gray-600">
                {selectedRaceData.leaderboard.tags.reduce((total, tag) => 
                  total + (tag.teams || []).filter(team => team.finished).length, 0
                )} of {selectedRaceData.setup.teams.length} boats have finished
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}