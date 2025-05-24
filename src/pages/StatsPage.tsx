import React, { useMemo } from 'react';
import { useGameContext } from '../context/GameContext';
import { BarChart, CheckCircle, AlertCircle, Clock, TowerControl as GameController, Award, Trophy } from 'lucide-react';

const StatsPage: React.FC = () => {
  const { games } = useGameContext();
  
  const stats = useMemo(() => {
    // Count by type
    const typeCount = games.reduce((acc, game) => {
      const type = game.type === 'Other' ? game.otherType || 'Other' : game.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count by location
    const locationCount = games.reduce((acc, game) => {
      const location = game.location === 'Other' ? game.otherLocation || 'Other' : game.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count by status
    const statusCount = games.reduce((acc, game) => {
      acc[game.status] = (acc[game.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count by decade
    const decadeCount = games.reduce((acc, game) => {
      if (game.yearMade) {
        const decade = Math.floor(game.yearMade / 10) * 10;
        acc[`${decade}s`] = (acc[`${decade}s`] || 0) + 1;
      } else {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Get oldest and newest games
    let oldestGame = games[0];
    let newestGame = games[0];
    
    games.forEach(game => {
      if (game.yearMade && (!oldestGame.yearMade || game.yearMade < oldestGame.yearMade)) {
        oldestGame = game;
      }
      if (game.yearMade && (!newestGame.yearMade || game.yearMade > newestGame.yearMade)) {
        newestGame = game;
      }
    });
    
    // Get game with highest score
    const highScoreGame = games.reduce((highest, game) => {
      if (game.highScore && (!highest || !highest.highScore || game.highScore > highest.highScore)) {
        return game;
      }
      return highest;
    }, null as any);
    
    return {
      total: games.length,
      typeCount,
      locationCount,
      statusCount,
      decadeCount,
      oldestGame,
      newestGame,
      highScoreGame,
      operational: statusCount['Operational'] || 0,
      inRepair: statusCount['In Repair'] || 0,
      awaitingParts: statusCount['Awaiting Parts'] || 0,
    };
  }, [games]);
  
  // Function to get the highest number in a count object
  const getMaxCount = (countObj: Record<string, number>) => {
    return Math.max(...Object.values(countObj), 0);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <BarChart size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Collection Statistics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explore the metrics and data about our arcade game collection.
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
            <GameController size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Games</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
            <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Operational</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.operational} <span className="text-sm font-normal text-gray-500">({Math.round((stats.operational / stats.total) * 100)}%)</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
            <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">In Repair</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.inRepair} <span className="text-sm font-normal text-gray-500">({Math.round((stats.inRepair / stats.total) * 100)}%)</span>
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
            <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Awaiting Parts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.awaitingParts} <span className="text-sm font-normal text-gray-500">({Math.round((stats.awaitingParts / stats.total) * 100)}%)</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribution by Type</h2>
          <div className="space-y-4">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">{type}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count} games</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / getMaxCount(stats.typeCount)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Distribution by Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribution by Location</h2>
          <div className="space-y-4">
            {Object.entries(stats.locationCount).map(([location, count]) => (
              <div key={location}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">{location}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count} games</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / getMaxCount(stats.locationCount)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Distribution by Decade */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Games by Decade</h2>
          <div className="space-y-4">
            {Object.entries(stats.decadeCount)
              .sort((a, b) => {
                if (a[0] === 'Unknown') return 1;
                if (b[0] === 'Unknown') return -1;
                return a[0].localeCompare(b[0]);
              })
              .map(([decade, count]) => (
                <div key={decade}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">{decade}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count} games</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / getMaxCount(stats.decadeCount)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Notable Games */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notable Games</h2>
          
          <div className="space-y-6">
            {stats.oldestGame && stats.oldestGame.yearMade && (
              <div className="flex">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mr-4 h-fit">
                  <Award size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Oldest Game</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {stats.oldestGame.name} ({stats.oldestGame.yearMade})
                  </p>
                </div>
              </div>
            )}
            
            {stats.newestGame && stats.newestGame.yearMade && (
              <div className="flex">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mr-4 h-fit">
                  <Award size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Newest Game</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {stats.newestGame.name} ({stats.newestGame.yearMade})
                  </p>
                </div>
              </div>
            )}
            
            {stats.highScoreGame && stats.highScoreGame.highScore && (
              <div className="flex">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-full mr-4 h-fit">
                  <Trophy size={20} className="text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Highest Score</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {stats.highScoreGame.name}: {stats.highScoreGame.highScore.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;