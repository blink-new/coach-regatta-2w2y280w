import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { RaceSelector } from './components/race/RaceSelector'
import { RaceMap } from './components/race/RaceMap'
import { Leaderboard } from './components/race/Leaderboard'
import { SpeedChart } from './components/race/SpeedChart'
import { RaceStats } from './components/race/RaceStats'
import { HistoricalRace } from './types/race'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedRace, setSelectedRace] = useState<HistoricalRace | null>(null)
  const [activeView, setActiveView] = useState('overview')
  const [selectedBoats, setSelectedBoats] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleRaceSelect = (race: HistoricalRace) => {
    setSelectedRace(race)
    setSelectedBoats([]) // Reset boat selection when changing races
    setActiveView('overview') // Reset to overview when selecting new race
  }

  const handleBoatSelect = (boatId: string) => {
    setSelectedBoats(prev => {
      if (prev.includes(boatId)) {
        return prev.filter(id => id !== boatId)
      } else {
        return [...prev, boatId]
      }
    })
  }

  const handleBackToRaceSelection = () => {
    setSelectedRace(null)
    setSelectedBoats([])
    setActiveView('overview')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Coach Regatta...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Regatta</h1>
            <p className="text-gray-600">Professional yacht race analytics platform</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Sign in to continue</h2>
            <p className="text-gray-600 mb-6">
              Access historical race analysis, performance metrics, and comparative boat data.
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>✓ Historical race data analysis</p>
            <p>✓ Boat performance comparisons</p>
            <p>✓ Weather correlation insights</p>
          </div>
        </div>
      </div>
    )
  }

  // Show race selector if no race is selected
  if (!selectedRace) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          activeView={activeView} 
          onViewChange={setActiveView}
          selectedRace={selectedRace}
          onBackToRaceSelection={handleBackToRaceSelection}
        />
        
        <main className="container mx-auto px-4 py-6">
          <RaceSelector 
            onRaceSelect={handleRaceSelect}
            selectedRaceId={selectedRace?.id}
          />
        </main>
        
        <Toaster />
      </div>
    )
  }

  // Convert HistoricalRace to Race format for existing components
  const raceForComponents = {
    id: selectedRace.id,
    name: selectedRace.name,
    startTime: selectedRace.startTime,
    endTime: selectedRace.endTime,
    status: 'finished' as const,
    boats: selectedRace.boats,
    course: selectedRace.course
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <RaceStats race={raceForComponents} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RaceMap 
                  race={raceForComponents} 
                  selectedBoats={selectedBoats}
                  className="h-96"
                />
              </div>
              <div>
                <Leaderboard 
                  race={raceForComponents}
                  onBoatSelect={handleBoatSelect}
                  selectedBoats={selectedBoats}
                />
              </div>
            </div>
            <SpeedChart race={raceForComponents} selectedBoats={selectedBoats} />
          </div>
        )
      
      case 'results':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard 
              race={raceForComponents}
              onBoatSelect={handleBoatSelect}
              selectedBoats={selectedBoats}
            />
            <div className="space-y-6">
              <RaceStats race={raceForComponents} />
            </div>
          </div>
        )
      
      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Boat Comparison Analysis</h2>
              <p className="text-gray-600 mb-4">
                Select boats from the results to compare their performance metrics throughout the race.
              </p>
              {selectedBoats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No boats selected for comparison
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard 
                race={raceForComponents}
                onBoatSelect={handleBoatSelect}
                selectedBoats={selectedBoats}
              />
              <SpeedChart race={raceForComponents} selectedBoats={selectedBoats} />
            </div>
          </div>
        )
      
      case 'route':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Route Analysis</h2>
              <p className="text-gray-600 mb-4">
                Analyze boat routes and tactical decisions throughout the race.
              </p>
            </div>
            <RaceMap 
              race={raceForComponents} 
              selectedBoats={selectedBoats}
              className="h-96"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpeedChart race={raceForComponents} selectedBoats={selectedBoats} />
              <Leaderboard 
                race={raceForComponents}
                onBoatSelect={handleBoatSelect}
                selectedBoats={selectedBoats}
              />
            </div>
          </div>
        )
      
      case 'weather':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Weather Analysis</h2>
              <p className="text-gray-600 mb-4">
                Correlate boat performance with weather conditions during the race.
              </p>
              <div className="text-center py-8 text-gray-500">
                Weather analysis feature coming soon
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        selectedRace={selectedRace}
        onBackToRaceSelection={handleBackToRaceSelection}
      />
      
      <main className="container mx-auto px-4 py-6">
        {renderMainContent()}
      </main>
      
      <Toaster />
    </div>
  )
}

export default App