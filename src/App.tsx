import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { RaceMap } from './components/race/RaceMap'
import { Leaderboard } from './components/race/Leaderboard'
import { SpeedChart } from './components/race/SpeedChart'
import { RaceStats } from './components/race/RaceStats'
import { mockRace } from './data/mockRaceData'
import { blink } from './blink/client'
import { Toaster } from './components/ui/toaster'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedBoats, setSelectedBoats] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleBoatSelect = (boatId: string) => {
    setSelectedBoats(prev => {
      if (prev.includes(boatId)) {
        return prev.filter(id => id !== boatId)
      } else {
        return [...prev, boatId]
      }
    })
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
              Access live race tracking, performance analytics, and boat comparison tools.
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>✓ Real-time race tracking</p>
            <p>✓ Interactive boat analytics</p>
            <p>✓ Performance comparisons</p>
          </div>
        </div>
      </div>
    )
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <RaceStats race={mockRace} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RaceMap 
                  race={mockRace} 
                  selectedBoats={selectedBoats}
                  className="h-96"
                />
              </div>
              <div>
                <Leaderboard 
                  race={mockRace}
                  onBoatSelect={handleBoatSelect}
                  selectedBoats={selectedBoats}
                />
              </div>
            </div>
            <SpeedChart race={mockRace} selectedBoats={selectedBoats} />
          </div>
        )
      
      case 'leaderboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard 
              race={mockRace}
              onBoatSelect={handleBoatSelect}
              selectedBoats={selectedBoats}
            />
            <div className="space-y-6">
              <RaceStats race={mockRace} />
            </div>
          </div>
        )
      
      case 'comparison':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Boat Comparison</h2>
              <p className="text-gray-600 mb-4">
                Select boats from the leaderboard to compare their performance metrics.
              </p>
              {selectedBoats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No boats selected for comparison
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Leaderboard 
                race={mockRace}
                onBoatSelect={handleBoatSelect}
                selectedBoats={selectedBoats}
              />
              <SpeedChart race={mockRace} selectedBoats={selectedBoats} />
            </div>
          </div>
        )
      
      case 'analysis':
        return (
          <div className="space-y-6">
            <RaceMap 
              race={mockRace} 
              selectedBoats={selectedBoats}
              className="h-96"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpeedChart race={mockRace} selectedBoats={selectedBoats} />
              <Leaderboard 
                race={mockRace}
                onBoatSelect={handleBoatSelect}
                selectedBoats={selectedBoats}
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} onViewChange={setActiveView} />
      
      <main className="container mx-auto px-4 py-6">
        {renderMainContent()}
      </main>
      
      <Toaster />
    </div>
  )
}

export default App