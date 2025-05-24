import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'white';
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className = '', variant = 'default' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');

      setStatus('success');
      setMessage('Thanks for subscribing! Check your email to confirm.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again later.');
    }
  };

  const isWhiteVariant = variant === 'white';

  return (
    <div className={className}>
      <div className={`flex items-center mb-4 ${isWhiteVariant ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
        <Mail className={`w-5 h-5 mr-2 ${isWhiteVariant ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
        <h3 className="text-lg font-semibold">Subscribe to Our Newsletter</h3>
      </div>
      
      <p className={`mb-4 ${isWhiteVariant ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
        Stay updated with new events, tournaments, and special promotions!
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={`flex-1 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 ${
              isWhiteVariant 
                ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-white/30'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
            }`}
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`px-6 py-2 rounded-md font-medium flex items-center justify-center min-w-[120px] ${
              isWhiteVariant
                ? 'bg-white text-indigo-600 hover:bg-white/90'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors`}
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {status === 'success' && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5 mr-2" />
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{message}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default NewsletterSignup;