import React, { useState } from 'react';
import { useChatbot } from '../context/ChatbotContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, CheckCircle, Save, RotateCcw } from 'lucide-react';

const AdminChatbotPage: React.FC = () => {
  const { user, isManager } = useAuth();
  const { settings, loading, error, updateSettings } = useChatbot();
  const [formData, setFormData] = useState({
    enabled: settings?.enabled ?? true,
    agent_id: settings?.agent_id ?? 'agent_01jx426hnyex4r29vgjrby9h3b'
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        enabled: settings.enabled,
        agent_id: settings.agent_id
      });
    }
  }, [settings]);

  // If not authenticated or not a manager, redirect
  if (!user || !isManager) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving chatbot settings:', err);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        enabled: settings.enabled,
        agent_id: settings.agent_id
      });
    }
    setSaveError(null);
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <MessageSquare size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Chatbot Settings
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Configure the ElevenLabs Conversational AI chatbot for your website
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-200 flex items-center">
          <CheckCircle size={20} className="mr-2" />
          Chatbot settings saved successfully!
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {saveError}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Enable Chatbot
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Turn the AI chatbot on or off for all website visitors
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Agent ID Configuration */}
          <div>
            <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ElevenLabs Agent ID
            </label>
            <input
              type="text"
              id="agent_id"
              value={formData.agent_id}
              onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="agent_01jx426hnyex4r29vgjrby9h3b"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The unique identifier for your ElevenLabs Conversational AI agent
            </p>
          </div>

          {/* Current Status */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Current Status
            </h4>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                settings?.enabled ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Chatbot is currently {settings?.enabled ? 'enabled' : 'disabled'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center disabled:opacity-50"
            >
              <RotateCcw size={16} className="mr-2" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          How it works
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <li>• When enabled, the chatbot appears as a floating widget on all pages</li>
          <li>• Visitors can interact with the AI to get information about the museum</li>
          <li>• The chatbot can answer questions about hours, games, events, and more</li>
          <li>• You can disable it anytime for maintenance or special events</li>
          <li>• Changes take effect immediately across the entire website</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminChatbotPage;