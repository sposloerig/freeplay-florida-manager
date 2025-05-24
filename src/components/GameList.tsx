import React, { useState } from 'react';
import { GameType, GameLocation, GameStatus } from '../types';
import { useGameContext } from '../context/GameContext';
import GameCard from './GameCard';
import { Filter, Search, SortAsc, SortDesc, Gamepad2, PillIcon as PinballIcon } from 'lucide-react';

const GameList: React.FC = () => {
  const { games } = useGameContext();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<GameType | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState<GameLocation>('Replay');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'yearMade' | 'dateAdded'>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showWarehouse, setShowWarehouse] = useState(false);

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || game.type === typeFilter;
    const matchesLocation = showWarehouse ? true : game.location === locationFilter;
    const matchesStatus = statusFilter === 'All' || game.status === statusFilter;
    
    return matchesSearch && matchesType && matchesLocation && matchesStatus;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'yearMade') {
      const yearA = a.yearMade || 0;
      const yearB = b.yearMade || 0;
      return sortDirection === 'asc' ? yearA - yearB : yearB - yearA;
    } else {
      return sortDirection === 'asc'
        ? new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        : new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    }
  });

  const toggleSort = (field: 'name' | 'yearMade' | 'dateAdded') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 space-y-4">
        {/* Quick Type Filters */}
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
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showWarehouse}
                onChange={(e) => setShowWarehouse(e.target.checked)}
                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Warehouse</span>
            </label>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter size={16} className="mr-2" />
              More Filters
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => toggleSort('name')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  sortBy === 'name'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Name
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
                )}
              </button>
              <button
                onClick={() => toggleSort('yearMade')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  sortBy === 'yearMade'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Year
                {sortBy === 'yearMade' && (
                  sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as GameStatus | 'All')}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="In Repair">In Repair</option>
                <option value="Awaiting Parts">Awaiting Parts</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredGames.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No games found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameList;