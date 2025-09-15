import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, TowerControl as GameController, Plus, DollarSign, Gamepad2, Mail } from 'lucide-react';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
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
    <header className="bg-gradient-to-r from-fpf-700 to-fpf-purple-700 text-white shadow-lg sticky top-0 z-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 md:space-x-4 hover:opacity-90 transition-opacity">
              <div className="flex items-center">
                <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-white mr-3" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Free Play Florida</h1>
                  <p className="text-xs md:text-sm text-fpf-200 hidden md:block">Arcade & Pinball Community</p>
                </div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">

            <Link 
              to="/collection" 
              className={`transition-colors hover:text-fpf-200 py-2 flex items-center ${
                location.pathname === '/collection' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <GameController size={16} className="mr-1" />
              Games
            </Link>
            <Link 
              to="/submit-game" 
              className={`transition-colors hover:text-fpf-200 py-2 flex items-center ${
                location.pathname === '/submit-game' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <Plus size={16} className="mr-1" />
              Submit Game
            </Link>
            <Link 
              to="/marketplace" 
              className={`transition-colors hover:text-fpf-200 py-2 flex items-center ${
                location.pathname === '/marketplace' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <DollarSign size={16} className="mr-1" />
              Marketplace
            </Link>
            <Link 
              to="/contact" 
              className={`transition-colors hover:text-fpf-200 py-2 flex items-center ${
                location.pathname === '/contact' ? 'border-b-2 border-white font-medium' : ''
              }`}>
              <Mail size={16} className="mr-1" />
              Contact
            </Link>
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full hover:bg-fpf-600 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-fpf-600 transition-colors"
              aria-label="Open menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-fpf-800 shadow-lg pb-4 px-4 animate-fadeDown">
          <nav className="flex flex-col space-y-3 pt-2 pb-3">
            <Link 
              to="/collection" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/collection' 
                  ? 'bg-fpf-900 text-white font-medium' 
                  : 'text-fpf-100 hover:bg-fpf-700'
              }`}>
              <GameController size={16} className="mr-1" />
              Games
            </Link>
            <Link 
              to="/submit-game" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/submit-game' 
                  ? 'bg-fpf-900 text-white font-medium' 
                  : 'text-fpf-100 hover:bg-fpf-700'
              }`}>
              <Plus size={16} className="mr-1" />
              Submit Game
            </Link>
            <Link 
              to="/marketplace" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/marketplace' 
                  ? 'bg-fpf-900 text-white font-medium' 
                  : 'text-fpf-100 hover:bg-fpf-700'
              }`}>
              <DollarSign size={16} className="mr-1" />
              Marketplace
            </Link>
            <Link 
              to="/contact" 
              className={`block px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/contact' 
                  ? 'bg-fpf-900 text-white font-medium' 
                  : 'text-fpf-100 hover:bg-fpf-700'
              }`}>
              <Mail size={16} className="mr-1" />
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;