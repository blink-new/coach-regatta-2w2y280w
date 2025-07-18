import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { MapPin, Play, Pause, RotateCcw, Zap, Navigation } from 'lucide-react';
import type { RaceData, BoatPosition, PositionMoment } from '../../types/race';

interface RaceMapProps {
  raceData: RaceData;
  selectedBoat?: number;
  onBoatSelect?: (boatId: number) => void;
}

export function RaceMap({ raceData, selectedBoat, onBoatSelect }: RaceMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0]);
  const [showTracks, setShowTracks] = useState(true);
  const [showAllBoats, setShowAllBoats] = useState(true);

  // Calculate time range from all position data
  useEffect(() => {
    if (!raceData.positions.length) return;

    let minTime = Infinity;
    let maxTime = -Infinity;

    raceData.positions.forEach(boat => {
      boat.moments.forEach(moment => {
        minTime = Math.min(minTime, moment.at);
        maxTime = Math.max(maxTime, moment.at);
      });
    });

    setTimeRange([minTime, maxTime]);
    setCurrentTime(minTime);
  }, [raceData]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 300; // 5 minutes step
        if (next > timeRange[1]) {
          setIsPlaying(false);
          return timeRange[1];
        }
        return next;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [isPlaying, timeRange]);

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !raceData.positions.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate bounds
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    raceData.positions.forEach(boat => {
      boat.moments.forEach(moment => {
        minLat = Math.min(minLat, moment.lat);
        maxLat = Math.max(maxLat, moment.lat);
        minLon = Math.min(minLon, moment.lon);
        maxLon = Math.max(maxLon, moment.lon);
      });
    });

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lonPadding = (maxLon - minLon) * 0.1;
    minLat -= latPadding;
    maxLat += latPadding;
    minLon -= lonPadding;
    maxLon += lonPadding;

    // Coordinate conversion
    const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * rect.height;
    const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * rect.width;

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let gridIndex = 0; gridIndex <= 10; gridIndex++) {
      const x = (rect.width / 10) * gridIndex;
      const y = (rect.height / 10) * gridIndex;
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw boat tracks and current positions
    raceData.positions.forEach((boat, index) => {
      const teamInfo = raceData.setup.teams.find(t => t.id === boat.id);
      const isSelected = selectedBoat === boat.id;
      const shouldShow = showAllBoats || isSelected;
      
      if (!shouldShow) return;

      // Get color for boat
      const colors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
        '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
      ];
      const color = teamInfo?.color || colors[index % colors.length];

      // Draw track if enabled
      if (showTracks) {
        ctx.strokeStyle = isSelected ? color : `${color}80`;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.beginPath();

        let firstPoint = true;
        boat.moments
          .filter(moment => moment.at <= currentTime)
          .forEach(moment => {
            const x = lonToX(moment.lon);
            const y = latToY(moment.lat);
            
            if (firstPoint) {
              ctx.moveTo(x, y);
              firstPoint = false;
            } else {
              ctx.lineTo(x, y);
            }
          });
        
        ctx.stroke();
      }

      // Find current position
      const currentMoment = boat.moments
        .filter(moment => moment.at <= currentTime)
        .pop();

      if (currentMoment) {
        const x = lonToX(currentMoment.lon);
        const y = latToY(currentMoment.lat);

        // Draw boat marker
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 5, 0, 2 * Math.PI);
        ctx.fill();

        // Draw boat outline
        ctx.strokeStyle = isSelected ? '#ffffff' : color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Draw heading indicator if available
        if (currentMoment.heading !== undefined) {
          const headingRad = (currentMoment.heading * Math.PI) / 180;
          const length = isSelected ? 15 : 10;
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + Math.sin(headingRad) * length,
            y - Math.cos(headingRad) * length
          );
          ctx.stroke();
        }

        // Draw boat label for selected boat
        if (isSelected && teamInfo) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 10, y - 15, 120, 20);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 10, y - 15, 120, 20);
          
          ctx.fillStyle = '#000000';
          ctx.font = '12px Inter';
          ctx.fillText(teamInfo.name || `Boat ${boat.id}`, x + 15, y - 2);
        }
      }
    });

    // Draw course marks if available
    if (raceData.setup.course?.marks) {
      raceData.setup.course.marks.forEach(mark => {
        const x = lonToX(mark.lon);
        const y = latToY(mark.lat);
        
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(mark.name, x, y + 3);
        ctx.textAlign = 'left';
      });
    }

  }, [raceData, currentTime, selectedBoat, showTracks, showAllBoats, timeRange]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onBoatSelect) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find closest boat to click position
    let closestBoat: number | null = null;
    let closestDistance = Infinity;

    // Calculate bounds for coordinate conversion
    let minLat = Infinity, maxLat = -Infinity;
    let minLon = Infinity, maxLon = -Infinity;

    raceData.positions.forEach(boat => {
      boat.moments.forEach(moment => {
        minLat = Math.min(minLat, moment.lat);
        maxLat = Math.max(maxLat, moment.lat);
        minLon = Math.min(minLon, moment.lon);
        maxLon = Math.max(maxLon, moment.lon);
      });
    });

    const latPadding = (maxLat - minLat) * 0.1;
    const lonPadding = (maxLon - minLon) * 0.1;
    minLat -= latPadding;
    maxLat += latPadding;
    minLon -= lonPadding;
    maxLon += lonPadding;

    const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * rect.height;
    const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * rect.width;

    raceData.positions.forEach(boat => {
      const currentMoment = boat.moments
        .filter(moment => moment.at <= currentTime)
        .pop();

      if (currentMoment) {
        const boatX = lonToX(currentMoment.lon);
        const boatY = latToY(currentMoment.lat);
        const distance = Math.sqrt((x - boatX) ** 2 + (y - boatY) ** 2);

        if (distance < 20 && distance < closestDistance) {
          closestDistance = distance;
          closestBoat = boat.id;
        }
      }
    });

    if (closestBoat) {
      onBoatSelect(closestBoat);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Race Track
        </CardTitle>
        <CardDescription>
          Interactive map showing boat positions and tracks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentTime(timeRange[0]);
                setIsPlaying(false);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showTracks ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTracks(!showTracks)}
            >
              <Navigation className="h-4 w-4" />
              Tracks
            </Button>
            
            <Button
              variant={showAllBoats ? "default" : "outline"}
              size="sm"
              onClick={() => setShowAllBoats(!showAllBoats)}
            >
              <Zap className="h-4 w-4" />
              All Boats
            </Button>
          </div>

          <Badge variant="secondary">
            {formatTimestamp(currentTime)}
          </Badge>
        </div>

        {/* Time slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Race Timeline</span>
            <span>{Math.round(((currentTime - timeRange[0]) / (timeRange[1] - timeRange[0])) * 100)}%</span>
          </div>
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => setCurrentTime(value)}
            min={timeRange[0]}
            max={timeRange[1]}
            step={300}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTimestamp(timeRange[0])}</span>
            <span>{formatTimestamp(timeRange[1])}</span>
          </div>
        </div>

        {/* Map canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-slate-50">
          <canvas
            ref={canvasRef}
            className="w-full h-96 cursor-crosshair"
            onClick={handleCanvasClick}
          />
          
          {selectedBoat && (
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
              <div className="text-sm font-medium">
                Selected: {raceData.setup.teams.find(t => t.id === selectedBoat)?.name || `Boat ${selectedBoat}`}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Click on a boat marker to select it. Use the timeline controls to replay the race.
        </div>
      </CardContent>
    </Card>
  );
}