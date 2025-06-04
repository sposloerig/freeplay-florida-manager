import React from 'react';
import { MapPin, Phone, Clock, Mail, Globe, Facebook, Instagram } from 'lucide-react';
import ContactForm from '../components/ContactForm';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About Replay Museum
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Experience the largest collection of classic arcade and pinball machines in Florida!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hours & Location</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Hours of Operation</h3>
                  <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                    <li>Wednesday - Thursday: 11am - 7pm</li>
                    <li>Friday - Saturday: 11am - 11pm</li>
                    <li>Sunday: 11am - 7pm</li>
                    <li>Monday - Tuesday: Closed</li>
                    <li className="text-sm italic mt-2">Late Night Date Night Special after 8pm on Fridays & Saturdays!</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Location</h3>
                  <address className="mt-2 not-italic text-gray-600 dark:text-gray-300">
                    119 East Tarpon Avenue<br />
                    Tarpon Springs, FL
                  </address>
                  <a
                    href="https://www.google.com/maps/place/Replay+Museum/@28.1464453,-82.7582008,2449m/data=!3m1!1e3!4m15!1m8!3m7!1s0x88c28d732f5fbf61:0xefaab8944863667e!2s119+E+Tarpon+Ave,+Tarpon+Springs,+FL+34689!3b1!8m2!3d28.1464453!4d-82.7556259!16s%2Fg%2F11bw3xdhk4!3m5!1s0x88c28d732586ed63:0x7232e8ee3ba7091!8m2!3d28.1463666!4d-82.7556219!16s%2Fg%2F11b6377xkk?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Links</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Website</h3>
                  <a href="https://replaymuseum.org" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    replaymuseum.org
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <a href="https://www.facebook.com/replaymuseum" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/replaymuseum" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Admission & Pricing</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">General Admission</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">$16</p>
                <p className="text-gray-600 dark:text-gray-300">Tax included</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Kids (6-12)</h3>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">$10</p>
                <p className="text-gray-600 dark:text-gray-300">Tax included</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                Late Night Date Night Special
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300">
                2 entries for $26 after 8pm on Fridays & Saturdays
              </p>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                Tax included
              </p>
            </div>

            <div className="mt-4 text-gray-600 dark:text-gray-300">
              <p className="mb-2">All games are set to free play after admission. No quarters or tokens needed!</p>
              <p>Group rates and private events available. Contact us for more information.</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
};

export default AboutPage;