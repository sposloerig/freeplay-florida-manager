import React from 'react';
import { Link } from 'react-router-dom';
import { TowerControl as GameController, Wrench, Calendar, HelpCircle, ShoppingBag, Plus, Settings, Users, Trophy, Gift, Tag, DollarSign } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const adminFeatures = [
    {
      title: 'Game Management',
      icon: GameController,
      description: 'Add, edit, or remove arcade and pinball machines from the collection. Track game status, location, and maintenance history.',
      links: [
        { to: '/add', text: 'Add New Game', icon: Plus },
        { to: '/collection', text: 'View Collection', icon: GameController }
      ]
    },
    {
      title: 'Game Sales',
      icon: DollarSign,
      description: 'Manage games for sale, set pricing, track buyer inquiries, and handle sales transactions.',
      links: [
        { to: '/admin/sales', text: 'Manage Sales', icon: DollarSign },
        { to: '/games-for-sale', text: 'View Sales Page', icon: Tag }
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
      title: 'Event Management',
      icon: Calendar,
      description: 'Create and manage tournaments, special events, and promotions. Set up registration, pricing, and event details.',
      links: [
        { to: '/admin/events', text: 'Manage Events', icon: Trophy }
      ]
    },
    {
      title: 'FAQ Management',
      icon: HelpCircle,
      description: 'Update frequently asked questions and their answers. Organize FAQs by category and set display order.',
      links: [
        { to: '/admin/faq', text: 'Manage FAQs', icon: Settings }
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
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Welcome to the Replay Museum admin dashboard. Here you can manage games, repairs, events, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-4">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {feature.description}
              </p>

              <div className="space-y-2">
                {feature.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.to}
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <link.icon size={16} className="mr-2" />
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;