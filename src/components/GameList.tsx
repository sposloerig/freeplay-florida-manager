import React, { useState } from 'react';
import { GameType } from '../types';
import { useGameContext } from '../context/GameContext';
import GameCard from './GameCard';
import { Search, Gamepad2, PillIcon as PinballIcon } from 'lucide-react';

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
                ? 'bg-fpf-600 text-white'
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
                ? 'bg-fpf-600 text-white'
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
                ? 'bg-fpf-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Gamepad2 size={18} className="mr-2" />
            Arcade
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
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

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