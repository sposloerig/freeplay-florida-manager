import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertTriangle, CheckCircle, Wrench, Info, Users } from 'lucide-react';

interface PublicRepairFormProps {
  gameId: string;
  gameName?: string;
}

const PublicRepairForm: React.FC<PublicRepairFormProps> = ({ gameId, gameName }) => {
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create the repair record without authentication
      const { error: repairError } = await supabase
        .from('repairs')
        .insert({
          game_id: gameId,
          comment: comment.trim()
        });

      if (repairError) throw repairError;

      // Update game status to "In Repair" if it's currently operational
      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({ status: 'In Repair' })
        .eq('id', gameId)
        .eq('status', 'Operational'); // Only update if currently operational

      if (gameUpdateError) {
        console.warn('Could not update game status:', gameUpdateError);
        // Don't throw here as the repair was still logged successfully
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error creating repair:', err);
      setError('Failed to submit repair report. Please try again or contact staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex justify-center items-center p-3 bg-green-100 dark:bg-green-900/50 rounded-full mb-6">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Your repair report for <strong>{gameName || 'this game'}</strong> has been submitted successfully. 
            Our maintenance team will be notified and will address the issue as soon as possible.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Our maintenance team has been notified</li>
                  <li>• The game will be marked as "In Repair" if needed</li>
                  <li>• We'll work to fix the issue as quickly as possible</li>
                  <li>• The game will return to service once repaired</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/collection')}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Game Collection
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Wrench size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Report a Game Issue
        </h1>
        {gameName && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
            <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              Game: {gameName}
            </p>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-300">
          Help us keep our games in perfect condition! If you notice any issues with this game, 
          please let us know and our maintenance team will take care of it.
        </p>
      </div>

      {/* Instructions Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <div className="flex items-start">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-1" />
          <div>
            <p className="text-blue-700 dark:text-blue-300">
              Please describe the issue you're experiencing with this game. For example: 'Player 1 joystick is stuck and won't move left', 'Screen keeps flickering during gameplay', 'No sound coming from speakers', etc.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's wrong with this game? *
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Please describe the issue you're experiencing with this game. For example: 'Player 1 joystick is stuck and won't move left', 'Screen keeps flickering during gameplay', 'No sound coming from speakers', etc."
              required
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The more details you provide, the faster our team can fix the issue!
            </p>
          </div>


          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isSubmitting || !comment.trim() ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting Report...' : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicRepairForm;