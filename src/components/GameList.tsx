import React, { useState } from 'react';
import { GameType } from '../types';
import { useGameContext } from '../context/GameContext';
import { Link } from 'react-router-dom';
import { Search, Gamepad2, PillIcon as PinballIcon, Calendar, DollarSign, ChevronRight } from 'lucide-react';

const GameList: React.FC = () => {
  const { games } = useGameContext();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<GameType | 'All'>('All');

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || game.type === typeFilter;
    const isApproved = game.approvalStatus === 'approved';
    
    return matchesSearch && matchesType && isApproved;
  });

  // Simple alphabetical sort by name
  const sortedGames = [...filteredGames].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <div className="mb-6 space-y-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('All')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            All Games
          </button>
          <button
            onClick={() => setTypeFilter('Arcade')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'Arcade'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            Arcade
          </button>
          <button
            onClick={() => setTypeFilter('Pinball')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'Pinball'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <PinballIcon size={18} className="mr-2" />
            Pinball
          </button>
          <button
            onClick={() => setTypeFilter('Skeeball')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'Skeeball'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            Skeeball
          </button>
          <button
            onClick={() => setTypeFilter('Console')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'Console'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            Console
          </button>
          <button
            onClick={() => setTypeFilter('Other')}
            className={`flex items-center px-4 py-2 rounded-full transition-colors ${
              typeFilter === 'Other'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            Other
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No games found matching your criteria</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Game Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Zone
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedGames.map((game) => {
                  const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'Operational':
                        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                      case 'In Repair':
                        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                      case 'Awaiting Parts':
                        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                      default:
                        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                    }
                  };

                  return (
                    <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {game.name}
                              {game.forSale && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  <DollarSign size={12} className="mr-1" />
                                  FOR SALE
                                </span>
                              )}
                            </div>
                            {game.forSale && game.askingPrice && (
                              <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                ${game.askingPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {game.type === 'Other' ? game.otherType : game.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          {game.yearMade && (
                            <>
                              <Calendar size={14} className="mr-1" />
                              {game.yearMade}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(game.status)}`}>
                          {game.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {game.zone && (
                          <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {game.zone}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/game/${slug}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center"
                        >
                          View Details
                          <ChevronRight size={16} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {sortedGames.map((game) => {
              const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'Operational':
                    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                  case 'In Repair':
                    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
                  case 'Awaiting Parts':
                    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
                  default:
                    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                }
              };

              return (
                <Link
                  key={game.id}
                  to={`/game/${slug}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {game.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2 items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{game.type === 'Other' ? game.otherType : game.type}</span>
                        {game.yearMade && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {game.yearMade}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(game.status)}`}>
                      {game.status}
                    </span>
                    {game.zone && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {game.zone}
                      </span>
                    )}
                    {game.forSale && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <DollarSign size={12} className="inline mr-1" />
                        {game.askingPrice ? `$${game.askingPrice.toLocaleString()}` : 'FOR SALE'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameList;