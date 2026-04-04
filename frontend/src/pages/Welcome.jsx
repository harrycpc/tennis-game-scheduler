import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, ChevronRight } from 'lucide-react';
import { useDesign } from '../context/DesignContext';

export function Welcome() {
  const navigate = useNavigate();
  const { mode } = useDesign();
  const isLoFi = mode === 'lofi';

  return (
    <div className={`min-h-screen flex flex-col ${isLoFi ? 'bg-[#E8E8E8]' : 'bg-[#121212]'}`}>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* App Icon/Logo */}
          <div className="mb-8">
            {isLoFi ? (
              <div className="w-24 h-24 mx-auto border-4 border-[#000000] bg-white flex items-center justify-center">
                <span className="text-4xl font-bold text-[#000000]">T</span>
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#CCFF00] to-[#9FCC00] rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-12 h-12 text-[#121212]" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className={`font-bold mb-3 ${
            isLoFi ? 'text-[#000000] text-2xl' : 'text-white text-4xl'
          }`}>
            {isLoFi ? '[TENNIS TOURNAMENT]' : 'Tennis Tournament'}
          </h1>

          {/* Subtitle */}
          <p className={`mb-8 ${
            isLoFi ? 'text-[#666666] text-sm' : 'text-[#888888] text-lg'
          }`}>
            {isLoFi
              ? '[ORGANIZE MATCHES & TRACK STANDINGS]'
              : "Organize matches, track results, and manage your club's tournament schedule"
            }
          </p>

          {/* Feature List */}
          <div className="space-y-3 mb-10">
            <div className={`flex items-center gap-3 p-4 ${
              isLoFi
                ? 'bg-white border-2 border-[#999999]'
                : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'
            }`}>
              {isLoFi ? (
                <div className="w-8 h-8 border-2 border-[#000000] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">U</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[#CCFF00]" />
                </div>
              )}
              <div className="text-left">
                <h3 className={`font-semibold text-sm ${
                  isLoFi ? 'text-[#000000]' : 'text-white'
                }`}>
                  {isLoFi ? '[ROSTER MANAGEMENT]' : 'Roster Management'}
                </h3>
                <p className={`text-xs ${
                  isLoFi ? 'text-[#666666]' : 'text-[#888888]'
                }`}>
                  {isLoFi ? '[ADD & TRACK PLAYERS]' : 'Add players and track their records'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 ${
              isLoFi
                ? 'bg-white border-2 border-[#999999]'
                : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'
            }`}>
              {isLoFi ? (
                <div className="w-8 h-8 border-2 border-[#000000] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">C</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#CCFF00]" />
                </div>
              )}
              <div className="text-left">
                <h3 className={`font-semibold text-sm ${
                  isLoFi ? 'text-[#000000]' : 'text-white'
                }`}>
                  {isLoFi ? '[MATCH SCHEDULING]' : 'Match Scheduling'}
                </h3>
                <p className={`text-xs ${
                  isLoFi ? 'text-[#666666]' : 'text-[#888888]'
                }`}>
                  {isLoFi ? '[AUTO ROUND-ROBIN GENERATOR]' : 'Generate round-robin schedules automatically'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 ${
              isLoFi
                ? 'bg-white border-2 border-[#999999]'
                : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'
            }`}>
              {isLoFi ? (
                <div className="w-8 h-8 border-2 border-[#000000] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">T</span>
                </div>
              ) : (
                <div className="w-10 h-10 bg-[#CCFF00]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-[#CCFF00]" />
                </div>
              )}
              <div className="text-left">
                <h3 className={`font-semibold text-sm ${
                  isLoFi ? 'text-[#000000]' : 'text-white'
                }`}>
                  {isLoFi ? '[LIVE LEADERBOARD]' : 'Live Leaderboard'}
                </h3>
                <p className={`text-xs ${
                  isLoFi ? 'text-[#666666]' : 'text-[#888888]'
                }`}>
                  {isLoFi ? '[REAL-TIME STANDINGS]' : 'Track rankings in real-time'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/login')}
            className={`w-full py-4 font-bold flex items-center justify-center gap-2 ${
              isLoFi
                ? 'bg-[#000000] text-white border-4 border-[#000000]'
                : 'bg-[#CCFF00] text-[#121212] rounded-lg shadow-lg'
            }`}
          >
            {isLoFi ? '[GET STARTED]' : 'Get Started'}
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Footer Note */}
          <p className={`mt-6 text-xs ${
            isLoFi ? 'text-[#999999]' : 'text-[#666666]'
          }`}>
            {isLoFi ? '[MOBILE-FIRST DESIGN]' : 'Optimized for mobile and tablet'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
