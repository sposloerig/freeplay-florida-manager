import React from 'react';
import { useParams } from 'react-router-dom';
import GameForm from '../components/GameForm';

const EditGamePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Edit Arcade Game
      </h1>
      <GameForm editMode={true} gameId={id} />
    </div>
  );
};

export default EditGamePage;