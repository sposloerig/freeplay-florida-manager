import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, ShoppingCart } from 'lucide-react';


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