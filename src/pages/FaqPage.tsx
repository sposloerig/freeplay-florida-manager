import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_number: number;
}

const FaqPage: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <HelpCircle size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Find answers to common questions about visiting Replay Museum
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full text-left px-6 py-4 flex items-center justify-between"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {faq.question}
              </span>
              {expandedItems.includes(index) ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedItems.includes(index) && (
              <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Still have questions? Visit our{' '}
          <Link
            to="/about"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Contact page
          </Link>
          {' '}or call{' '}
          <a
            href="tel:+17279403928"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            (727) 940-3928
          </a>
        </p>
      </div>
    </div>
  );
};

export default FaqPage;