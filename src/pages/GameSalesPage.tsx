import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { DollarSign, Search, Filter, MapPin, Calendar, AlertTriangle, MessageSquare, Phone, Mail, Tag, ShoppingCart, Info } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GameForSale {
  id: string;
  name: string;
  type: string;
  type_other?: string;
  location: string;
  location_other?: string;
  status: string;
  asking_price?: number;
  for_sale: boolean;
  sale_condition_notes?: string;
  missing_parts?: string[];
  sale_notes?: string;
  image_url?: string;
  thumbnail_url?: string;
  created_at: string;
  condition_notes?: string;
}

interface BuyerInquiry {
  game_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  offer_amount?: number;
  message: string;
}

const GameSalesPage: React.FC = () => {
  const [games, setGames] = useState<GameForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameForSale | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryType, setInquiryType] = useState<'purchase' | 'offer'>('offer');
  const [inquiryForm, setInquiryForm] = useState<BuyerInquiry>({
    game_id: '',
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    offer_amount: undefined,
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      // Fetch all games since they're all for sale by default now
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('name');

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games for sale');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (game: GameForSale) => {
    setSelectedGame(game);
    setInquiryType('purchase');
    setInquiryForm({
      game_id: game.id,
      buyer_name: '',
      buyer_email: '',
      buyer_phone: '',
      offer_amount: game.asking_price, // Set to asking price for purchase
      message: `I would like to purchase ${game.name} at the full asking price of $${game.asking_price?.toLocaleString()}.`
    });
    setShowInquiryForm(true);
  };

  const handleMakeOffer = (game: GameForSale) => {
    setSelectedGame(game);
    setInquiryType('offer');
    setInquiryForm({
      game_id: game.id,
      buyer_name: '',
      buyer_email: '',
      buyer_phone: '',
      offer_amount: undefined,
      message: ''
    });
    setShowInquiryForm(true);
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .insert([inquiryForm]);

      if (error) throw error;

      const actionText = inquiryType === 'purchase' ? 'purchase request' : 'offer';
      alert(`Your ${actionText} has been submitted successfully! We will contact you soon.`);
      setShowInquiryForm(false);
      setSelectedGame(null);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || game.type === typeFilter || 
                       (game.type === 'Other' && game.type_other === typeFilter);
    const matchesLocation = locationFilter === 'All' || game.location === locationFilter ||
                           (game.location === 'Other' && game.location_other === locationFilter);
    
    let matchesPrice = true;
    if (priceFilter !== 'All') {
      if (priceFilter === 'NFS') {
        matchesPrice = !game.asking_price;
      } else if (priceFilter === 'Under $500') {
        matchesPrice = game.asking_price && game.asking_price < 500;
      } else if (priceFilter === '$500-$1000') {
        matchesPrice = game.asking_price && game.asking_price >= 500 && game.asking_price <= 1000;
      } else if (priceFilter === 'Over $1000') {
        matchesPrice = game.asking_price && game.asking_price > 1000;
      }
    }

    return matchesSearch && matchesType && matchesLocation && matchesPrice;
  });

  const getUniqueTypes = () => {
    const types = new Set<string>();
    games.forEach(game => {
      if (game.type === 'Other' && game.type_other) {
        types.add(game.type_other);
      } else {
        types.add(game.type);
      }
    });
    return Array.from(types).sort();
  };

  const getUniqueLocations = () => {
    const locations = new Set<string>();
    games.forEach(game => {
      if (game.location === 'Other' && game.location_other) {
        locations.add(game.location_other);
      } else {
        locations.add(game.location);
      }
    });
    return Array.from(locations).sort();
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Make Offer';
    return `$${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'In Repair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Awaiting Parts':
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
          Games For Sale
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Browse our collection of arcade and pinball machines available for purchase. All games in our collection are potentially available for sale.
        </p>
      </div>

      {/* Important Disclaimer */}
      <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Important Notice
            </h3>
            <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
              All purchase offers and sale listings are subject to acceptance at the sole discretion of Replay Museum. 
              While we showcase our collection for collectors to review and potentially purchase, we reserve the right 
              to decline any offer or remove any item from sale at any time. This listing serves as a casual catalog 
              for interested collectors and does not constitute a binding commitment to sell.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="All">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="All">All Locations</option>
                {getUniqueLocations().map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Range
              </label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="All">All Prices</option>
                <option value="NFS">Make Offer Only</option>
                <option value="Under $500">Under $500</option>
                <option value="$500-$1000">$500 - $1,000</option>
                <option value="Over $1000">Over $1,000</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
          <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
              {game.thumbnail_url || game.image_url ? (
                <img
                  src={game.thumbnail_url || game.image_url}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(game.status)}`}>
                  {game.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {game.name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <Tag size={14} className="mr-2" />
                  {game.type === 'Other' ? game.type_other : game.type}
                </div>
                <div className="flex items-center">
                  <MapPin size={14} className="mr-2" />
                  {game.location === 'Other' ? game.location_other : game.location}
                </div>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  Added {new Date(game.created_at).toLocaleDateString()}
                </div>
              </div>

              {game.sale_condition_notes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Condition Notes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {game.sale_condition_notes}
                  </p>
                </div>
              )}

              {game.missing_parts && game.missing_parts.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Missing Parts
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    {game.missing_parts.map((part, index) => (
                      <li key={index}>{part}</li>
                    ))}
                  </ul>
                </div>
              )}

              {game.sale_notes && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Additional Notes
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {game.sale_notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(game.asking_price)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {game.asking_price ? (
                    <>
                      <button
                        onClick={() => handlePurchase(game)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Purchase (${game.asking_price.toLocaleString()})
                      </button>
                      <button
                        onClick={() => handleMakeOffer(game)}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      >
                        <MessageSquare size={16} className="mr-2" />
                        Make Offer
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleMakeOffer(game)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Make Offer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No games found matching your criteria.
          </p>
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiryForm && selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {inquiryType === 'purchase' ? 'Purchase Request' : 'Make Offer'} for {selectedGame.name}
            </h3>

            {/* Modal Disclaimer */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  All offers are subject to acceptance at Replay Museum's discretion. 
                  We reserve the right to decline any offer or remove items from sale.
                </p>
              </div>
            </div>

            {inquiryType === 'purchase' && selectedGame.asking_price && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Purchase Price:</strong> ${selectedGame.asking_price.toLocaleString()}
                </p>
              </div>
            )}

            <form onSubmit={submitInquiry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={inquiryForm.buyer_name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, buyer_name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={inquiryForm.buyer_email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, buyer_email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={inquiryForm.buyer_phone}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, buyer_phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              {inquiryType === 'offer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Offer Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={inquiryForm.offer_amount || ''}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, offer_amount: parseFloat(e.target.value) || undefined })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder={selectedGame.asking_price ? `Asking: $${selectedGame.asking_price}` : 'Your offer'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder={inquiryType === 'purchase' 
                    ? "Confirm your purchase request and provide any additional details..."
                    : "Tell us about your offer and interest in this game..."
                  }
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInquiryForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                    inquiryType === 'purchase' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {submitting ? 'Sending...' : inquiryType === 'purchase' ? 'Submit Purchase Request' : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSalesPage;