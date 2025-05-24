import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NewsletterSignup from './NewsletterSignup';
import { 
  Mail,
  Lock,
  LogOut,
  Plus,
  Wrench,
  Calendar,
  HelpCircle,
  ShoppingBag,
  Phone,
  QrCode
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { user, signOut } = useAuth();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <span className="text-lg font-bold">Replay Museum</span>
            <a 
              href="https://www.google.com/maps/place/Replay+Museum/@28.1464453,-82.7582008,2449m/data=!3m1!1e3!4m15!1m8!3m7!1s0x88c28d732f5fbf61:0xefaab8944863667e!2s119+E+Tarpon+Ave,+Tarpon+Springs,+FL+34689!3b1!8m2!3d28.1464453!4d-82.7556259!16s%2Fg%2F11bw3xdhk4!3m5!1s0x88c28d732586ed63:0x7232e8ee3ba7091!8m2!3d28.1463666!4d-82.7556219!16s%2Fg%2F11b6377xkk?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors not-italic block"
            >
              119 East Tarpon Avenue<br />
              Tarpon Springs, FL
            </a>
            <a 
              href="tel:+17279403928"
              className="mt-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center"
            >
              <Phone size={16} className="mr-2" />
              (727) 940-3928
            </a>
            <Link 
              to="/about#contact" 
              className="mt-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center"
            >
              <Mail size={16} className="mr-2" />
              Contact Us
            </Link>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-bold mb-2">Hours</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>Wed-Thu: 11am - 7pm</li>
              <li>Fri-Sat: 11am - 11pm</li>
              <li>Sun: 11am - 7pm</li>
              <li className="text-indigo-400 mt-2">Late Night Date Night after 8pm Fri-Sat!</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <NewsletterSignup variant="white" />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-sm text-center text-gray-500">
          <p>&copy; {currentYear} Replay Museum. All rights reserved.</p>
          <p className="mt-2">
            Preserving gaming history for future generations.
          </p>
        </div>

        {/* Employee Section */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex justify-center">
            {user ? (
              <div className="flex flex-wrap gap-4 justify-center">
                <Link 
                  to="/add"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Add Game
                </Link>
                <Link 
                  to="/repairs"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Wrench size={16} className="mr-1" />
                  Repairs
                </Link>
                <Link 
                  to="/admin/events"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <Calendar size={16} className="mr-1" />
                  Manage Events
                </Link>
                <Link 
                  to="/admin/faq"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <HelpCircle size={16} className="mr-1" />
                  Manage FAQ
                </Link>
                <Link 
                  to="/admin/shop"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <ShoppingBag size={16} className="mr-1" />
                  Manage Shop
                </Link>
                <Link 
                  to="/qr-codes"
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <QrCode size={16} className="mr-1" />
                  Print QR Codes
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="flex items-center text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <Lock size={16} className="mr-1" />
                Employee Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;