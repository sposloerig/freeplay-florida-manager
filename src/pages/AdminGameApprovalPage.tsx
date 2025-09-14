import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Game } from '../types';
import { Check, X, Eye, Calendar, User, Mail, Phone, Settings, Camera } from 'lucide-react';

const AdminGameApprovalPage: React.FC = () => {
  const [pendingGames, setPendingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingGames();
  }, []);

  const fetchPendingGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingGames(data || []);
    } catch (err) {
      console.error('Error fetching pending games:', err);
      setError('Failed to load pending games');
    } finally {
      setLoading(false);
    }
  };

  const approveGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'admin' // You could get this from auth context
        })
        .eq('id', gameId);

      if (error) throw error;

      // Refresh the list
      await fetchPendingGames();
    } catch (err) {
      console.error('Error approving game:', err);
      setError('Failed to approve game');
    }
  };

  const rejectGame = async (gameId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', gameId);

      if (error) throw error;

      // Refresh the list
      await fetchPendingGames();
    } catch (err) {
      console.error('Error rejecting game:', err);
      setError('Failed to reject game');
    }
  };

  const handleReject = (gameId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectGame(gameId, reason);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading pending games...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Game Approval Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Review and approve submitted games for the Free Play Florida event.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {pendingGames.length === 0 ? (
        <div className="text-center py-10">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No pending games
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            All submitted games have been reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingGames.map((game) => (
            <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {game.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {game.type} • Submitted {new Date(game.submittedAt || game.dateAdded).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveGame(game.id)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(game.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game Images */}
                {game.images && game.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Photos ({game.images.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {game.images.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${game.name} - ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Game Details */}
                <div className="space-y-4">
                  {/* Owner Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Owner Information
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Name:</strong> {game.ownerName}</p>
                      <p className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {game.ownerEmail}
                      </p>
                      {game.ownerPhone && (
                        <p className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {game.ownerPhone}
                        </p>
                      )}
                      {game.ownerNotes && (
                        <p><strong>Notes:</strong> {game.ownerNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Service Preferences */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Service Preferences
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>
                        <strong>Allow others to service:</strong> {game.allowOthersToService ? 'Yes' : 'No'}
                      </p>
                      {game.serviceNotes && (
                        <p><strong>Service notes:</strong> {game.serviceNotes}</p>
                      )}
                    </div>
                  </div>

                  {/* Sales Information */}
                  {game.forSale && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sales Information
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {game.askingPrice && (
                          <p><strong>Asking Price:</strong> ${game.askingPrice.toLocaleString()}</p>
                        )}
                        <p><strong>Accept Offers:</strong> {game.acceptOffers ? 'Yes' : 'No'}</p>
                        {game.saleNotes && (
                          <p><strong>Sales notes:</strong> {game.saleNotes}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGameApprovalPage;
