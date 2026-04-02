import { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle, X, Settings, ChevronUp, ChevronDown, Calendar, Trash2 } from 'lucide-react';
import { useDesign } from '../context/DesignContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

export function Matches() {
  const { mode } = useDesign();
  const { user } = useAuth();
  const isLoFi = mode === 'lofi';
  const isAdmin = user?.role === 'admin';

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  const [totalCourts, setTotalCourts] = useState(3);
  const [startHour, setStartHour] = useState(9);
  const [hasGenerated, setHasGenerated] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axiosInstance.get('/api/matches', authHeaders);
        setMatches(response.data);
        if (response.data.length > 0) setHasGenerated(true);
      } catch (error) {
        console.error('Failed to fetch matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateRoundRobin = async () => {
    try {
      const response = await axiosInstance.post('/api/matches/generate', { totalCourts, startHour }, authHeaders);
      setMatches(response.data);
      setHasGenerated(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate schedule.');
    }
  };

  const handleRecordResult = async (matchId, winner) => {
    try {
      const response = await axiosInstance.put(`/api/matches/${matchId}`, { winner, completed: true }, authHeaders);
      setMatches(matches.map((m) => (m._id === response.data._id ? response.data : m)));
      setSelectedMatch(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record result.');
    }
  };

  const handleDeleteClick = (match) => { setMatchToDelete(match); setShowDeleteDialog(true); };

  const handleConfirmDelete = async () => {
    if (!matchToDelete) return;
    try {
      await axiosInstance.delete(`/api/matches/${matchToDelete._id}`, authHeaders);
      setMatches(matches.filter((m) => m._id !== matchToDelete._id));
      setShowDeleteDialog(false);
      setMatchToDelete(null);
    } catch (error) {
      alert('Failed to delete match.');
    }
  };

  const handleCancelDelete = () => { setShowDeleteDialog(false); setMatchToDelete(null); };

  if (loading) {
    return <div className={`p-4 text-center ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className={`font-bold mb-1 ${isLoFi ? 'text-[#333333] text-base' : 'text-white text-2xl'}`}>
          {isLoFi ? '[MATCH SCHEDULE]' : 'Match Schedule'}
        </h2>
        <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
          {hasGenerated
            ? `${matches.filter((m) => !m.completed).length} upcoming matches${isAdmin ? '' : ' • Read-only view'}`
            : isAdmin
              ? 'Configure tournament settings below'
              : 'Waiting for admin to generate schedule'
          }
        </p>
      </div>

      {/* Tournament Configuration Card - ADMIN ONLY */}
      {isAdmin && (
        <div className={`mb-6 p-4 ${isLoFi ? 'bg-white border-2 border-[#999999]' : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'}`}>
          <div className="flex items-center gap-2 mb-4">
            {isLoFi ? <span className="text-xs text-[#666666]">[CFG]</span> : <Settings className="w-5 h-5 text-[#CCFF00]" />}
            <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-sm' : 'text-white text-base'}`}>
              {isLoFi ? '[TOURNAMENT CONFIG]' : 'Tournament Configuration'}
            </h3>
          </div>
          <div className="space-y-4">
            {/* Total Courts Stepper */}
            <div>
              <label className={`block text-xs mb-2 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Total Available Courts</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setTotalCourts(Math.max(1, totalCourts - 1))} disabled={hasGenerated}
                  className={`w-10 h-10 flex items-center justify-center ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999]' : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded'}`}>
                  <ChevronDown className={`w-5 h-5 ${isLoFi ? 'text-[#000000]' : 'text-white'}`} />
                </button>
                <div className={`flex-1 text-center py-2 font-bold text-lg ${isLoFi ? 'bg-[#F5F5F5] border-2 border-[#CCCCCC] text-[#000000]' : 'bg-[#2A2A2A] rounded text-white'}`}>
                  {totalCourts}
                </div>
                <button onClick={() => setTotalCourts(Math.min(10, totalCourts + 1))} disabled={hasGenerated}
                  className={`w-10 h-10 flex items-center justify-center ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999]' : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded'}`}>
                  <ChevronUp className={`w-5 h-5 ${isLoFi ? 'text-[#000000]' : 'text-white'}`} />
                </button>
              </div>
            </div>
            {/* Start Hour */}
            <div>
              <label className={`block text-xs mb-2 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Tournament Start Hour</label>
              <div className="flex items-center gap-2">
                {isLoFi ? <span className="text-xs text-[#666666]">[CLK]</span> : <Calendar className="w-4 h-4 text-[#888888]" />}
                <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} disabled={hasGenerated}
                  className={`flex-1 px-3 py-2 ${isLoFi ? 'bg-[#F5F5F5] border-2 border-[#999999] text-[#000000]' : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white'}`}>
                  {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
                    <option key={hour} value={hour}>{hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}</option>
                  ))}
                </select>
              </div>
            </div>
            {!hasGenerated ? (
              <button onClick={generateRoundRobin} className={`w-full py-3 font-bold ${isLoFi ? 'bg-[#000000] text-white border-2 border-[#000000]' : 'bg-[#CCFF00] text-[#121212] rounded'}`}>
                {isLoFi ? '[GENERATE ROUND-ROBIN SCHEDULE]' : 'Generate Round-Robin Schedule'}
              </button>
            ) : (
              <div className={`text-center py-2 text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
                {isLoFi ? '[SCHEDULE GENERATED]' : '✓ Schedule Generated'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasGenerated && (
        <div className={`py-12 text-center ${isLoFi ? 'bg-white border-2 border-dashed border-[#CCCCCC]' : 'bg-[#1E1E1E] border-2 border-dashed border-[#2A2A2A] rounded-lg'}`}>
          <div className={`text-6xl mb-4 ${isLoFi ? 'text-[#CCCCCC]' : 'opacity-20'}`}>{isLoFi ? '[   ]' : '📅'}</div>
          <h3 className={`font-bold mb-2 ${isLoFi ? 'text-[#666666] text-sm' : 'text-[#888888] text-base'}`}>
            {isLoFi ? '[NO MATCHES SCHEDULED]' : 'No Matches Scheduled'}
          </h3>
          <p className={`text-sm max-w-xs mx-auto ${isLoFi ? 'text-[#999999]' : 'text-[#666666]'}`}>
            {isAdmin
              ? 'Configure your club settings above to generate the tournament pairings.'
              : 'The tournament schedule will appear here once the administrator generates it.'
            }
          </p>
        </div>
      )}

      {/* Match Cards */}
      {hasGenerated && (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match._id} className={`p-4 ${isLoFi ? 'bg-white border-2 border-[#999999]' : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'} ${match.completed ? 'opacity-60' : ''}`}>
              {/* Match Header */}
              <div className={`flex items-center gap-3 pb-3 mb-3 border-b ${isLoFi ? 'border-[#CCCCCC]' : 'border-[#2A2A2A]'}`}>
                <div className="flex items-center gap-1.5 flex-1">
                  {isLoFi ? <span className="text-xs text-[#666666]">[CLK]</span> : <Clock className="w-4 h-4 text-[#888888]" />}
                  <span className={`text-sm font-medium ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>{match.timeSlot}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isLoFi ? <span className="text-xs text-[#666666]">[PIN]</span> : <MapPin className="w-4 h-4 text-[#888888]" />}
                  <span className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>{match.courtName}</span>
                </div>

                {/* Delete Button - ADMIN ONLY */}
                {isAdmin && (
                  <button onClick={() => handleDeleteClick(match)}
                    className={`p-1.5 ${isLoFi ? 'border border-[#999999] hover:border-[#000000]' : 'hover:bg-[#2A2A2A] rounded'}`} title="Cancel match">
                    {isLoFi ? <X className="w-4 h-4 text-[#666666]" /> : <Trash2 className="w-4 h-4 text-[#888888] hover:text-red-500" />}
                  </button>
                )}
              </div>

              {/* Players */}
              <div className="space-y-2 mb-3">
                <div className={`flex items-center ${match.winner === match.player1 ? (isLoFi ? 'font-bold' : 'text-[#CCFF00]') : ''}`}>
                  <div className={`w-2 h-2 mr-2 ${isLoFi ? 'bg-[#000000] border border-[#000000]' : 'bg-[#CCFF00] rounded-full'}`} />
                  <span className={`text-sm ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>{match.player1}</span>
                  {match.winner === match.player1 && !isLoFi && <CheckCircle className="w-4 h-4 ml-2 text-[#CCFF00]" />}
                </div>
                <div className={`flex items-center ${match.winner === match.player2 ? (isLoFi ? 'font-bold' : 'text-[#CCFF00]') : ''}`}>
                  <div className={`w-2 h-2 mr-2 ${isLoFi ? 'bg-[#000000] border border-[#000000]' : 'bg-[#CCFF00] rounded-full'}`} />
                  <span className={`text-sm ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>{match.player2}</span>
                  {match.winner === match.player2 && !isLoFi && <CheckCircle className="w-4 h-4 ml-2 text-[#CCFF00]" />}
                </div>
              </div>

              {/* Record Result Button - ADMIN ONLY */}
              {!match.completed && isAdmin && (
                <button onClick={() => setSelectedMatch(match)}
                  className={`w-full py-2 font-medium ${isLoFi ? 'bg-[#CCCCCC] border-2 border-[#000000] text-[#000000]' : 'bg-[#CCFF00] text-[#121212] rounded'}`}>
                  {isLoFi ? '[RECORD RESULT]' : 'Record Result'}
                </button>
              )}

              {/* Status for players or completed matches */}
              {!match.completed && !isAdmin && (
                <div className={`text-center py-2 text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
                  {isLoFi ? '[SCHEDULED]' : 'Scheduled'}
                </div>
              )}

              {match.completed && (
                <div className={`text-center py-2 text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
                  {isLoFi ? '[COMPLETED]' : '✓ Completed'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Record Result Dialog - ADMIN ONLY */}
      {isAdmin && selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-6 ${isLoFi ? 'bg-white border-4 border-[#000000]' : 'bg-[#1E1E1E] rounded-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-base' : 'text-white text-lg'}`}>
                {isLoFi ? '[SELECT WINNER]' : 'Select Winner'}
              </h3>
              <button onClick={() => setSelectedMatch(null)} className={isLoFi ? 'text-[#666666]' : 'text-[#888888]'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <button onClick={() => handleRecordResult(selectedMatch._id, selectedMatch.player1)}
                className={`w-full p-3 text-left font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#000000]' : 'bg-[#2A2A2A] text-white border border-[#3A3A3A] rounded hover:border-[#CCFF00]'}`}>
                {selectedMatch.player1}
              </button>
              <button onClick={() => handleRecordResult(selectedMatch._id, selectedMatch.player2)}
                className={`w-full p-3 text-left font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#000000]' : 'bg-[#2A2A2A] text-white border border-[#3A3A3A] rounded hover:border-[#CCFF00]'}`}>
                {selectedMatch.player2}
              </button>
            </div>
            <button onClick={() => setSelectedMatch(null)}
              className={`w-full py-2 font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#333333]' : 'bg-[#2A2A2A] text-[#888888] rounded'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Match Dialog - ADMIN ONLY */}
      {isAdmin && showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-6 ${isLoFi ? 'bg-white border-4 border-[#000000]' : 'bg-[#1E1E1E] rounded-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-base' : 'text-white text-lg'}`}>
                {isLoFi ? '[DELETE MATCH]' : 'Delete Match'}
              </h3>
              <button onClick={handleCancelDelete} className={isLoFi ? 'text-[#666666]' : 'text-[#888888]'}><X className="w-5 h-5" /></button>
            </div>
            <div className="mb-4">
              <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Are you sure you want to delete this match?</p>
              {matchToDelete && (
                <div className={`mt-3 p-3 ${isLoFi ? 'bg-[#F5F5F5] border border-[#CCCCCC]' : 'bg-[#2A2A2A] rounded border border-[#3A3A3A]'}`}>
                  <p className={`text-sm font-medium ${isLoFi ? 'text-[#000000]' : 'text-white'}`}>{matchToDelete.player1} vs {matchToDelete.player2}</p>
                  <p className={`text-xs mt-1 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>{matchToDelete.timeSlot} • {matchToDelete.courtName}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCancelDelete}
                className={`flex-1 py-2 font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#333333]' : 'bg-[#2A2A2A] text-[#888888] rounded'}`}>Cancel</button>
              <button onClick={handleConfirmDelete}
                className={`flex-1 py-2 font-bold ${isLoFi ? 'bg-[#CC0000] text-white border-2 border-[#CC0000]' : 'bg-[#FF4444] text-white rounded'}`}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
