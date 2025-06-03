import React, { useState } from 'react';
import { useBusinessHours } from '../context/BusinessHoursContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Bell, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const AdminHoursPage: React.FC = () => {
  const { 
    regularHours,
    specialHours,
    announcements,
    updateBusinessHours,
    addSpecialHours,
    removeSpecialHours,
    addAnnouncement,
    removeAnnouncement,
    loading,
    error 
  } = useBusinessHours();
  const { isManager } = useAuth();

  const [editingRegularHours, setEditingRegularHours] = useState(false);
  const [editedHours, setEditedHours] = useState(regularHours);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleRegularHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBusinessHours(editedHours);
      setEditingRegularHours(false);
    } catch (err) {
      console.error('Error updating hours:', err);
    }
  };

  const [newSpecialHours, setNewSpecialHours] = useState({
    date: '',
    openTime: '',
    closeTime: '',
    isClosed: false,
    reason: ''
  });

  const handleSpecialHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSpecialHours(newSpecialHours);
      setNewSpecialHours({
        date: '',
        openTime: '',
        closeTime: '',
        isClosed: false,
        reason: ''
      });
    } catch (err) {
      console.error('Error adding special hours:', err);
    }
  };

  const [newAnnouncement, setNewAnnouncement] = useState({
    message: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    startDate: new Date(),
    endDate: new Date(),
    isActive: true
  });

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAnnouncement(newAnnouncement);
      setNewAnnouncement({
        message: '',
        type: 'info',
        startDate: new Date(),
        endDate: new Date(),
        isActive: true
      });
    } catch (err) {
      console.error('Error adding announcement:', err);
    }
  };

  if (!isManager) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You don't have permission to manage business hours.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <Clock size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Manage Hours & Announcements
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Update business hours, set special hours, and manage announcements.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Regular Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Clock size={24} className="mr-2" />
            Regular Hours
          </h2>
          <button
            onClick={() => setEditingRegularHours(!editingRegularHours)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <Edit size={20} />
          </button>
        </div>

        {editingRegularHours ? (
          <form onSubmit={handleRegularHoursSubmit} className="space-y-4">
            {dayNames.map((day, index) => (
              <div key={day} className="flex items-center space-x-4">
                <span className="w-32">{day}</span>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editedHours[index]?.isClosed}
                    onChange={(e) => {
                      const newHours = [...editedHours];
                      newHours[index] = {
                        ...newHours[index],
                        dayOfWeek: index,
                        isClosed: e.target.checked
                      };
                      setEditedHours(newHours);
                    }}
                    className="mr-2"
                  />
                  Closed
                </label>
                {!editedHours[index]?.isClosed && (
                  <>
                    <input
                      type="time"
                      value={editedHours[index]?.openTime || ''}
                      onChange={(e) => {
                        const newHours = [...editedHours];
                        newHours[index] = {
                          ...newHours[index],
                          dayOfWeek: index,
                          openTime: e.target.value
                        };
                        setEditedHours(newHours);
                      }}
                      className="p-2 border rounded"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={editedHours[index]?.closeTime || ''}
                      onChange={(e) => {
                        const newHours = [...editedHours];
                        newHours[index] = {
                          ...newHours[index],
                          dayOfWeek: index,
                          closeTime: e.target.value
                        };
                        setEditedHours(newHours);
                      }}
                      className="p-2 border rounded"
                    />
                  </>
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditingRegularHours(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {regularHours.map((hours) => (
              <div key={hours.dayOfWeek} className="flex items-center justify-between py-2">
                <span className="font-medium">{dayNames[hours.dayOfWeek]}</span>
                <span>
                  {hours.isClosed ? (
                    <span className="text-red-600 dark:text-red-400">Closed</span>
                  ) : (
                    `${hours.openTime} - ${hours.closeTime}`
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Special Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar size={24} className="mr-2" />
            Special Hours
          </h2>
        </div>

        <form onSubmit={handleSpecialHoursSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newSpecialHours.date}
                onChange={(e) => setNewSpecialHours({
                  ...newSpecialHours,
                  date: e.target.value
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                type="text"
                value={newSpecialHours.reason || ''}
                onChange={(e) => setNewSpecialHours({
                  ...newSpecialHours,
                  reason: e.target.value
                })}
                className="w-full p-2 border rounded"
                placeholder="e.g., Holiday Hours"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newSpecialHours.isClosed}
                onChange={(e) => setNewSpecialHours({
                  ...newSpecialHours,
                  isClosed: e.target.checked
                })}
                className="mr-2"
              />
              Closed
            </label>
            {!newSpecialHours.isClosed && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Open</label>
                  <input
                    type="time"
                    value={newSpecialHours.openTime}
                    onChange={(e) => setNewSpecialHours({
                      ...newSpecialHours,
                      openTime: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Close</label>
                  <input
                    type="time"
                    value={newSpecialHours.closeTime}
                    onChange={(e) => setNewSpecialHours({
                      ...newSpecialHours,
                      closeTime: e.target.value
                    })}
                    className="p-2 border rounded"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Special Hours
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {specialHours.map((hours) => (
            <div key={hours.date} className="flex items-center justify-between py-2 border-t">
              <div>
                <div className="font-medium">{format(parseISO(hours.date), 'MMMM d, yyyy')}</div>
                <div className="text-sm text-gray-500">{hours.reason}</div>
                <div>
                  {hours.isClosed ? (
                    <span className="text-red-600 dark:text-red-400">Closed</span>
                  ) : (
                    `${hours.openTime} - ${hours.closeTime}`
                  )}
                </div>
              </div>
              <button
                onClick={() => removeSpecialHours(hours.date)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bell size={24} className="mr-2" />
            Announcements
          </h2>
        </div>

        <form onSubmit={handleAnnouncementSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <input
              type="text"
              value={newAnnouncement.message}
              onChange={(e) => setNewAnnouncement({
                ...newAnnouncement,
                message: e.target.value
              })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  type: e.target.value as 'info' | 'warning' | 'success' | 'error'
                })}
                className="w-full p-2 border rounded"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={format(newAnnouncement.startDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  startDate: new Date(e.target.value)
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="datetime-local"
                value={format(newAnnouncement.endDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewAnnouncement({
                  ...newAnnouncement,
                  endDate: new Date(e.target.value)
                })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Announcement
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="flex items-center justify-between py-2 border-t">
              <div>
                <div className="font-medium">{announcement.message}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(announcement.startDate), 'MMM d, yyyy h:mm a')} -
                  {format(new Date(announcement.endDate), 'MMM d, yyyy h:mm a')}
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                  announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {announcement.type}
                </span>
              </div>
              <button
                onClick={() => removeAnnouncement(announcement.id)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHoursPage;