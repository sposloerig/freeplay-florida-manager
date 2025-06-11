import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ChatbotSettings {
  id: string;
  enabled: boolean;
  agent_id: string;
}

interface ChatbotContextType {
  settings: ChatbotSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<ChatbotSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Error fetching chatbot settings:', err);
      setError('Failed to load chatbot settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<ChatbotSettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('chatbot_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, ...updates });
    } catch (err) {
      console.error('Error updating chatbot settings:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        settings,
        loading,
        error,
        updateSettings,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};