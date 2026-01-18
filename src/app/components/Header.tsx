import { Leaf, RotateCcw, Home, LogOut, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface HeaderProps {
  onReset: () => void;
  showReset: boolean;
  user?: { id: string; name: string; email: string } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export function Header({ onReset, showReset, user, onSignIn, onSignOut }: HeaderProps) {
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

          {/* Sign in button when not logged in */}
          {!user && onSignIn && (
            <Button
              onClick={onSignIn}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white ml-2"
            >
              Sign In
            </Button>
          )}

          {/* User menu */}
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 ml-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-gray-700">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500 font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Logout button */}
              {onSignOut && (
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}