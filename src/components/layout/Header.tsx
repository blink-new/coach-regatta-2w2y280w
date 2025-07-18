import { ArrowLeft, BarChart3, Trophy, GitCompare, Route, CloudRain, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { HistoricalRace } from '../../types/race'
import { blink } from '../../blink/client'

interface HeaderProps {
  activeView: string
  onViewChange: (view: string) => void
  selectedRace?: HistoricalRace | null
  onBackToRaceSelection?: () => void
}

export function Header({ activeView, onViewChange, selectedRace, onBackToRaceSelection }: HeaderProps) {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'results', label: 'Results', icon: Trophy },
    { id: 'comparison', label: 'Comparison', icon: GitCompare },
    { id: 'route', label: 'Route Analysis', icon: Route },
    { id: 'weather', label: 'Weather', icon: CloudRain }
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              {selectedRace && onBackToRaceSelection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToRaceSelection}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Coach Regatta</h1>
                  {selectedRace && (
                    <div className="flex items-center space-x-2 -mt-1">
                      <span className="text-sm text-gray-600">{selectedRace.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedRace.year}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation tabs - only show when race is selected */}
            {selectedRace && (
              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => onViewChange(item.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            )}
          </div>

          {/* Right side - Race info and user menu */}
          <div className="flex items-center space-x-4">
            {selectedRace && (
              <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{selectedRace.boats.length}</span>
                  <span>boats</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{selectedRace.distance}</span>
                  <span>NM</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">
                    {new Date(selectedRace.startTime).toLocaleDateString('en-AU', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => blink.auth.logout()}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile navigation - only show when race is selected */}
        {selectedRace && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="flex items-center space-x-1 py-2 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}