import React, { useState } from 'react';
import { Game } from '../types';
import { Calendar, MapPin, Trophy, Wrench, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'In Repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'Awaiting Parts':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Create URL-friendly slug from game name
  const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Use thumbnail if available, otherwise use first image
  const displayImage = game.thumbnailUrl || game.images?.[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
            <ImageOff size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Arcade Image Coming Soon
            </span>
          </div>
        )}
        <img
          src={displayImage}
          alt={game.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
            {game.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{game.name}</h3>
        <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {game.yearMade && (
            <span className="mr-3 flex items-center">
              <Calendar size={16} className="mr-1" />
              {game.yearMade}
            </span>
          )}
          <span className="flex items-center">
            <MapPin size={16} className="mr-1" />
            {game.location === 'Other' ? game.otherLocation : game.location}
          </span>
        </div>
        <div className="mt-3 flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <span className="flex items-center">
            {game.type === 'Other' ? game.otherType : game.type}
          </span>
          {game.highScore && (
            <span className="ml-auto flex items-center text-indigo-600 dark:text-indigo-400 font-semibold">
              <Trophy size={16} className="mr-1" />
              {game.highScore.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Link 
            to={`/game/${slug}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium text-sm transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameCard;