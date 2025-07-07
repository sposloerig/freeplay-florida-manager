import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  Phone,
  User,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Edit3,
  Save,
  X,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface BuyerInquiry {
  id: string;
  game_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  offer_amount?: number;
  message: string;
  status: 'pending' | 'responded' | 'accepted' | 'declined';
  manager_notes?: string;
  created_at: string;
  updated_at: string;
  game?: {
    id: string;
    name: string;
    asking_price?: number;
  };
}

const AdminBuyerInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_inquiries')
        .select(`
          *,
          game:games(
            id,
            name,
            asking_price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching buyer inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;
      await fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update inquiry status');
    }
  };

  const startEditingNotes = (inquiryId: string, currentNotes: string = '') => {
    setEditingNotes(inquiryId);
    setNoteText(currentNotes);
  };

  const cancelEditingNotes = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  const saveNotes = async (inquiryId: string) => {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .update({ manager_notes: noteText.trim() || null })
        .eq('id', inquiryId);

      if (error) throw error;
      
      setEditingNotes(null);
      setNoteText('');
      await fetchInquiries();
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setSavingNote(false);
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.buyer_email.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.game?.name?.toLowerCase().includes(search.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(search.toLowerCase()) ||
      (inquiry.manager_notes && inquiry.manager_notes.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'responded':
        return <MessageSquare size={14} />;
      case 'accepted':
        return <CheckCircle size={14} />;
      case 'declined':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const getGameUrl = (inquiry: BuyerInquiry) => {
    if (!inquiry.game?.name) return '#';
    const slug = `${inquiry.game.name}-Replay`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/game/${slug}`;
  };

  // Calculate summary stats
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const respondedCount = inquiries.filter(i => i.status === 'responded').length;
  const acceptedCount = inquiries.filter(i => i.status === 'accepted').length;
  const declinedCount = inquiries.filter(i => i.status === 'declined').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Mail size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Buyer Inquiries
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage buyer inquiries and offers for games in your collection
        </p>
        
        {/* Summary Stats */}
        <div className="flex justify-center space-x-6 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{respondedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Responded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{declinedCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Declined</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by buyer name, email, game name, message, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredInquiries.length} of {inquiries.length} inquiries
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {search || statusFilter !== 'all' ? 'No inquiries found matching your criteria' : 'No buyer inquiries yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left side - Game and buyer info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Link
                        to={getGameUrl(inquiry)}
                        className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center"
                      >
                        {inquiry.game?.name || 'Unknown Game'}
                        <ExternalLink size={16} className="ml-2" />
                      </Link>
                      {inquiry.game?.asking_price && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          (Asking: ${inquiry.game.asking_price.toLocaleString()})
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                      {getStatusIcon(inquiry.status)}
                      <span className="ml-1 capitalize">{inquiry.status}</span>
                    </span>
                  </div>

                  {/* Buyer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <User size={16} className="mr-2" />
                      <div>
                        <p className="font-medium">{inquiry.buyer_name}</p>
                        <a href={`mailto:${inquiry.buyer_email}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                          {inquiry.buyer_email}
                        </a>
                      </div>
                    </div>
                    
                    {inquiry.buyer_phone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Phone size={16} className="mr-2" />
                        <a href={`tel:${inquiry.buyer_phone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          {inquiry.buyer_phone}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar size={16} className="mr-2" />
                      <span className="text-sm">{formatDate(inquiry.created_at)}</span>
                    </div>
                    
                    {inquiry.offer_amount && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <DollarSign size={16} className="mr-2" />
                        <span className="font-bold text-green-600 dark:text-green-400">
                          Offer: ${inquiry.offer_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Message:</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                      {inquiry.message}
                    </p>
                  </div>

                  {/* Manager Notes Section */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 flex items-center">
                        <FileText size={16} className="mr-2" />
                        Private Notes (Manager Only)
                      </h4>
                      {editingNotes !== inquiry.id && (
                        <button
                          onClick={() => startEditingNotes(inquiry.id, inquiry.manager_notes)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 p-1"
                          title={inquiry.manager_notes ? "Edit notes" : "Add notes"}
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                    </div>

                    {editingNotes === inquiry.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add private notes for internal tracking..."
                          rows={3}
                          className="w-full p-2 border border-indigo-200 dark:border-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveNotes(inquiry.id)}
                            disabled={savingNote}
                            className={`flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm ${
                              savingNote ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Save size={14} className="mr-1" />
                            {savingNote ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditingNotes}
                            disabled={savingNote}
                            className="flex items-center px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                          >
                            <X size={14} className="mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-indigo-800 dark:text-indigo-200 text-sm">
                        {inquiry.manager_notes ? (
                          <p className="whitespace-pre-wrap">{inquiry.manager_notes}</p>
                        ) : (
                          <p className="text-indigo-600 dark:text-indigo-400 italic">
                            No notes added yet. Click the edit icon to add private tracking notes.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                    disabled={inquiry.status === 'responded'}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      inquiry.status === 'responded'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Mark Responded
                  </button>
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'accepted')}
                    disabled={inquiry.status === 'accepted'}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      inquiry.status === 'accepted'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateInquiryStatus(inquiry.id, 'declined')}
                    disabled={inquiry.status === 'declined'}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      inquiry.status === 'declined'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBuyerInquiriesPage;