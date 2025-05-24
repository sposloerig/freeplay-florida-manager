import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { RepairStatus, RepairPriority } from '../types';
import { AlertTriangle } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface RepairFormProps {
  gameId: string;
}

const RepairForm: React.FC<RepairFormProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    status: 'Open' as RepairStatus,
    priority: 'Medium' as RepairPriority,
    estimatedCompletionDate: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: repair, error: repairError } = await supabase
        .from('repairs')
        .insert({
          game_id: gameId,
          request_description: formData.description,
          status: formData.status,
          priority: formData.priority,
          estimated_completion_date: formData.estimatedCompletionDate || null,
          logged_by: user.id
        })
        .select()
        .single();

      if (repairError) throw repairError;

      // Update game status
      const { error: gameUpdateError } = await supabase
        .from('games')
        .update({ status: 'In Repair' })
        .eq('id', gameId);

      if (gameUpdateError) throw gameUpdateError;

      // Create URL-friendly slug from game name
      const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Issue Description*
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Describe the issue that needs repair..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status*
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as RepairStatus })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Waiting for Parts">Waiting for Parts</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority*
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as RepairPriority })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="estimatedCompletionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Estimated Completion Date
        </label>
        <input
          type="date"
          id="estimatedCompletionDate"
          value={formData.estimatedCompletionDate}
          onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
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
          disabled={isSubmitting}
          className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Log Repair'}
        </button>
      </div>
    </form>
  );
};

export default RepairForm;