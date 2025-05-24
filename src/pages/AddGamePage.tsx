import React from 'react';
import GameForm from '../components/GameForm';

const AddGamePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Add a New Arcade Game
      </h1>
      <GameForm />
    </div>
  );
};

export default AddGamePage;