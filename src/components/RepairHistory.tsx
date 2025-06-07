import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Repair } from '../types';
import { Wrench, Plus, Trash2, Calendar, AlertTriangle, MessageSquare } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

interface RepairHistoryProps {
  gameId: string;
  repairs: Repair[];
  onAddRepair: () => void;
}

const RepairHistory: React.FC<RepairHistoryProps> = ({ gameId, repairs, onAddRepair }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const handleDelete = async (repairId: string) => {
    try {
      const { error } = await supabase
        .from('repairs')
        .delete()
        .eq('id', repairId);

      if (error) throw error;
      window.location.reload();
    } catch (err) {
      console.error('Error deleting repair:', err);
      alert('Failed to delete repair. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Wrench className="mr-2" size={20} />
          Repair History
        </h2>
        <button
          onClick={onAddRepair}
          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Log Repair
        </button>
      </div>

      {repairs.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <MessageSquare size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No repairs have been logged for this game yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {repairs.map((repair) => (
            <div
              key={repair.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Calendar size={14} className="mr-1" />
                    <span>Logged: {formatDate(repair.createdAt)}</span>
                    {repair.createdAt !== repair.updatedAt && (
                      <span className="ml-4">
                        Updated: {formatDate(repair.updatedAt)}
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {repair.comment}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteConfirm(repair.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete repair"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Repair Record
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this repair record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm) handleDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairHistory;