import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Key, Wrench, MapPin, AlertCircle } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { Game } from '../types';

interface CheckInFormData {
  hasKey: boolean;
  workingCondition: boolean;
  zone: string;
  checkInNotes: string;
}

const AdminCheckInPage: React.FC = () => {
  const { games, updateGame, fetchGames } = useGameContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkInForm, setCheckInForm] = useState<CheckInFormData>({
    hasKey: false,
    workingCondition: false,
    zone: '',
    checkInNotes: ''
  });

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Filter games based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = games.filter(game => {
      const searchLower = searchTerm.toLowerCase();
      return (
        game.name.toLowerCase().includes(searchLower) ||
        game.ownerEmail?.toLowerCase().includes(searchLower) ||
        game.ownerName?.toLowerCase().includes(searchLower)
      );
    });

    setSearchResults(filtered);
  }, [searchTerm, games]);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
    setCheckInForm({
      hasKey: game.hasKey || false,
      workingCondition: game.workingCondition || false,
      zone: game.zone || '',
      checkInNotes: game.checkInNotes || ''
    });
  };

  const handleCheckIn = async () => {
    if (!selectedGame) return;

    setIsChecking(true);
    try {
      const updatedGame = {
        ...selectedGame,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: 'admin@test.com', // Current admin user
        hasKey: checkInForm.hasKey,
        workingCondition: checkInForm.workingCondition,
        zone: checkInForm.zone,
        checkInNotes: checkInForm.checkInNotes
      };

      await updateGame(updatedGame);
      
      // Refresh games list
      await fetchGames();
      
      // Reset form
      setSelectedGame(null);
      setSearchTerm('');
      setCheckInForm({
        hasKey: false,
        workingCondition: false,
        zone: '',
        checkInNotes: ''
      });

      alert('Game successfully checked in!');
    } catch (error) {
      console.error('Error checking in game:', error);
      alert('Failed to check in game. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusBadge = (game: Game) => {
    if (game.checkedIn) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Checked In
        </span>
      );
    }
    
    if (game.approvalStatus === 'approved') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlertCircle size={12} className="mr-1" />
          Awaiting Check-In
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Pending Approval
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Check-In</h1>
        <p className="text-gray-600">
          Search for games by name or submitter email to verify receipt and assign zones.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by game name, owner name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fpf-500 focus:border-transparent"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Search Results ({searchResults.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{game.name}</h4>
                      <p className="text-sm text-gray-600">
                        Owner: {game.ownerName} ({game.ownerEmail})
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {game.type} {game.zone && `• Zone: ${game.zone}`}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(game)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Check-In Form */}
      {selectedGame && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Check In: {selectedGame.name}
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Owner:</span> {selectedGame.ownerName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedGame.ownerEmail}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedGame.ownerPhone || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedGame.type}
                </div>
                <div>
                  <span className="font-medium">For Sale:</span> {selectedGame.forSale ? 'Yes' : 'No'}
                  {selectedGame.forSale && selectedGame.askingPrice && (
                    <span className="ml-2 text-green-600 font-medium">
                      ${selectedGame.askingPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {getStatusBadge(selectedGame)}
                </div>
              </div>
            </div>
          </div>

          {!selectedGame.checkedIn ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Verification Checklist</h3>
              
              {/* Key Verification */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hasKey"
                  checked={checkInForm.hasKey}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, hasKey: e.target.checked }))}
                  className="w-5 h-5 text-fpf-600 border-gray-300 rounded focus:ring-fpf-500"
                />
                <label htmlFor="hasKey" className="flex items-center text-gray-900">
                  <Key size={18} className="mr-2 text-gray-600" />
                  Game has key/lock mechanism (if applicable)
                </label>
              </div>

              {/* Working Condition */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="workingCondition"
                  checked={checkInForm.workingCondition}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, workingCondition: e.target.checked }))}
                  className="w-5 h-5 text-fpf-600 border-gray-300 rounded focus:ring-fpf-500"
                />
                <label htmlFor="workingCondition" className="flex items-center text-gray-900">
                  <Wrench size={18} className="mr-2 text-gray-600" />
                  Game is in working order and ready for play
                </label>
              </div>

              {/* Zone Assignment */}
              <div>
                <label className="flex items-center text-gray-900 mb-2">
                  <MapPin size={18} className="mr-2 text-gray-600" />
                  Assign Zone
                </label>
                <select
                  value={checkInForm.zone}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, zone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fpf-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Zone...</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(zone => (
                    <option key={zone} value={`Zone ${zone}`}>Zone {zone}</option>
                  ))}
                </select>
              </div>

              {/* Check-In Notes */}
              <div>
                <label htmlFor="checkInNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-In Notes (Optional)
                </label>
                <textarea
                  id="checkInNotes"
                  value={checkInForm.checkInNotes}
                  onChange={(e) => setCheckInForm(prev => ({ ...prev, checkInNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fpf-500 focus:border-transparent"
                  placeholder="Any additional notes about the game condition, setup, or special requirements..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleCheckIn}
                  disabled={!checkInForm.zone || isChecking}
                  className="flex items-center px-6 py-3 bg-fpf-600 text-white rounded-lg hover:bg-fpf-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle size={18} className="mr-2" />
                  {isChecking ? 'Checking In...' : 'Complete Check-In'}
                </button>
                
                <button
                  onClick={() => setSelectedGame(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-3" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800">Game Already Checked In</h3>
                  <p className="text-green-700 text-sm">
                    Checked in on {selectedGame.checkedInAt ? new Date(selectedGame.checkedInAt).toLocaleDateString() : 'Unknown date'}
                    {selectedGame.zone && ` • Assigned to ${selectedGame.zone}`}
                  </p>
                  {selectedGame.checkInNotes && (
                    <p className="text-green-700 text-sm mt-1">
                      <strong>Notes:</strong> {selectedGame.checkInNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-fpf-600">
            {games.filter(g => g.checkedIn).length}
          </div>
          <div className="text-sm text-gray-600">Checked In</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">
            {games.filter(g => g.approvalStatus === 'approved' && !g.checkedIn).length}
          </div>
          <div className="text-sm text-gray-600">Awaiting Check-In</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {games.filter(g => g.approvalStatus === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Approval</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {games.length}
          </div>
          <div className="text-sm text-gray-600">Total Games</div>
        </div>
      </div>
    </div>
  );
};

export default AdminCheckInPage;
