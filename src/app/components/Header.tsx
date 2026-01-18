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
  hideUserControls?: boolean; // Hide profile/logout when viewing analysis results
}

export function Header({ onReset, showReset, user, onSignIn, onSignOut, hideUserControls = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-emerald-200">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
        <button
          onClick={onReset}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-xl">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-bold text-emerald-900">EcoLens</h1>
            <p className="text-[10px] sm:text-xs text-emerald-600 hidden xs:block">See the environmental cost</p>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {showReset && (
            <>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="sm"
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Another</span>
              </Button>
            </>
          )}

          {/* Sign in button when not logged in - only show on home */}
          {!hideUserControls && !user && onSignIn && (
            <Button
              onClick={onSignIn}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white ml-1 sm:ml-2"
            >
              Sign In
            </Button>
          )}

          {/* User menu - only show on home */}
          {!hideUserControls && user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 ml-1 sm:ml-2 px-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-gray-700">{user.name}</span>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="gap-2 text-red-600 focus:text-red-600"
                    onClick={onSignOut}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Logout button */}
              {onSignOut && (
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 px-2 sm:px-3"
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