import React from 'react';
import GameList from '../components/GameList';
import { TowerControl as GameController } from 'lucide-react';

const CollectionPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10 max-w-3xl mx-auto">
        <div className="flex justify-center mb-4">
          <GameController size={48} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Arcade Museum Games
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Explore our collection of classic arcade games, pinball machines, and other gaming artifacts.
          Each piece has been carefully restored and maintained for your enjoyment.
        </p>
      </div>
      
      <GameList />
    </div>
  );
};

export default CollectionPage;