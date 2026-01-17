import { Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface DemoModeSelectorProps {
  onSelectDemo: (demoType: string) => void;
}

export function DemoModeSelector({ onSelectDemo }: DemoModeSelectorProps) {
  const demoObjects = [
    { id: 'bottle', emoji: '🍶', name: 'Plastic Bottle', impact: 'Low' },
    { id: 'coffee', emoji: '☕', name: 'Coffee Cup', impact: 'Low' },
    { id: 'phone', emoji: '📱', name: 'Smartphone', impact: 'High' },
    { id: 'shirt', emoji: '👕', name: 'T-Shirt', impact: 'Medium' },
    { id: 'laptop', emoji: '💻', name: 'Laptop', impact: 'High' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
        >
          <Sparkles className="w-4 h-4" />
          Demo Mode
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Demo Objects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {demoObjects.map((obj) => (
          <DropdownMenuItem
            key={obj.id}
            onClick={() => onSelectDemo(obj.id)}
            className="cursor-pointer"
          >
            <span className="text-2xl mr-3">{obj.emoji}</span>
            <div className="flex-1">
              <p className="font-medium">{obj.name}</p>
              <p className="text-xs text-gray-500">{obj.impact} Impact</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
