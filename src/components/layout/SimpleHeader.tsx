import { BarChart3 } from 'lucide-react';

export function SimpleHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Coach Regatta</h1>
              <p className="text-sm text-gray-600">Yacht Race Analysis Platform</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}