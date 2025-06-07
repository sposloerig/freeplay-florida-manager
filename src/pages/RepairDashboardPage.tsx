import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Repair } from '../types';
import { 
  Wrench, 
  Search,
  SortAsc,
  SortDesc,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Filter,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

interface RepairWithUser extends Repair {
  resolvedByEmail?: string;
}

const RepairDashboardPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'game'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [hideResolved, setHideResolved] = useState(false);

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
          ),
          resolved_by_user:resolved_by(email)
        `)
        .order('resolved', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedRepairs: RepairWithUser[] = (data || []).map(repair => ({
        id: repair.id,
        gameId: repair.game_id,
        comment: repair.comment,
        resolved: repair.resolved || false,
        resolvedAt: repair.resolved_at,
        createdAt: repair.created_at,
        updatedAt: repair.updated_at,
        game: repair.game,
        resolvedByEmail: repair.resolved_by_user?.email
      }));

      setRepairs(transformedRepairs);
    } catch (error) {
      console.error('Error fetching repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (field: 'date' | 'game') => {
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
      return format(date, 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredAndSortedRepairs = repairs
    .filter(repair => {
      const gameName = repair.game?.name ?? '';
      const comment = repair.comment ?? '';
      
      const matchesSearch = 
        comment.toLowerCase().includes(search.toLowerCase()) ||
        gameName.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'open' && !repair.resolved) ||
        (statusFilter === 'resolved' && repair.resolved);

      const matchesResolvedFilter = !hideResolved || !repair.resolved;
      
      return matchesSearch && matchesStatus && matchesResolvedFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        const nameA = a.game?.name || '';
        const nameB = b.game?.name || '';
        return sortDirection === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
    });

  const getGameUrl = (repair: RepairWithUser) => {
    if (!repair.game?.name) return '#';
    const slug = `${repair.game.name}-Replay`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/game/${slug}`;
  };

  const openRepairsCount = repairs.filter(r => !r.resolved).length;
  const resolvedRepairsCount = repairs.filter(r => r.resolved).length;
  const visibleRepairsCount = filteredAndSortedRepairs.length;

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
        
        {/* Summary Stats */}
        <div className="flex justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{openRepairsCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Open Repairs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedRepairsCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{repairs.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
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
          
          {/* Hide Resolved Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setHideResolved(!hideResolved)}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                hideResolved
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {hideResolved ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {hideResolved ? 'Show Resolved' : 'Hide Resolved'}
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
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
              onClick={() => toggleSort('game')}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                sortBy === 'game'
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Game
              {sortBy === 'game' && (
                sortDirection === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'resolved')}
                className="w-full md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Repairs</option>
                <option value="open">Open Repairs</option>
                <option value="resolved">Resolved Repairs</option>
              </select>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {visibleRepairsCount} of {repairs.length} repairs
          {hideResolved && ` (${resolvedRepairsCount} resolved repairs hidden)`}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredAndSortedRepairs.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {search || statusFilter !== 'all' || hideResolved ? 'No repairs found matching your criteria' : 'No repairs have been logged yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedRepairs.map((repair) => (
            <Link
              key={repair.id}
              to={getGameUrl(repair)}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mr-4">
                        {repair.game?.name || 'Unknown Game'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {repair.resolved ? (
                          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <CheckCircle size={12} className="mr-1" />
                            Resolved
                          </span>
                        ) : (
                          <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            <AlertTriangle size={12} className="mr-1" />
                            Open
                          </span>
                        )}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(repair.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-md p-3 ${
                      repair.resolved 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {repair.comment}
                      </p>
                    </div>
                    {repair.resolved && (
                      <div className="mt-2 space-y-1">
                        {repair.resolvedAt && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            Resolved: {formatDate(repair.resolvedAt)}
                          </div>
                        )}
                        {repair.resolvedByEmail && (
                          <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                            <User size={14} className="mr-1" />
                            Resolved by: {repair.resolvedByEmail}
                          </div>
                        )}
                      </div>
                    )}
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