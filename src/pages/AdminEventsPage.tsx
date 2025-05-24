import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
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
  registration_fee?: number | null;
  admission_fee?: number | null;
  prizes?: string[];
}

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({
    type: 'event',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
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

  const validateForm = () => {
    if (!formData.title?.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!formData.description?.trim()) {
      setFormError('Description is required');
      return false;
    }
    if (!formData.date) {
      setFormError('Date is required');
      return false;
    }
    if (!formData.time?.trim()) {
      setFormError('Time is required');
      return false;
    }
    if (formData.type === 'tournament' && formData.registration_fee !== undefined && formData.registration_fee < 0) {
      setFormError('Registration fee cannot be negative');
      return false;
    }
    if (formData.type === 'event' && formData.admission_fee !== undefined && formData.admission_fee < 0) {
      setFormError('Admission fee cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const eventData = {
        ...formData,
        registration_fee: formData.registration_fee || null,
        admission_fee: formData.admission_fee || null,
      };

      if (formData.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', formData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
      }

      setShowForm(false);
      setFormData({ type: 'event' });
      await fetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      setFormError('Failed to save event. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Event
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {formData.id ? 'Edit Event' : 'Create New Event'}
          </h2>

          {formError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title*
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type*
                </label>
                <select
                  value={formData.type || 'event'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'tournament' | 'event' })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="event">Special Event</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date*
                </label>
                <input
                  type="date"
                  value={formData.date ? format(parseISO(formData.date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time*
                </label>
                <input
                  type="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {formData.type === 'tournament' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Registration Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.registration_fee || ''}
                    onChange={(e) => setFormData({ ...formData, registration_fee: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              {formData.type === 'event' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Admission Fee
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.admission_fee || ''}
                    onChange={(e) => setFormData({ ...formData, admission_fee: parseFloat(e.target.value) })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description*
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ type: 'event' });
                  setFormError(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {formData.id ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((event) => (
            <div key={event.id} className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar size={20} className="text-gray-400 mr-2" />
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      event.type === 'tournament'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200'
                    }`}>
                      {event.type === 'tournament' ? 'Tournament' : 'Special Event'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {event.description}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(event.date), 'MMMM d, yyyy')} at {event.time}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFormData(event);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEventsPage;