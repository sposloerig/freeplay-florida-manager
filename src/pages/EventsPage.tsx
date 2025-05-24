import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Clock, MapPin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { format, parseISO } from 'date-fns';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
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

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Calendar size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tournaments & Events
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Join us for exciting tournaments and special events at Replay Museum!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No upcoming events scheduled at this time.</p>
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      {event.type === 'tournament' ? (
                        <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                      ) : (
                        <Calendar className="w-5 h-5 text-indigo-500 mr-2" />
                      )}
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        event.type === 'tournament'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                      }`}>
                        {event.type === 'tournament' ? 'Tournament' : 'Special Event'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {event.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p>{formatEventDate(event.date)} at {event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p>Replay Museum, Tarpon Springs</p>
                    </div>
                  </div>
                </div>

                {event.type === 'tournament' && event.registration_fee && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Entry Fee</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${event.registration_fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {event.type === 'event' && event.admission_fee && (
                  <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Admission</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${event.admission_fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;