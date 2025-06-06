import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Edit, Save, X, Plus, Trash2, MessageSquare, Eye, EyeOff } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Game {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  asking_price?: number;
  for_sale: boolean;
  sale_condition_notes?: string;
  missing_parts?: string[];
  sale_notes?: string;
}

interface BuyerInquiry {
  id: string;
  game_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  offer_amount?: number;
  message: string;
  status: string;
  created_at: string;
  game?: { name: string };
}

const AdminGameSalesPage: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Game>>({});
  const [activeTab, setActiveTab] = useState<'games' | 'inquiries'>('games');
  const [newPart, setNewPart] = useState('');

  useEffect(() => {
    fetchGames();
    fetchInquiries();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id, name, type, location, status, asking_price, for_sale, sale_condition_notes, missing_parts, sale_notes')
        .order('name');

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_inquiries')
        .select(`
          *,
          game:games(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    }
  };

  const startEditing = (game: Game) => {
    setEditingGame(game.id);
    setEditForm({
      ...game,
      missing_parts: game.missing_parts || []
    });
  };

  const cancelEditing = () => {
    setEditingGame(null);
    setEditForm({});
    setNewPart('');
  };

  const saveGame = async () => {
    if (!editingGame) return;

    try {
      const { error } = await supabase
        .from('games')
        .update({
          asking_price: editForm.asking_price,
          for_sale: editForm.for_sale,
          sale_condition_notes: editForm.sale_condition_notes,
          missing_parts: editForm.missing_parts,
          sale_notes: editForm.sale_notes
        })
        .eq('id', editingGame);

      if (error) throw error;

      await fetchGames();
      cancelEditing();
    } catch (err) {
      console.error('Error updating game:', err);
      alert('Failed to update game');
    }
  };

  const addMissingPart = () => {
    if (!newPart.trim()) return;
    
    setEditForm({
      ...editForm,
      missing_parts: [...(editForm.missing_parts || []), newPart.trim()]
    });
    setNewPart('');
  };

  const removeMissingPart = (index: number) => {
    const parts = [...(editForm.missing_parts || [])];
    parts.splice(index, 1);
    setEditForm({
      ...editForm,
      missing_parts: parts
    });
  };

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;
      await fetchInquiries();
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <DollarSign size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Manage Game Sales
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Configure pricing and sales details for games, and manage buyer inquiries
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('games')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'games'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Games ({games.length} total)
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inquiries'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Inquiries ({inquiries.filter(i => i.status === 'pending').length} pending)
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> All games are available for sale by default. Use this interface to set specific pricing, add condition notes, or temporarily remove games from sale.
            </p>
          </div>

          {games.map(game => (
            <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              {editingGame === game.id ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {game.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveGame}
                        className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editForm.for_sale !== false} // Default to true
                          onChange={(e) => setEditForm({ ...editForm, for_sale: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Available for Sale
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Uncheck to temporarily remove from sales page
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Asking Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.asking_price || ''}
                        onChange={(e) => setEditForm({ ...editForm, asking_price: parseFloat(e.target.value) || undefined })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        placeholder="Leave empty for 'Make Offer'"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sale Condition Notes
                    </label>
                    <textarea
                      value={editForm.sale_condition_notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, sale_condition_notes: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Detailed condition information for buyers..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Missing Parts
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newPart}
                          onChange={(e) => setNewPart(e.target.value)}
                          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder="Add missing part..."
                          onKeyPress={(e) => e.key === 'Enter' && addMissingPart()}
                        />
                        <button
                          onClick={addMissingPart}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {(editForm.missing_parts || []).map((part, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <span className="text-sm">{part}</span>
                            <button
                              onClick={() => removeMissingPart(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Sale Notes
                    </label>
                    <textarea
                      value={editForm.sale_notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, sale_notes: e.target.value })}
                      rows={2}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Any additional information for buyers..."
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {game.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p>{game.type} • {game.location} • {game.status}</p>
                      <p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          game.for_sale !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {game.for_sale !== false ? (
                            <>
                              <Eye size={12} className="mr-1" />
                              For Sale
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} className="mr-1" />
                              Not For Sale
                            </>
                          )}
                        </span>
                        {game.for_sale !== false && (
                          <span className="ml-2 font-medium">
                            {game.asking_price ? `$${game.asking_price.toLocaleString()}` : 'Make Offer'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startEditing(game)}
                    className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.map(inquiry => (
            <div key={inquiry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {inquiry.game?.name || 'Unknown Game'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    From: {inquiry.buyer_name} ({inquiry.buyer_email})
                  </p>
                  {inquiry.buyer_phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Phone: {inquiry.buyer_phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
              </div>

              {inquiry.offer_amount && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Offer: ${inquiry.offer_amount.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {inquiry.message}
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Mark Responded
                </button>
                <button
                  onClick={() => updateInquiryStatus(inquiry.id, 'accepted')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateInquiryStatus(inquiry.id, 'declined')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {inquiries.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No buyer inquiries yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminGameSalesPage;