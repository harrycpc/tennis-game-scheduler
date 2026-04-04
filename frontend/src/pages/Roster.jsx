import { useState, useEffect, useRef } from 'react';
import { Plus, Trophy, X, Trash2, Edit3 } from 'lucide-react';
import { useDesign } from '../context/DesignContext';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

export function Roster() {
  const { mode } = useDesign();
  const { user } = useAuth();
  const isLoFi = mode === 'lofi';
  const isAdmin = user?.role === 'admin';

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [playerToEdit, setPlayerToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const suggestionsRef = useRef(null);

  const authHeaders = { headers: { Authorization: `Bearer ${user.token}` } };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axiosInstance.get('/api/players', authHeaders);
        setPlayers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete: search registered users as admin types
  const handleNameChange = async (value) => {
    setNewPlayerName(value);
    setSelectedUserId(null);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axiosInstance.get(`/api/auth/users/search?q=${encodeURIComponent(value.trim())}`, authHeaders);
      const data = Array.isArray(response.data) ? response.data : [];
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestedUser) => {
    setNewPlayerName(suggestedUser.name);
    setSelectedUserId(suggestedUser._id);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;
    try {
      const payload = { name: newPlayerName.trim() };
      if (selectedUserId) payload.userId = selectedUserId;

      const response = await axiosInstance.post('/api/players', payload, authHeaders);
      setPlayers([response.data, ...players]);
      setNewPlayerName('');
      setSelectedUserId(null);
      setSuggestions([]);
      setShowAddDialog(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add player.');
    }
  };

  const handleEditClick = (player) => {
    setPlayerToEdit(player);
    setEditName(player.name);
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim() || !playerToEdit) return;
    try {
      const response = await axiosInstance.put(`/api/players/${playerToEdit._id}`, { name: editName.trim() }, authHeaders);
      setPlayers(players.map((p) => (p._id === response.data._id ? response.data : p)));
      setShowEditDialog(false);
      setPlayerToEdit(null);
      setEditName('');
    } catch (error) {
      alert('Failed to update player.');
    }
  };

  const handleDeleteClick = (player) => {
    setPlayerToDelete(player);
    setDeleteError('');
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!playerToDelete) return;
    try {
      await axiosInstance.delete(`/api/players/${playerToDelete._id}`, authHeaders);
      setPlayers(players.filter((p) => p._id !== playerToDelete._id));
      setShowDeleteDialog(false);
      setPlayerToDelete(null);
      setDeleteError('');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete player');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setPlayerToDelete(null);
    setDeleteError('');
  };

  if (loading) {
    return <div className={`p-4 text-center ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Loading...</div>;
  }

  return (
    <div className="p-4">
      {/* Page Title */}
      <div className="mb-4">
        <h2 className={`font-bold mb-1 ${isLoFi ? 'text-[#333333] text-base' : 'text-white text-2xl'}`}>
          {isLoFi ? '[ROSTER MANAGEMENT]' : 'Tournament Roster'}
        </h2>
        <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
          {players.length} participants{isAdmin ? '' : ' • Read-only view'}
        </p>
      </div>

      {/* Player List */}
      <div className="space-y-3 mb-20">
        {players.map((player) => (
          <div key={player._id}
            className={`p-4 ${isLoFi ? 'bg-white border-2 border-[#999999]' : 'bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <h3 className={`font-semibold ${isLoFi ? 'text-[#000000] text-sm' : 'text-white text-base'}`}>{player.name}</h3>
                <p className={`text-xs mt-1 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>{player.wins}W - {player.losses}L</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-3 py-1 ${isLoFi ? 'bg-[#E8E8E8] border border-[#999999]' : 'bg-[#2A2A2A] rounded-full'}`}>
                  {isLoFi ? (
                    <><span className="text-xs text-[#666666]">[*]</span><span className="text-xs font-bold text-[#000000]">{player.wins}</span></>
                  ) : (
                    <><Trophy className="w-3 h-3 text-[#CCFF00]" /><span className="text-xs font-bold text-[#CCFF00]">{player.wins}</span></>
                  )}
                </div>

                {/* Edit & Delete - ADMIN ONLY */}
                {isAdmin && (
                  <>
                    <button onClick={() => handleEditClick(player)}
                      className={`p-2 ${isLoFi ? 'bg-[#E8E8E8] border border-[#999999] text-[#666666] hover:text-[#000000]' : 'bg-[#2A2A2A] text-[#888888] hover:text-[#CCFF00] rounded'}`}>
                      {isLoFi ? <span className="text-xs font-bold">[E]</span> : <Edit3 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDeleteClick(player)}
                      className={`p-2 ${isLoFi ? 'bg-[#E8E8E8] border border-[#999999] text-[#666666] hover:text-[#000000]' : 'bg-[#2A2A2A] text-[#888888] hover:text-[#FF4444] rounded'}`}>
                      {isLoFi ? <span className="text-xs font-bold">[X]</span> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Player FAB - ADMIN ONLY */}
      {isAdmin && (
        <button onClick={() => setShowAddDialog(true)}
          className={`fixed bottom-24 right-4 w-14 h-14 flex items-center justify-center shadow-lg ${
            isLoFi ? 'bg-[#CCCCCC] border-2 border-[#000000]' : 'bg-[#CCFF00] rounded-full'
          }`}>
          {isLoFi ? <Plus className="w-8 h-8 text-[#000000] stroke-[3]" /> : <Plus className="w-8 h-8 text-[#121212]" />}
        </button>
      )}

      {/* Add Player Dialog with Autocomplete - ADMIN ONLY */}
      {isAdmin && showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-6 ${isLoFi ? 'bg-white border-4 border-[#000000]' : 'bg-[#1E1E1E] rounded-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-base' : 'text-white text-lg'}`}>
                {isLoFi ? '[ADD PLAYER]' : 'Add New Player'}
              </h3>
              <button onClick={() => { setShowAddDialog(false); setSuggestions([]); setShowSuggestions(false); }}
                className={isLoFi ? 'text-[#666666]' : 'text-[#888888]'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 relative" ref={suggestionsRef}>
              <label className={`block text-sm mb-2 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Player Name</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => handleNameChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder={isLoFi ? '[Type to search users]' : 'Type to search registered users...'}
                className={`w-full px-3 py-2 ${
                  isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#000000] placeholder:text-[#999999]'
                    : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white placeholder:text-[#666666]'
                }`}
                autoFocus
              />

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto z-50 ${
                  isLoFi ? 'bg-white border-2 border-[#000000]' : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg'
                }`}>
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSelectSuggestion(s)}
                      className={`w-full text-left px-3 py-2 transition-colors ${
                        isLoFi
                          ? 'hover:bg-[#E8E8E8] text-[#000000] border-b border-[#CCCCCC] last:border-b-0'
                          : 'hover:bg-[#3A3A3A] text-white border-b border-[#3A3A3A] last:border-b-0'
                      }`}
                    >
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className={`text-xs ${isLoFi ? 'text-[#999999]' : 'text-[#666666]'}`}>
                        {s.email} • {s.role}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowAddDialog(false); setSuggestions([]); setShowSuggestions(false); }}
                className={`flex-1 py-2 font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#333333]' : 'bg-[#2A2A2A] text-[#888888] rounded'}`}>
                Cancel
              </button>
              <button onClick={handleAddPlayer}
                className={`flex-1 py-2 font-bold ${isLoFi ? 'bg-[#000000] text-white border-2 border-[#000000]' : 'bg-[#CCFF00] text-[#121212] rounded'}`}>
                Add Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Dialog - ADMIN ONLY */}
      {isAdmin && showEditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-6 ${isLoFi ? 'bg-white border-4 border-[#000000]' : 'bg-[#1E1E1E] rounded-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-base' : 'text-white text-lg'}`}>
                {isLoFi ? '[EDIT PLAYER]' : 'Edit Player'}
              </h3>
              <button onClick={() => setShowEditDialog(false)} className={isLoFi ? 'text-[#666666]' : 'text-[#888888]'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className={`block text-sm mb-2 ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>Player Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                className={`w-full px-3 py-2 ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#000000]' : 'bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white'}`}
                autoFocus />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEditDialog(false)}
                className={`flex-1 py-2 font-medium ${isLoFi ? 'bg-[#E8E8E8] border-2 border-[#999999] text-[#333333]' : 'bg-[#2A2A2A] text-[#888888] rounded'}`}>Cancel</button>
              <button onClick={handleEditSubmit}
                className={`flex-1 py-2 font-bold ${isLoFi ? 'bg-[#000000] text-white border-2 border-[#000000]' : 'bg-[#CCFF00] text-[#121212] rounded'}`}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Player Dialog - ADMIN ONLY */}
      {isAdmin && showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-sm p-6 ${isLoFi ? 'bg-white border-4 border-[#000000]' : 'bg-[#1E1E1E] rounded-lg'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${isLoFi ? 'text-[#000000] text-base' : 'text-white text-lg'}`}>
                {isLoFi ? '[DELETE PLAYER]' : 'Delete Player'}
              </h3>
              <button onClick={handleCancelDelete} className={isLoFi ? 'text-[#666666]' : 'text-[#888888]'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className={`text-sm ${isLoFi ? 'text-[#666666]' : 'text-[#888888]'}`}>
                Are you sure you want to remove {playerToDelete?.name} from the roster?
              </p>
              <p className={`text-xs mt-1 ${isLoFi ? 'text-[#999999]' : 'text-[#666666]'}`}>
                This will not delete their user account.
              </p>
              {deleteError && (
                <p className={`text-sm mt-2 ${isLoFi ? 'text-[#CC0000]' : 'text-[#FF4444]'}`}>{deleteError}</p>
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

export default Roster;
