import React from 'react';
import { Link } from 'react-router-dom';
import { TowerControl as GameController, Wrench, Calendar, HelpCircle, ShoppingBag, Plus, Settings, Users, Trophy, Gift, Tag, DollarSign, Key, QrCode, Clock, MessageSquare, Mail } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const adminFeatures = [
    {
      title: 'Game Management',
      icon: GameController,
      description: 'Add, edit, or remove arcade and pinball machines from the collection. Track game status, location, maintenance history, manage sales pricing, and handle buyer inquiries.',
      links: [
        { to: '/admin/game-approval', text: 'Approve Submitted Games', icon: Clock },
        { to: '/add', text: 'Add New Game', icon: Plus },
        { to: '/collection', text: 'View & Edit Collection', icon: GameController },
        { to: '/games-for-sale', text: 'View Sales Page', icon: Tag },
        { to: '/qr-codes', text: 'Print QR Codes', icon: QrCode }
      ]
    },
    {
      title: 'Repair Tracking',
      icon: Wrench,
      description: 'Manage repair requests, track maintenance history, and update repair status. Order parts and coordinate with vendors.',
      links: [
        { to: '/repairs', text: 'Repair Dashboard', icon: Wrench }
      ]
    },
    {
      title: 'Content Management',
      icon: HelpCircle,
      description: 'Update frequently asked questions, manage business hours, and handle announcements.',
      links: [
        { to: '/admin/faq', text: 'Manage FAQs', icon: Settings },
        { to: '/admin/hours', text: 'Manage Hours & Announcements', icon: Clock }
      ]
    },
    {
      title: 'Shop Management',
      icon: ShoppingBag,
      description: 'Manage merchandise, gift cards, and pricing. Update product inventory and descriptions.',
      links: [
        { to: '/admin/shop', text: 'Manage Products', icon: Tag },
        { to: '/admin/shop', text: 'Manage Gift Cards', icon: Gift }
      ]
    },
    {
      title: 'Chatbot Settings',
      icon: MessageSquare,
      description: 'Configure the AI chatbot, enable or disable it, and manage chatbot settings for visitor interactions.',
      links: [
        { to: '/admin/chatbot', text: 'Chatbot Settings', icon: MessageSquare }
      ]
    },
    {
      title: 'Buyer Inquiries',
      icon: Mail,
      description: 'Manage buyer inquiries and offers for games. View, respond to, and track the status of purchase requests and offers from potential buyers.',
      links: [
        { to: '/admin/buyer-inquiries', text: 'View All Inquiries', icon: Mail }
      ]
    },
    {
      title: 'System Administration',
      icon: Key,
      description: 'Manage user accounts, reset passwords, and handle system-level administrative tasks.',
      links: [
        { to: '/admin/password-reset', text: 'Reset Passwords', icon: Key }
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

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
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