import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

interface RepairFormProps {
  gameId: string;
}

const RepairForm: React.FC<RepairFormProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      if (!user) throw new Error('Not authenticated');

      // First get the game to ensure it exists
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('name')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw new Error('Game not found');
      }

      // Create the repair record
      console.log('Attempting to create repair for gameId:', gameId);
      const { data: repair, error: repairError } = await supabase
        .from('repairs')
        .insert({
          game_id: gameId,
          comment: comment.trim()
        })
        .select()
        .single();

      console.log('Repair creation result:', { repair, repairError });
      if (repairError) throw repairError;

      // Update game status to "In Repair"
      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({ status: 'In Repair' })
        .eq('id', gameId);

      if (gameUpdateError) throw gameUpdateError;

      // Create URL-friendly slug from game name (simplified for Free Play Florida)
      const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Navigating to:', `/game/${slug}`);
      navigate(`/game/${slug}`);
    } catch (err) {
      console.error('Error creating repair:', err);
      setError('Failed to create repair. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center">
          <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Repair Comment *
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Describe the issue or repair needed for this game..."
          required
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Please provide details about what needs to be repaired or any issues you've noticed.
        </p>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isSubmitting || !comment.trim() ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Log Repair'}
        </button>
      </div>
    </form>
  );
};

export default RepairForm;