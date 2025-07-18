import { Anchor, Trophy, BarChart3, Users, Settings } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface HeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'comparison', label: 'Compare', icon: Users },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 }
  ]

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Anchor className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Coach Regatta</h1>
              <p className="text-xs text-gray-500">Race Analytics Platform</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live Race
          </Badge>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            )
          })}
        </nav>

        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}