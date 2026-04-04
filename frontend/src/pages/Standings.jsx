import { useState, useEffect } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { useDesign } from '../context/DesignContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

export function Standings() {
  const { mode } = useDesign();
  const { user } = useAuth();
  const isLoFi = mode === 'lofi';

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axiosInstance.get('/api/players', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlayers(response.data);
      } catch (error) {
        console.error('Failed to fetch standings');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });

  const getMedalColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return null;
  };

  const getWinPercentage = (player) => {
    const total = player.wins + player.losses;
    if (total === 0) return 0;
    return Math.round((player.wins / total) * 100);
  };

  if (loading) {
    return <div className={`p-4 text-center ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className={`font-bold mb-1 ${isLoFi ? 'text-[#333333] text-base' : 'text-white text-2xl'}`}>
          {isLoFi ? '[LIVE LEADERBOARD]' : 'Live Leaderboard'}
        </h2>
        <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Ranked by wins</p>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const rank = index + 1;
          const medalColor = getMedalColor(rank);
          const winPct = getWinPercentage(player);

          return (
            <div
              key={player._id}
              className={`flex items-center gap-3 p-4 ${
                isLoFi
                  ? 'bg-white border-2 border-[#999999]'
                  : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'
              } ${rank <= 3 && !isLoFi ? 'border-[#CCFF00]' : ''}`}
            >
              <div className="w-10 flex items-center justify-center">
                {isLoFi ? (
                  rank <= 3 ? (
                    <div className={`w-8 h-8 border-2 flex items-center justify-center font-bold ${
                      rank === 1 ? 'border-[#000000] bg-[#000000] text-white'
                        : rank === 2 ? 'border-[#666666] bg-[#666666] text-white'
                        : 'border-[#999999] bg-[#999999] text-white'
                    }`}>
                      {rank}
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-[#666666]">{rank}</span>
                  )
                ) : (
                  medalColor ? (
                    <div className="relative">
                      <Medal className="w-8 h-8" style={{ color: medalColor }} fill={medalColor} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {rank}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-[#666666]">{rank}</span>
                  )
                )}
              </div>

              <div className="flex-1">
                <h3 className={`font-semibold ${isLoFi ? 'text-[#000000] text-sm' : 'text-white text-base'}`}>
                  {player.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-xs ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
                    {player.wins}W - {player.losses}L
                  </span>
                  {!isLoFi && (
                    <>
                      <span className="text-[#3A3A3A]">•</span>
                      <span className="text-xs text-[#888888]">{winPct}% win rate</span>
                    </>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-2 ${
                isLoFi ? 'bg-[#E8E8E8] border border-[#999999]' : 'bg-[#2A2A2A] rounded-lg'
              }`}>
                {isLoFi ? (
                  <>
                    <span className="text-xs text-[#666666]">[*]</span>
                    <span className="text-lg font-bold text-[#000000]">{player.wins}</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 text-[#CCFF00]" />
                    <span className="text-lg font-bold text-[#CCFF00]">{player.wins}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedPlayers.length > 0 && (
        <div className={`mt-6 p-4 ${
          isLoFi ? 'bg-[#F5F5F5] border-2 border-[#CCCCCC]' : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'
        }`}>
          <h3 className={`text-sm font-bold mb-2 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
            {isLoFi ? '[TOURNAMENT STATS]' : 'Tournament Stats'}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className={`text-2xl font-bold ${isLoFi ? 'text-[#000000]' : 'text-[#CCFF00]'}`}>{sortedPlayers.length}</div>
              <div className={`text-xs ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Players</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isLoFi ? 'text-[#000000]' : 'text-[#CCFF00]'}`}>
                {sortedPlayers.reduce((sum, p) => sum + p.wins + p.losses, 0) / 2}
              </div>
              <div className={`text-xs ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Matches</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${isLoFi ? 'text-[#000000]' : 'text-[#CCFF00]'}`}>{sortedPlayers[0]?.wins || 0}</div>
              <div className={`text-xs ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Top Wins</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Standings;
