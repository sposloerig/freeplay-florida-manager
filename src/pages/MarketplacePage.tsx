import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { Game } from '../types';
import { DollarSign, Mail, Phone, MapPin, Calendar, Gamepad2, AlertTriangle, Search, ExternalLink } from 'lucide-react';

const MarketplacePage: React.FC = () => {
  const { games: allGames, loading, error } = useGameContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter games that are approved and for sale
  const games = allGames.filter(game => 
    game.approvalStatus === 'approved' && game.forSale
  );

  const handleInquiry = async (game: Game) => {
    // For now, just open email client
    const subject = encodeURIComponent(`Inquiry about ${game.name}`);
    const body = encodeURIComponent(`Hi ${game.ownerName},\n\nI'm interested in your ${game.name} that's listed for sale on Free Play Florida. Could you provide more details?\n\nThanks!`);
    window.location.href = `mailto:${game.ownerEmail}?subject=${subject}&body=${body}`;
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || game.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Free Play Florida Marketplace
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Browse arcade and pinball machines for sale from our community members.
          All games have been approved for our events and are owned by fellow enthusiasts.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search games or owners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="Arcade">Arcade</option>
              <option value="Pinball">Pinball</option>
              <option value="Skeeball">Skeeball</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || typeFilter !== 'all' ? 'No games match your search' : 'No games for sale'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'Check back later for new listings from our community members'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            // Create URL-friendly slug from game name only (single location event)
            const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            return (
              <div key={game.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Game Image */}
                <div className="relative h-48 bg-gradient-to-br from-fpf-500 to-fpf-purple-600 flex items-center justify-center">
                  {game.images && game.images.length > 0 ? (
                    <img
                      src={game.images[0]}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gamepad2 className="w-16 h-16 text-white opacity-50" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      For Sale
                    </span>
                  </div>
                </div>

              <div className="p-6">
                {/* Game Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {game.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <Gamepad2 className="w-4 h-4 mr-1" />
                    <span>{game.type}</span>
                    {game.yearMade && (
                      <>
                        <Calendar className="w-4 h-4 ml-3 mr-1" />
                        <span>{game.yearMade}</span>
                      </>
                    )}
                  </div>
                  {game.conditionNotes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {game.conditionNotes}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-1" />
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {game.askingPrice ? `$${game.askingPrice.toLocaleString()}` : 'Price on request'}
                      </span>
                    </div>
                    {game.acceptOffers && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Accepts Offers
                      </span>
                    )}
                  </div>
                  {game.saleConditionNotes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      <strong>Condition:</strong> {game.saleConditionNotes}
                    </p>
                  )}
                </div>

                {/* Owner Info */}
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center mb-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>Owner: {game.ownerName}</span>
                  </div>
                  {game.displayContactPublicly && (
                    <div className="mt-2 space-y-1">
                      {game.ownerEmail && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <a 
                            href={`mailto:${game.ownerEmail}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {game.ownerEmail}
                          </a>
                        </div>
                      )}
                      {game.ownerPhone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          <a 
                            href={`tel:${game.ownerPhone}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {game.ownerPhone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {game.ownerAddress && (
                    <div className="flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1 opacity-0" />
                      <span className="text-xs">{game.ownerAddress}</span>
                    </div>
                  )}
                </div>

                {/* Sale Notes */}
                {game.saleNotes && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Notes:</strong> {game.saleNotes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    to={`/game/${slug}`}
                    className="flex-1 bg-fpf-600 text-white py-2 px-4 rounded-md hover:bg-fpf-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                  <button
                    onClick={() => handleInquiry(game)}
                    className="flex-1 bg-fpf-purple-600 text-white py-2 px-4 rounded-md hover:bg-fpf-purple-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Owner
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          How the Marketplace Works
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• All games listed here are owned by Free Play Florida community members</p>
          <p>• Games have been approved for our events and are in working condition</p>
          <p>• Contact owners directly to negotiate prices and arrange viewings</p>
          <p>• Free Play Florida facilitates connections but is not involved in transactions</p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;