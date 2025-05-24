import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import RepairForm from '../components/RepairForm';
import { Wrench } from 'lucide-react';

const AddRepairPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    navigate('/');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Wrench size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Log New Repair
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <RepairForm gameId={gameId} />
      </div>
    </div>
  );
};

export default AddRepairPage;