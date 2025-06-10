import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import GameQRCode from '../components/GameQRCode';
import { Search, Printer, Filter, MapPin } from 'lucide-react';

const QRCodePrintPage: React.FC = () => {
  const { games } = useGameContext();
  const [search, setSearch] = useState('');
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState<'All' | 'Replay' | 'Warehouse'>('All');

  // Add print-specific styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: letter;
          margin: 0.5in;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .qr-grid {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const toggleGameSelection = (gameId: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(gameId)) {
      newSelected.delete(gameId);
    } else {
      newSelected.add(gameId);
    }
    setSelectedGames(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set(filteredGames.map(game => game.id));
    setSelectedGames(newSelected);
  };

  const clearSelection = () => {
    setSelectedGames(new Set());
  };

  // Filter games based on search and location
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = locationFilter === 'All' || game.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  // Get games to display (either selected ones or all filtered ones if none selected)
  const displayGames = selectedGames.size > 0 
    ? filteredGames.filter(game => selectedGames.has(game.id))
    : filteredGames;

  // Count games by location
  const gameCounts = {
    All: games.length,
    Replay: games.filter(game => game.location === 'Replay').length,
    Warehouse: games.filter(game => game.location === 'Warehouse').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          QR Code Labels
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Each label is 6" × 3.25" centered on the page. Select specific games to print or print all labels.
        </p>

        <div className="space-y-4">
          {/* Location Filter Tabs */}
          <div className="flex space-x-2 mb-4">
            {(['All', 'Replay', 'Warehouse'] as const).map((location) => (
              <button
                key={location}
                onClick={() => setLocationFilter(location)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  locationFilter === location
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <MapPin size={16} className="mr-2" />
                {location}
                <span className="ml-2 text-sm">
                  ({gameCounts[location]})
                </span>
              </button>
            ))}
          </div>

          {/* Search and Print Controls */}
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
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Printer size={20} className="mr-2" />
              Print Selected
            </button>
          </div>

          {/* Game Selection Controls */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAll}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Clear Selection
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedGames.size} games selected
            </div>
          </div>

          {/* Game List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedGames.has(game.id)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => toggleGameSelection(game.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedGames.has(game.id)}
                    onChange={() => toggleGameSelection(game.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">{game.name}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {game.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Grid for Printing */}
      <div className="grid grid-cols-2 gap-8">
        {displayGames.map((game) => (
          <div
            key={game.id}
            className="qr-grid w-[6in] h-[3.25in] bg-white flex flex-col items-center justify-center text-center p-6"
            style={{
              boxSizing: 'border-box',
            }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">{game.name}</h2>
            <p className="text-base text-gray-700 mb-4 leading-tight">
              Game Not Working?<br />
              Click this QR Code and tell us!
            </p>
            <GameQRCode gameId={game.id} gameName={game.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodePrintPage;