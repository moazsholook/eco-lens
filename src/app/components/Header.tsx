import { Leaf, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { DemoModeSelector } from '@/app/components/DemoModeSelector';

interface HeaderProps {
  onReset: () => void;
  showReset: boolean;
  onDemoSelect?: (demoType: string) => void;
}

export function Header({ onReset, showReset, onDemoSelect }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-emerald-900">EcoLens</h1>
            <p className="text-xs text-emerald-600">See the environmental cost</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {onDemoSelect && !showReset && (
            <DemoModeSelector onSelectDemo={onDemoSelect} />
          )}

          {showReset && (
            <>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Scan Another
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}