import { useState } from 'react';
import { SimpleHeader } from './components/layout/SimpleHeader';
import { RaceSelector } from './components/race/RaceSelector';
import { Leaderboard } from './components/race/Leaderboard';
import { RaceMap } from './components/race/RaceMap';
import { SpeedChart } from './components/race/SpeedChart';
import { RaceStats } from './components/race/RaceStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { Trophy, Map, TrendingUp, BarChart3 } from 'lucide-react';
import type { RaceData } from './types/race';

function App() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<number | undefined>();
  const [compareBoats, setCompareBoats] = useState<number[]>([]);

  const handleRaceSelect = (raceId: string, data: RaceData) => {
    setSelectedRace(raceId);
    setRaceData(data);
    setSelectedBoat(undefined);
    setCompareBoats([]);
  };

  const handleBoatSelect = (boatId: number) => {
    if (selectedBoat === boatId) {
      setSelectedBoat(undefined);
    } else {
      setSelectedBoat(boatId);
    }
  };

  const handleCompareBoat = (boatId: number) => {
    setCompareBoats(prev => {
      if (prev.includes(boatId)) {
        return prev.filter(id => id !== boatId);
      } else {
        return [...prev, boatId];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Race Selection */}
        <RaceSelector 
          selectedRace={selectedRace}
          onRaceSelect={handleRaceSelect}
        />

        {/* Race Analysis */}
        {raceData ? (
          <div className="space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Track Map
                </TabsTrigger>
                <TabsTrigger value="speed" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Speed Analysis
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Leaderboard 
                    raceData={raceData}
                    selectedBoat={selectedBoat}
                    onBoatSelect={handleBoatSelect}
                  />
                  <RaceMap 
                    raceData={raceData}
                    selectedBoat={selectedBoat}
                    onBoatSelect={handleBoatSelect}
                  />
                </div>
              </TabsContent>

              <TabsContent value="map" className="space-y-6">
                <RaceMap 
                  raceData={raceData}
                  selectedBoat={selectedBoat}
                  onBoatSelect={handleBoatSelect}
                />
                {selectedBoat && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">
                          Selected Boat: {raceData.setup.teams.find(t => t.id === selectedBoat)?.name || `Boat ${selectedBoat}`}
                        </h3>
                        <p className="text-gray-600">
                          Use the map controls to replay the race and analyze boat movements
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="speed" className="space-y-6">
                <SpeedChart 
                  raceData={raceData}
                  selectedBoat={selectedBoat}
                  compareBoats={compareBoats}
                />
                {!selectedBoat && compareBoats.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Speed Analysis</h3>
                        <p className="text-gray-600">
                          Select boats from the leaderboard to compare their speed profiles throughout the race
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <RaceStats 
                  raceData={raceData}
                  selectedBoat={selectedBoat}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                  Welcome to Coach Regatta
                </h2>
                <p className="text-gray-500 max-w-md">
                  Select a race from the dropdown above to start analyzing yacht race data, 
                  boat performance, and track visualization.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default App;