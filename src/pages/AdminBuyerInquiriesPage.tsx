import React, { useState, useEffect } from 'react';
import { Mail, Calendar, DollarSign, User, Phone, MessageSquare, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { BuyerInquiry } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AdminBuyerInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      console.log('Fetching buyer inquiries...');
      
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.email);
      
      const { data, error } = await supabase
        .from('buyer_inquiries')
        .select(`
          *,
          games (
            name,
            asking_price,
            owner_name,
            owner_email,
            owner_phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Raw buyer inquiries data:', data);
      console.log('Number of inquiries found:', data?.length || 0);

      const mappedInquiries = data.map(inquiry => ({
        id: inquiry.id,
        gameId: inquiry.game_id,
        buyerName: inquiry.buyer_name,
        buyerEmail: inquiry.buyer_email,
        buyerPhone: inquiry.buyer_phone,
        offerAmount: inquiry.offer_amount,
        message: inquiry.message,
        status: inquiry.status,
        createdAt: new Date(inquiry.created_at),
        updatedAt: new Date(inquiry.updated_at),
        game: inquiry.games ? {
          name: inquiry.games.name,
          askingPrice: inquiry.games.asking_price,
          ownerName: inquiry.games.owner_name,
          ownerEmail: inquiry.games.owner_email,
          ownerPhone: inquiry.games.owner_phone
        } : undefined
      }));

      console.log('Mapped inquiries:', mappedInquiries);
      setInquiries(mappedInquiries);
    } catch (err) {
      console.error('Error fetching buyer inquiries:', err);
      setError('Failed to load buyer inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', inquiryId);

      if (error) throw error;

      // Update local state
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === inquiryId 
          ? { ...inquiry, status: newStatus as any, updatedAt: new Date() }
          : inquiry
      ));
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      alert('Failed to update inquiry status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'responded':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredInquiries = inquiries; // Show all inquiries

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fpf-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading buyer inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Inquiries</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchInquiries}
            className="px-4 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-fpf-100 dark:bg-fpf-900/50 rounded-full mb-4">
          <Mail size={32} className="text-fpf-600 dark:text-fpf-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Buyer Inquiry Log
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          View buyer inquiries and purchase requests submitted through the marketplace
        </p>
      </div>

      {/* Simple Info */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <Mail className="w-4 h-4 mr-2 text-fpf-600" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Inquiries: {inquiries.length}
          </span>
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No inquiries found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Buyer inquiries will appear here when customers submit inquiries through the marketplace. These are logged for your records only.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(inquiry.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {inquiry.createdAt.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Inquiry #{inquiry.id.slice(0, 8)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Game Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2 text-fpf-600" />
                    Game: {inquiry.game?.name || 'Unknown Game'}
                  </h3>
                  
                  {inquiry.game && (
                    <div className="space-y-2 text-sm">
                      {inquiry.game.askingPrice && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Asking Price: ${inquiry.game.askingPrice.toLocaleString()}
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        Owner: {inquiry.game.ownerName}
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        Owner Email: 
                        <a 
                          href={`mailto:${inquiry.game.ownerEmail}`}
                          className="ml-1 text-fpf-600 hover:text-fpf-700 underline"
                        >
                          {inquiry.game.ownerEmail}
                        </a>
                      </div>
                      {inquiry.game.ownerPhone && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          Owner Phone: {inquiry.game.ownerPhone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Buyer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-fpf-600" />
                    Buyer Information
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      Name: {inquiry.buyerName}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      Email: 
                      <a 
                        href={`mailto:${inquiry.buyerEmail}`}
                        className="ml-1 text-fpf-600 hover:text-fpf-700 underline"
                      >
                        {inquiry.buyerEmail}
                      </a>
                    </div>
                    {inquiry.buyerPhone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4 mr-2" />
                        Phone: {inquiry.buyerPhone}
                      </div>
                    )}
                    {inquiry.offerAmount && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Offer: ${inquiry.offerAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message:
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm text-gray-700 dark:text-gray-300">
                  {inquiry.message}
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
