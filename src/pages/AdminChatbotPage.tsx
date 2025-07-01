import React, { useState } from 'react';
import { useChatbot } from '../context/ChatbotContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, CheckCircle, Save, RotateCcw, Book, Plus, Trash2, RefreshCw, Key, Edit } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'settings' | 'knowledge'>('settings');
  const [apiKey, setApiKey] = useState('');
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [loadingKnowledge, setLoadingKnowledge] = useState(false);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({
    title: '',
    text: ''
  });
  const [addingKnowledge, setAddingKnowledge] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

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

  const fetchKnowledgeBase = async () => {
    if (!apiKey) {
      setKnowledgeError('ElevenLabs API key is required to fetch knowledge base');
      return;
    }

    setLoadingKnowledge(true);
    setKnowledgeError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-knowledge/knowledge`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-elevenlabs-api-key': apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch knowledge base');
      }

      const data = await response.json();
      setKnowledgeItems(data.knowledge_items || []);
    } catch (err) {
      console.error('Error fetching knowledge base:', err);
      setKnowledgeError(err instanceof Error ? err.message : 'Failed to fetch knowledge base');
    } finally {
      setLoadingKnowledge(false);
    }
  };

  const handleAddKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setKnowledgeError('ElevenLabs API key is required to add knowledge item');
      return;
    }

    if (!newKnowledgeItem.title || !newKnowledgeItem.text) {
      setKnowledgeError('Title and text are required');
      return;
    }

    setAddingKnowledge(true);
    setKnowledgeError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-knowledge/knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-elevenlabs-api-key': apiKey
        },
        body: JSON.stringify({
          title: newKnowledgeItem.title,
          text: newKnowledgeItem.text,
          type: 'text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add knowledge item');
      }

      // Reset form and show success message
      setNewKnowledgeItem({ title: '', text: '' });
      setShowAddForm(false);
      setAddSuccess(true);
      
      // Refresh knowledge base
      fetchKnowledgeBase();
      
      // Hide success message after 3 seconds
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding knowledge item:', err);
      setKnowledgeError(err instanceof Error ? err.message : 'Failed to add knowledge item');
    } finally {
      setAddingKnowledge(false);
    }
  };

  const handleDeleteKnowledgeItem = async (knowledgeId: string) => {
    if (!apiKey) {
      setKnowledgeError('ElevenLabs API key is required to delete knowledge item');
      return;
    }

    if (!confirm('Are you sure you want to delete this knowledge item? This action cannot be undone.')) {
      return;
    }

    setLoadingKnowledge(true);
    setKnowledgeError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-knowledge/knowledge`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-elevenlabs-api-key': apiKey
        },
        body: JSON.stringify({
          knowledge_id: knowledgeId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete knowledge item');
      }

      // Refresh knowledge base
      fetchKnowledgeBase();
    } catch (err) {
      console.error('Error deleting knowledge item:', err);
      setKnowledgeError(err instanceof Error ? err.message : 'Failed to delete knowledge item');
    } finally {
      setLoadingKnowledge(false);
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

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-2" />
                Chatbot Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'knowledge'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Book size={16} className="mr-2" />
                Knowledge Base
              </div>
            </button>
          </nav>
        </div>
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

      {activeTab === 'settings' && (
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

          {/* Help Section */}
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
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
      )}

      {activeTab === 'knowledge' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* API Key Input */}
            <div>
              <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ElevenLabs API Key
              </label>
              <div className="flex">
                <input
                  type="password"
                  id="api_key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your ElevenLabs API key"
                />
                <button
                  onClick={fetchKnowledgeBase}
                  disabled={!apiKey || loadingKnowledge}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {loadingKnowledge ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  Fetch Knowledge
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your API key is required to access and modify the knowledge base. It is not stored on our servers.
              </p>
              <div className="mt-2 flex items-center">
                <Key size={14} className="text-yellow-500 mr-1" />
                <a 
                  href="https://elevenlabs.io/app/account/api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Get your API key from ElevenLabs
                </a>
              </div>
            </div>

            {knowledgeError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
                <AlertTriangle size={20} className="mr-2" />
                {knowledgeError}
              </div>
            )}

            {addSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-200 flex items-center">
                <CheckCircle size={20} className="mr-2" />
                Knowledge item added successfully!
              </div>
            )}

            {/* Add Knowledge Item Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Knowledge Base Items
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={!apiKey}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Plus size={16} className="mr-2" />
                Add Knowledge
              </button>
            </div>

            {/* Add Knowledge Form */}
            {showAddForm && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Add New Knowledge Item
                </h4>
                <form onSubmit={handleAddKnowledgeItem} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newKnowledgeItem.title}
                      onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, title: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="E.g., Museum Hours, Admission Prices, etc."
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      id="text"
                      value={newKnowledgeItem.text}
                      onChange={(e) => setNewKnowledgeItem({ ...newKnowledgeItem, text: e.target.value })}
                      rows={6}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter the information you want the chatbot to know..."
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingKnowledge}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {addingKnowledge ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <Plus size={16} className="mr-2" />
                      )}
                      {addingKnowledge ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Knowledge Base Items List */}
            <div className="space-y-4">
              {loadingKnowledge ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : knowledgeItems.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {knowledgeItems.map((item) => (
                    <div key={item.knowledge_id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {item.text}
                          </p>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            ID: {item.knowledge_id}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteKnowledgeItem(item.knowledge_id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete knowledge item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : apiKey ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No knowledge items found. Click "Add Knowledge" to create your first item.
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Enter your ElevenLabs API key and click "Fetch Knowledge" to view the knowledge base.
                </div>
              )}
            </div>

            {/* Knowledge Base Help */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                About the Knowledge Base
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• The knowledge base contains information that the chatbot can access</li>
                <li>• Add information about hours, prices, events, and frequently asked questions</li>
                <li>• Keep information concise and factual for best results</li>
                <li>• Changes to the knowledge base may take a few minutes to take effect</li>
                <li>• Your API key is only used to authenticate with ElevenLabs and is not stored</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatbotPage;