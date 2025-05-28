import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Repair, RepairStatus, Part } from '../types';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Trash2, 
  PenTool as Tool 
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface RepairHistoryProps {
  gameId: string;
  repairs: Repair[];
  onAddRepair: () => void;
}

const RepairHistory: React.FC<RepairHistoryProps> = ({ gameId, repairs, onAddRepair }) => {
  const [expandedRepairs, setExpandedRepairs] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleRepair = (repairId: string) => {
    setExpandedRepairs(prev => 
      prev.includes(repairId)
        ? prev.filter(id => id !== repairId)
        : [...prev, repairId]
    );
  };

  const getStatusIcon = (status: RepairStatus) => {
    switch (status) {
      case 'Open':
        return <AlertTriangle className="text-red-500" size={18} />;
      case 'In Progress':
        return <Clock className="text-yellow-500" size={18} />;
      case 'Completed':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'On Hold':
        return <Clock className="text-orange-500" size={18} />;
      case 'Waiting for Parts':
        return <Clock className="text-purple-500" size={18} />;
      default:
        return <Clock className="text-gray-500" size={18} />;
    }
  };

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'On Hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Waiting for Parts':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const calculateTotalCost = (parts: Part[]) => {
    return parts.reduce((total, part) => total + (part.estimatedCost ?? 0), 0);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
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

  const getPartStatusColor = (status: string) => {
    switch (status) {
      case 'Needed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Ordered':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Received':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Installed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
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
          <Tool size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No repairs have been logged for this game yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {repairs.map((repair) => (
            <div
              key={repair.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleRepair(repair.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(repair.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {repair.requestDescription}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          Created: {formatDate(repair.createdAt)}
                        </span>
                        {repair.repairStartDate && (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Started: {formatDate(repair.repairStartDate)}
                          </span>
                        )}
                        {repair.estimatedCompletionDate && (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Est. Completion: {formatDate(repair.estimatedCompletionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(repair.status)}`}>
                      {repair.status}
                    </span>
                    {repair.priority && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        repair.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        repair.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                        repair.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {repair.priority}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(repair.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete repair"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedRepairs.includes(repair.id) ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedRepairs.includes(repair.id) && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                  {repair.repairNotes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Repair Notes
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {repair.repairNotes}
                      </p>
                    </div>
                  )}

                  {repair.parts && repair.parts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Parts
                      </h4>
                      <div className="space-y-2">
                        {repair.parts.map((part) => (
                          <div 
                            key={part.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {part.name}
                              </p>
                              {part.vendor && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Vendor: {part.vendor.name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPartStatusColor(part.status)}`}>
                                {part.status}
                              </span>
                              <span className="flex items-center text-gray-900 dark:text-white font-medium">
                                <DollarSign size={14} className="mr-1" />
                                {part.estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Cost: ${calculateTotalCost(repair.parts).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {repair.imageUrl && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Repair Documentation
                      </h4>
                      <img
                        src={repair.imageUrl}
                        alt="Repair documentation"
                        className="rounded-md max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
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
                  handleDelete(deleteConfirm);
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