import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Info, Calendar, HelpCircle, Phone, TowerControl as GameController, Gift } from 'lucide-react';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Check if we're open
    const checkIfOpen = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = now.getHours();
      const minute = now.getMinutes();
      const time = hour * 100 + minute; // Convert to 24-hour format (e.g., 1:30 PM = 1330)

      const hours = {
        0: { open: 1100, close: 1900 }, // Sunday
        3: { open: 1100, close: 1900 }, // Wednesday
        4: { open: 1100, close: 1900 }, // Thursday
        5: { open: 1100, close: 2300 }, // Friday
        6: { open: 1100, close: 2300 }, // Saturday
      };

      const todayHours = hours[day as keyof typeof hours];
      const currentTime = time;

      setIsOpen(todayHours ? currentTime >= todayHours.open && currentTime < todayHours.close : false);
    };

    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg sticky top-0 z-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 md:space-x-4 hover:opacity-90 transition-opacity">
              <img 
                src="https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/16zjl0p-replay2_100000009905r000000028.png"
                alt="Replay Museum"
                className="h-10 md:h-16 w-auto"
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 border-r border-white/20 pr-6">
              <Phone size={16} className="text-indigo-200" />
              <a 
                href="tel:+17279403928" 
                className="text-indigo-100 hover:text-white transition-colors"
              >
                (727) 940-3928
              </a>
              <span 
                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  isOpen 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-red-500/20 text-red-100'
                }`}
              >
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <Link 
              to="/collection" 
              className={`transition-colors hover:text-indigo-200 py-2 flex items-center ${
                location.pathname === '/collection' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <GameController size={16} className="mr-1" />
              Games
            </Link>
            <Link 
              to="/events" 
              className={`transition-colors hover:text-indigo-200 py-2 flex items-center ${
                location.pathname === '/events' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <Calendar size={16} className="mr-1" />
              Events
            </Link>
            <Link 
              to="/about" 
              className={`transition-colors hover:text-indigo-200 py-2 flex items-center ${
                location.pathname === '/about' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <Info size={16} className="mr-1" />
              About
            </Link>
            <Link 
              to="/faq" 
              className={`transition-colors hover:text-indigo-200 py-2 flex items-center ${
                location.pathname === '/faq' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <HelpCircle size={16} className="mr-1" />
              FAQ
            </Link>
            <Link 
              to="/sell-donate" 
              className={`transition-colors hover:text-indigo-200 py-2 flex items-center ${
                location.pathname === '/sell-donate' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <Gift size={16} className="mr-1" />
              Sell/Donate
            </Link>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-indigo-600 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
          
          <div className="flex items-center md:hidden">
            <div className="flex items-center space-x-2 mr-4">
              <a 
                href="tel:+17279403928" 
                className="text-indigo-100 hover:text-white transition-colors flex items-center"
              >
                <Phone size={16} className="mr-1" />
                <span className="sr-only">Call us</span>
              </a>
              <span 
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  isOpen 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-red-500/20 text-red-100'
                }`}
              >
                {isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-indigo-600 transition-colors mr-2"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-indigo-600 transition-colors"
              aria-label="Open menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-800 shadow-lg pb-4 px-4 animate-fadeDown">
          <nav className="flex flex-col space-y-3 pt-2 pb-3">
            <Link 
              to="/collection" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/collection' 
                  ? 'bg-indigo-900 text-white font-medium' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}>
              <GameController size={16} className="mr-1" />
              Games
            </Link>
            <Link 
              to="/events" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/events' 
                  ? 'bg-indigo-900 text-white font-medium' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}>
              <Calendar size={16} className="mr-1" />
              Events
            </Link>
            <Link 
              to="/about" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/about' 
                  ? 'bg-indigo-900 text-white font-medium' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}>
              <Info size={16} className="mr-1" />
              About
            </Link>
            <Link 
              to="/faq" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/faq' 
                  ? 'bg-indigo-900 text-white font-medium' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}>
              <HelpCircle size={16} className="mr-1" />
              FAQ
            </Link>
            <Link 
              to="/sell-donate" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/sell-donate' 
                  ? 'bg-indigo-900 text-white font-medium' 
                  : 'text-indigo-100 hover:bg-indigo-700'
              }`}>
              <Gift size={16} className="mr-1" />
              Sell/Donate
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;