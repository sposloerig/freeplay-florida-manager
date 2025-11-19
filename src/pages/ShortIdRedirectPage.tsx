import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

const ShortIdRedirectPage: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lookupAndRedirect = async () => {
      if (!shortId) {
        setError('Invalid QR code');
        return;
      }

      try {
        // Look up game by short_id
        const { data, error: queryError } = await supabase
          .from('games')
          .select('id')
          .eq('short_id', shortId.toUpperCase())
          .single();

        if (queryError || !data) {
          console.error('Game not found:', queryError);
          setError('Game not found');
          return;
        }

        // Redirect to the full report-issue page
        navigate(`/report-issue?gameId=${data.id}`, { replace: true });
      } catch (err) {
        console.error('Error looking up game:', err);
        setError('Unable to find game');
      }
    };

    lookupAndRedirect();
  }, [shortId, navigate]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Game Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {error}. This QR code may be invalid or the game may have been removed.
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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading game...</p>
      </div>
    </div>
  );
};

export default ShortIdRedirectPage;

