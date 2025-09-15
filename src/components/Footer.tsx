import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Mail,
  Lock,
  LogOut,
  Settings,
  Gamepad2
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user, signOut } = useAuth();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center mb-4">
              <Gamepad2 className="w-6 h-6 text-indigo-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Free Play Florida</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Connecting arcade and pinball enthusiasts across Florida. Submit your games, 
              browse our marketplace, and join our community events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/submit-game" className="hover:text-indigo-400 transition-colors">
                  Submit Game
                </Link>
              </li>
              <li>
                <Link to="/collection" className="hover:text-indigo-400 transition-colors">
                  View Games
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-indigo-400 transition-colors">
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin Links */}
          <div>
            {user ? (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Admin</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/admin" className="hover:text-indigo-400 transition-colors flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/add" className="hover:text-indigo-400 transition-colors">
                      Add Game
                    </Link>
                  </li>
                  <li>
                    <Link to="/repairs" className="hover:text-indigo-400 transition-colors">
                      Repairs
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={signOut}
                      className="hover:text-indigo-400 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Admin Access</h3>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {currentYear} Free Play Florida. All rights reserved.
          </div>
          <div className="text-gray-400 text-sm mt-4 md:mt-0">
            Built for the arcade community
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;