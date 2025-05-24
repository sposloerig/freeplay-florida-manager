import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowRight, TowerControl as GameController } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import NewsletterSignup from '../components/NewsletterSignup';

// Create Supabase client with additional options
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'replay-museum-web'
      }
    }
  }
);

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'tournament' | 'event';
  registration_fee?: number;
  admission_fee?: number;
  prizes?: string[];
}

const heroImages = [
  {
    url: 'https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/137ee6b6-02-large_0xc0ec0xc0ec00000001o.jpg',
    alt: 'Arcade interior'
  },
  {
    url: 'https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/24cf9ac4-01-large_0xc0ec0xc0ec00000001o.jpg',
    alt: 'Pinball machines'
  },
  {
    url: 'https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/ab2af50e-04-large_0xc0ec0xc0ec00000001o.jpg',
    alt: 'Retro gaming setup'
  },
  {
    url: 'https://d9hhrg4mnvzow.cloudfront.net/www.replaymuseum.com/56063621-05-large_0xc0ec0xc0ec00000001o.jpg',
    alt: 'Arcade machine display'
  }
];

const HomePage: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      // Ensure we have the required environment variables
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase configuration');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error: supabaseError } = await supabase
        .from('events')
        .select('*')
        .gte('date', today.toISOString())
        .order('date', { ascending: true })
        .limit(2);

      if (supabaseError) {
        throw supabaseError;
      }

      setUpcomingEvents(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load upcoming events');
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Welcome to Replay Museum
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Experience the largest collection of classic arcade and pinball machines in Florida.
              Step into gaming history with over 100 fully restored machines ready to play!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/collection"
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Collection
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl mx-auto">
            <NewsletterSignup variant="white" />
          </div>
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hours</h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Wed-Thu: 11am - 7pm</li>
                  <li>Fri-Sat: 11am - 11pm</li>
                  <li>Sun: 11am - 7pm</li>
                  <li className="text-sm italic mt-2">Late Night Date Night after 8pm Fri-Sat!</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Location</h3>
                <address className="text-gray-600 dark:text-gray-300 not-italic">
                  119 East Tarpon Avenue<br />
                  Tarpon Springs, FL
                </address>
                <a
                  href="https://www.google.com/maps/place/Replay+Museum/@28.1464453,-82.7582008,2449m/data=!3m1!1e3!4m15!1m8!3m7!1s0x88c28d732f5fbf61:0xefaab8944863667e!2s119+E+Tarpon+Ave,+Tarpon+Springs,+FL+34689!3b1!8m2!3d28.1464453!4d-82.7556259!16s%2Fg%2F11bw3xdhk4!3m5!1s0x88c28d732586ed63:0x7232e8ee3ba7091!8m2!3d28.1463666!4d-82.7556219!16s%2Fg%2F11b6377xkk?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoJLDEwMjExNDUzSAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block"
                >
                  Get Directions
                </a>
              </div>
            </div>
            
            <div className="flex items-start">
              <GameController className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Admission</h3>
                <div className="text-gray-600 dark:text-gray-300">
                  <p>Adults: $16 (tax included)</p>
                  <p>Kids (6-12): $10</p>
                  <p>Under 6: Free</p>
                  <p className="mt-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Late Night Date Night Special:<br />
                    2 entries for $26 after 8pm Fri-Sat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <Link
              to="/events"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center"
            >
              View All Events
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No upcoming events scheduled
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.type === 'tournament'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                    }`}>
                      {event.type === 'tournament' ? 'Tournament' : 'Special Event'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={16} className="mr-2" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })} at {event.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;