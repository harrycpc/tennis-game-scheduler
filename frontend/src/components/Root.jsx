import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Calendar, Trophy, LogOut } from 'lucide-react';
import { useDesign } from '../context/DesignContext';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useDesign();
  const { user, signOut } = useAuth();

  const isLoFi = mode === 'lofi';
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { path: '/roster', label: 'Roster', icon: Users },
    { path: '/matches', label: 'Matches', icon: Calendar },
    { path: '/standings', label: 'Standings', icon: Trophy },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen flex flex-col ${isLoFi ? 'bg-[#E8E8E8]' : 'bg-[#121212]'}`}>

        <main className="flex-1 max-w-md mx-auto w-full pb-20 pt-4">
          {/* User Info & Sign Out */}
          <div className="px-4 mb-4 flex items-center justify-between">
            {/* User Info with Role Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded ${
              isLoFi ? 'bg-white border-2 border-[#999999]' : 'bg-[#1E1E1E] border border-[#2A2A2A]'
            }`}>
              <div className={`text-xs ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>
                <span className="font-medium">{user?.name}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                  isAdmin
                    ? isLoFi
                      ? 'bg-[#000000] text-white'
                      : 'bg-[#CCFF00] text-[#121212]'
                    : isLoFi
                      ? 'bg-[#CCCCCC] text-[#666666]'
                      : 'bg-[#2A2A2A] text-[#888888]'
                }`}>
                  {isAdmin ? (isLoFi ? '[ADMIN]' : 'Admin') : (isLoFi ? '[PLAYER]' : 'Player')}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-opacity hover:opacity-80 ${
                isLoFi
                  ? 'bg-[#CCCCCC] text-[#333333] border border-[#999999]'
                  : 'bg-[#2A2A2A] text-white border border-[#3A3A3A]'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              {isLoFi ? '[SIGN OUT]' : 'Sign Out'}
            </button>
          </div>

          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 border-t ${
          isLoFi ? 'bg-white border-[#999999]' : 'bg-[#1E1E1E] border-[#2A2A2A]'
        }`}>
          <div className="max-w-md mx-auto flex">
            {tabs.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
                    isLoFi
                      ? active ? 'bg-[#CCCCCC] text-[#000000]' : 'text-[#666666]'
                      : active ? 'text-[#CCFF00]' : 'text-[#888888]'
                  }`}
                >
                  {isLoFi ? (
                    <>
                      <div className={`w-6 h-6 border-2 mb-1 ${active ? 'border-[#000000]' : 'border-[#666666]'}`}>
                        <div className="w-full h-full flex items-center justify-center text-xs">{label[0]}</div>
                      </div>
                      <span className="text-xs font-medium">{label}</span>
                    </>
                  ) : (
                    <>
                      <Icon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{label}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
