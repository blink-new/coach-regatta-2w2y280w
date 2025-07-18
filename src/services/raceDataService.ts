import type { RaceInfo, RaceSetup, Leaderboard, AllPositions, RaceData } from '../types/race';

class RaceDataService {
  private cache = new Map<string, RaceData>();

  async getAvailableRaces(): Promise<RaceInfo[]> {
    try {
      const response = await fetch('/races.json');
      if (!response.ok) {
        throw new Error('Failed to fetch races list');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading races:', error);
      return [];
    }
  }

  async getRaceData(raceId: string): Promise<RaceData | null> {
    // Check cache first
    if (this.cache.has(raceId)) {
      return this.cache.get(raceId)!;
    }

    try {
      // Load all race files in parallel
      const [raceInfoResponse, setupResponse, leaderboardResponse, positionsResponse] = await Promise.all([
        fetch('/races.json'),
        fetch(`/${raceId}/RaceSetup.json`),
        fetch(`/${raceId}/leaderboard.json`),
        fetch(`/${raceId}/AllPositions3.json`)
      ]);

      if (!setupResponse.ok || !leaderboardResponse.ok || !positionsResponse.ok) {
        throw new Error(`Failed to fetch race data for ${raceId}`);
      }

      const [raceInfoList, setup, leaderboard, positions] = await Promise.all([
        raceInfoResponse.json(),
        setupResponse.json(),
        leaderboardResponse.json(),
        positionsResponse.json()
      ]);

      // Find the race info
      const raceInfo = raceInfoList.find((race: RaceInfo) => race.id === raceId);
      if (!raceInfo) {
        throw new Error(`Race info not found for ${raceId}`);
      }

      const raceData: RaceData = {
        info: raceInfo,
        setup,
        leaderboard,
        positions
      };

      // Cache the result
      this.cache.set(raceId, raceData);
      
      return raceData;
    } catch (error) {
      console.error(`Error loading race data for ${raceId}:`, error);
      return null;
    }
  }

  async getRaceSetup(raceId: string): Promise<RaceSetup | null> {
    const raceData = await this.getRaceData(raceId);
    return raceData?.setup || null;
  }

  async getLeaderboard(raceId: string): Promise<Leaderboard | null> {
    const raceData = await this.getRaceData(raceId);
    return raceData?.leaderboard || null;
  }

  async getPositions(raceId: string): Promise<AllPositions | null> {
    const raceData = await this.getRaceData(raceId);
    return raceData?.positions || null;
  }

  // Helper method to get team info by ID
  getTeamById(raceData: RaceData, teamId: number) {
    return raceData.setup.teams.find(team => team.id === teamId);
  }

  // Helper method to get team positions
  getTeamPositions(raceData: RaceData, teamId: number) {
    return raceData.positions.find(boat => boat.id === teamId);
  }

  // Helper method to get leaderboard for a specific team
  getTeamLeaderboardData(raceData: RaceData, teamId: number) {
    for (const tag of raceData.leaderboard.tags) {
      const team = tag.teams.find(t => t.id === teamId);
      if (team) {
        return { team, tag };
      }
    }
    return null;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const raceDataService = new RaceDataService();