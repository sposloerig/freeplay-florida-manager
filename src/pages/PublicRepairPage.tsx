import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PublicRepairForm from '../components/PublicRepairForm';
import { AlertTriangle } from 'lucide-react';

const PublicRepairPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gameId = searchParams.get('gameId');
  const [gameName, setGameName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setError('Game ID is missing');
      setLoading(false);
      return;
    }

    fetchGameName();
  }, [gameId]);

  const fetchGameName = async () => {
    if (!gameId) return;

    try {
      const { data, error } = await supabase
        .from('games')
        .select('name')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      
      if (data) {
        setGameName(data.name);
      } else {
        setError('Game not found');
      }
    } catch (err) {
      console.error('Error fetching game:', err);
      setError('Game not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !gameId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Unable to Load Game
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {error || 'The game ID is missing or invalid.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  return <PublicRepairForm gameId={gameId} gameName={gameName} />;
};

export default PublicRepairPage;