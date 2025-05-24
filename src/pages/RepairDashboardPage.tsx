import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { Repair, RepairStatus } from '../types';
import { 
  Wrench, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Filter,
  Search,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const RepairDashboardPage: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select(`
          *,
          game:games(
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRepairs(data || []);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
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

  const toggleSort = (field: 'date' | 'status') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredAndSortedRepairs = repairs
    .filter(repair => {
      const gameName = repair.game?.name ?? '';
      const requestDescription = repair.requestDescription ?? '';
      
      const matchesSearch = 
        requestDescription.toLowerCase().includes(search.toLowerCase()) ||
        gameName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || repair.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
    });

  const getGameUrl = (repair: Repair) => {
    if (!repair.game?.name) return '#';
    const slug = repair.game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/game/${slug}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Wrench size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Repair Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Track and manage all arcade game repairs in one place.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search repairs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:ml-auto flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Filter size={16} className="mr-2" />
          Filters
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleSort('date')}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              sortBy === 'date'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Date
            {sortBy === 'date' && (
              sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
            )}
          </button>
          <button
            onClick={() => toggleSort('status')}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              sortBy === 'status'
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Status
            {sortBy === 'status' && (
              sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
            )}
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'All')}
              className="w-full md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Waiting for Parts">Waiting for Parts</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredAndSortedRepairs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No repairs found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedRepairs.map((repair) => (
            <Link
              key={repair.id}
              to={getGameUrl(repair)}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(repair.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {repair.game?.name || 'Unknown Game'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {repair.requestDescription}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(repair.status)}`}>
                      {repair.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(repair.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepairDashboardPage;