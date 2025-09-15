import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Gamepad2, ExternalLink, Users, DollarSign } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { Game } from '../types';

interface GameOwner {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  displayContactPublicly: boolean;
  games: Game[];
}

const AdminContactsPage: React.FC = () => {
  const { games, loading } = useGameContext();
  const [contacts, setContacts] = useState<GameOwner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    if (games.length > 0) {
      // Group games by owner email
      const ownerMap = new Map<string, GameOwner>();
      
      games.forEach(game => {
        const email = game.ownerEmail;
        if (!ownerMap.has(email)) {
          ownerMap.set(email, {
            name: game.ownerName,
            email: game.ownerEmail,
            phone: game.ownerPhone,
            address: game.ownerAddress,
            notes: game.ownerNotes,
            displayContactPublicly: game.displayContactPublicly,
            games: []
          });
        }
        ownerMap.get(email)!.games.push(game);
      });
      
      // Convert to array and sort by name
      const contactsList = Array.from(ownerMap.values()).sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setContacts(contactsList);
    }
  }, [games]);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.includes(searchTerm));
    
    if (!matchesSearch) return false;
    
    if (statusFilter === 'all') return true;
    
    // Check if any of the owner's games match the status filter
    return contact.games.some(game => game.approvalStatus === statusFilter);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fpf-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-fpf-100 dark:bg-fpf-900/50 rounded-full mb-4">
          <Users size={32} className="text-fpf-600 dark:text-fpf-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Game Submitter Contacts
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage contact information and view games by submitter
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Contacts</option>
              <option value="approved">Has Approved Games</option>
              <option value="pending">Has Pending Games</option>
              <option value="rejected">Has Rejected Games</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="bg-fpf-50 dark:bg-fpf-900/20 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-fpf-800 dark:text-fpf-200">
              Total Contacts: {contacts.length}
            </span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Games: {games.length}
            </span>
          </div>
        </div>
      </div>

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No contacts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Game submitters will appear here once games are submitted.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredContacts.map((contact, index) => (
            <div key={contact.email} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Contact Header */}
              <div className="bg-fpf-50 dark:bg-fpf-900/20 px-6 py-4 border-b border-fpf-200 dark:border-fpf-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-fpf-600 text-white rounded-full">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {contact.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-fpf-600 hover:text-fpf-700 underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1" />
                            <a 
                              href={`tel:${contact.phone}`}
                              className="text-fpf-600 hover:text-fpf-700"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-fpf-600 dark:text-fpf-400">
                      {contact.games.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.games.length === 1 ? 'Game' : 'Games'}
                    </div>
                  </div>
                </div>
                
                {/* Additional Contact Info */}
                {(contact.address || contact.notes) && (
                  <div className="mt-3 pt-3 border-t border-fpf-200 dark:border-fpf-700">
                    {contact.address && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <MapPin size={14} className="mr-2" />
                        {contact.address}
                      </div>
                    )}
                    {contact.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Notes:</strong> {contact.notes}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Contact Visibility */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    contact.displayContactPublicly 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {contact.displayContactPublicly ? 'Public Contact' : 'Private Contact'}
                  </span>
                </div>
              </div>

              {/* Games List */}
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {contact.games.map((game) => {
                    const slug = game.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <div key={game.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                            {game.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.approvalStatus)}`}>
                            {game.approvalStatus}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Gamepad2 size={14} className="mr-2" />
                            {game.type}
                          </div>
                          
                          {game.forSale && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <DollarSign size={14} className="mr-2" />
                              {game.askingPrice ? `$${game.askingPrice.toLocaleString()}` : 'Price on request'}
                            </div>
                          )}
                          
                          {game.zone && (
                            <div className="flex items-center">
                              <MapPin size={14} className="mr-2" />
                              {game.zone}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            {new Date(game.dateAdded).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            to={`/game/${slug}`}
                            className="inline-flex items-center text-sm text-fpf-600 hover:text-fpf-700 font-medium"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactsPage;
