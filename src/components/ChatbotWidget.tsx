import React, { useEffect } from 'react';
import { useChatbot } from '../context/ChatbotContext';

const ChatbotWidget: React.FC = () => {
  const { settings, loading } = useChatbot();

  useEffect(() => {
    // Only load the chatbot if it's enabled and we have settings
    if (!loading && settings?.enabled && settings?.agent_id) {
      // Check if the script is already loaded
      if (!document.querySelector('script[src*="convai-widget-embed"]')) {
        // Create the chatbot element
        const chatbotElement = document.createElement('elevenlabs-convai');
        chatbotElement.setAttribute('agent-id', settings.agent_id);
        chatbotElement.setAttribute('welcome-message', 'Hello! I\'m the Replay Museum virtual assistant. How can I help you today?');
        chatbotElement.setAttribute('placeholder-text', 'Ask about hours, games, events, etc.');
        document.body.appendChild(chatbotElement);

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        script.async = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);

        // Cleanup function
        return () => {
          // Remove chatbot element and script when component unmounts or settings change
          const existingChatbot = document.querySelector('elevenlabs-convai');
          const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
          
          if (existingChatbot) {
            existingChatbot.remove();
          }
          if (existingScript) {
            existingScript.remove();
          }
        };
      }
    } else {
      // Remove chatbot if disabled
      const existingChatbot = document.querySelector('elevenlabs-convai');
      if (existingChatbot) {
        existingChatbot.remove();
      }
    }
  }, [settings, loading]);

  // This component doesn't render anything visible
  return null;
};

export default ChatbotWidget;