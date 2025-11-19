import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TowerControl as GameController, Wrench, Calendar, HelpCircle, ShoppingBag, Plus, Settings, Users, Trophy, Gift, Tag, DollarSign, Key, QrCode, Clock, MessageSquare, Mail, CheckCircle, Download } from 'lucide-react';
import { useGameContext } from '../context/GameContext';

const AdminDashboardPage: React.FC = () => {
  const { games } = useGameContext();
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = () => {
    setExporting(true);
    
    try {
      // Define CSV headers
      const headers = [
        'ID',
        'Name',
        'Type',
        'Type Other',
        'Status',
        'Zone',
        'Year Made',
        'High Score',
        'Condition Notes',
        'Approval Status',
        'Owner Name',
        'Owner Email',
        'Owner Phone',
        'Owner Address',
        'Allow Others To Service',
        'Service Notes',
        'For Sale',
        'Asking Price',
        'Accept Offers',
        'Sale Condition Notes',
        'Sale Notes',
        'Checked In',
        'Has Key',
        'Working Condition',
        'Date Added',
        'Last Updated'
      ];

      // Convert games to CSV rows
      const rows = games.map(game => [
        game.id,
        `"${game.name.replace(/"/g, '""')}"`, // Escape quotes
        game.type,
        game.otherType || '',
        game.status,
        game.zone || '',
        game.yearMade || '',
        game.highScore || '',
        game.conditionNotes ? `"${game.conditionNotes.replace(/"/g, '""')}"` : '',
        game.approvalStatus,
        game.ownerName ? `"${game.ownerName.replace(/"/g, '""')}"` : '',
        game.ownerEmail || '',
        game.ownerPhone || '',
        game.ownerAddress ? `"${game.ownerAddress.replace(/"/g, '""')}"` : '',
        game.allowOthersToService ? 'Yes' : 'No',
        game.serviceNotes ? `"${game.serviceNotes.replace(/"/g, '""')}"` : '',
        game.forSale ? 'Yes' : 'No',
        game.askingPrice || '',
        game.acceptOffers ? 'Yes' : 'No',
        game.saleConditionNotes ? `"${game.saleConditionNotes.replace(/"/g, '""')}"` : '',
        game.saleNotes ? `"${game.saleNotes.replace(/"/g, '""')}"` : '',
        game.checkedIn ? 'Yes' : 'No',
        game.hasKey ? 'Yes' : 'No',
        game.workingCondition ? 'Yes' : 'No',
        game.dateAdded ? new Date(game.dateAdded).toISOString() : '',
        game.lastUpdated ? new Date(game.lastUpdated).toISOString() : ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `freeplay-games-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message briefly
      setTimeout(() => setExporting(false), 1000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
      setExporting(false);
    }
  };

const AdminDashboardPage: React.FC = () => {
  const adminFeatures = [
    {
      title: 'Game Management',
      icon: GameController,
      description: 'Approve submitted games, add new games, and manage the collection. Track game status and handle game-related tasks.',
      links: [
        { to: '/admin/game-approval', text: 'Approve Submitted Games', icon: Clock },
        { to: '/admin/check-in', text: 'Game Check-In', icon: CheckCircle },
        { to: '/add', text: 'Add New Game', icon: Plus },
        { to: '/collection', text: 'View & Edit Collection', icon: GameController },
        { to: '/qr-codes', text: 'Print QR Codes', icon: QrCode }
      ]
    },
    {
      title: 'Repair Tracking',
      icon: Wrench,
      description: 'Manage repair requests, track maintenance history, and coordinate with game owners. (Coming Soon)',
      links: [
        { to: '/repairs', text: 'Repair Dashboard', icon: Wrench }
      ]
    },
    {
      title: 'Sales Management',
      icon: DollarSign,
      description: 'View buyer inquiry logs and access the public Marketplace. Inquiries are recorded for your reference only.',
      links: [
        { to: '/admin/buyer-inquiries', text: 'View Buyer Inquiries', icon: Mail },
        { to: '/marketplace', text: 'View Public Marketplace', icon: Tag }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Settings size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Manage all aspects of the Replay Museum from this central hub
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mr-4">
                <feature.icon size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {feature.title}
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
              {feature.description}
            </p>
            
            <div className="space-y-2">
              {feature.links.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  to={link.to}
                  className="flex items-center w-full px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                >
                  <link.icon size={16} className="mr-2" />
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Export Section */}
      <div className="mt-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            <Download className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Export Game Data
              </h3>
              <p className="text-green-800 dark:text-green-200 text-sm">
                Download all game data as CSV for backup, analysis, or external use. Includes all game details, owner info, sales data, and check-in status.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className={`ml-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm ${
              exporting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Download size={18} className="mr-2" />
            {exporting ? 'Exporting...' : `Export ${games.length} Games`}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Quick Tips
            </h3>
            <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed space-y-2">
              <p>• <strong>Game Management:</strong> Use "View & Edit Collection" to manage both regular game details and sales information in one place</p>
              <p>• <strong>Sales Features:</strong> When editing a game, expand the "Sales Management" section to set pricing and view buyer inquiries</p>
              <p>• <strong>Quick Access:</strong> All admin functions are accessible through this dashboard for easy navigation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;