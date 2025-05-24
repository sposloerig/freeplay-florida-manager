import React from 'react';
import { Gift, DollarSign } from 'lucide-react';
import ContactForm from '../components/ContactForm';

const SellDonatePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Sell or Donate Your Games
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Help us preserve gaming history by selling or donating your arcade and pinball machines to Replay Museum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sell Your Games</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                We're always interested in expanding our collection with quality arcade and pinball machines. 
                If you have games to sell, we offer:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Professional evaluation of your games</li>
                <li>Hassle-free pickup and transportation</li>
                <li>Quick payment process</li>
                <li>Flexible scheduling for inspection and pickup</li>
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Gift className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Donate Games</h2>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Consider donating your games to help preserve gaming history and bring joy to future generations.
                Benefits of donating include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Recognition in our museum (if desired)</li>
                <li>Free museum passes</li>
                <li>Preservation of your games' legacy</li>
                <li>Supporting the gaming community</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4">What We're Looking For</h2>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Arcade machines (working or non-working)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Pinball machines (any condition)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Game parts and components
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Gaming memorabilia and collectibles
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                Vintage gaming equipment
              </li>
            </ul>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Us About Your Games
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellDonatePage;