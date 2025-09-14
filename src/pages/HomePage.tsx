import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, ShoppingCart, Users, Gamepad2, Wrench } from 'lucide-react';


const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden bg-gradient-to-br from-fpf-700 via-fpf-purple-600 to-fpf-500">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Free Play Florida
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Game management system for Free Play Florida events. Track arcade and pinball machines, 
              manage maintenance, and coordinate with game owners for our amazing shows.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/submit-game"
                className="px-6 py-3 bg-fpf-500 text-white rounded-md hover:bg-fpf-600 transition-colors flex items-center shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Your Game
              </Link>
              <Link
                to="/collection"
                className="px-6 py-3 bg-white text-fpf-600 rounded-md hover:bg-gray-100 transition-colors flex items-center shadow-lg"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Games
              </Link>
              <Link
                to="/marketplace"
                className="px-6 py-3 bg-fpf-purple-500 text-white rounded-md hover:bg-fpf-purple-600 transition-colors flex items-center shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Free Play Florida Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform connects game owners with festival organizers to create amazing arcade experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-fpf-100 dark:bg-fpf-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-fpf-600 dark:text-fpf-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Submit Games</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Game owners can easily submit their arcade and pinball machines for consideration at our events
              </p>
            </div>

            <div className="text-center">
              <div className="bg-fpf-purple-100 dark:bg-fpf-purple-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-fpf-purple-600 dark:text-fpf-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community Events</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We organize events where the public can enjoy these amazing machines and meet fellow enthusiasts
              </p>
            </div>

            <div className="text-center">
              <div className="bg-fpf-200 dark:bg-fpf-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-fpf-700 dark:text-fpf-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Marketplace</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse games for sale from our community members and connect directly with owners
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Features Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Management Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Comprehensive tools for festival organizers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Gamepad2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Game Approval</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Review and approve submitted games, manage locations, and coordinate with owners
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Wrench className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance Tracking</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Track repairs, coordinate with owners, and ensure all games are working properly
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Owner Management</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Maintain contact information, service preferences, and communication history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Free Play Florida?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Whether you're a game owner looking to share your collection or someone interested in our events, 
            we'd love to have you be part of our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/submit-game"
              className="px-8 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors font-semibold"
            >
              Submit Your Game
            </Link>
            <Link
              to="/collection"
              className="px-8 py-3 border-2 border-white text-white rounded-md hover:bg-white hover:text-indigo-600 transition-colors font-semibold"
            >
              Browse Games
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;