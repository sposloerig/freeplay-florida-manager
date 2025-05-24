import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { HelpCircle, Plus, Edit, Trash2, AlertTriangle, MoveUp, MoveDown } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_number: number;
}

const AdminFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<FAQ>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        const { error } = await supabase
          .from('faqs')
          .update(formData)
          .eq('id', formData.id);
        if (error) throw error;
      } else {
        const maxOrder = Math.max(...faqs.map(f => f.order_number), 0);
        const { error } = await supabase
          .from('faqs')
          .insert([{ ...formData, order_number: maxOrder + 1 }]);
        if (error) throw error;
      }

      setShowForm(false);
      setFormData({});
      await fetchFaqs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError('Failed to save FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchFaqs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setError('Failed to delete FAQ');
    }
  };

  const moveItem = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = faqs.findIndex(f => f.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === faqs.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newFaqs = [...faqs];
    const temp = newFaqs[currentIndex].order_number;
    newFaqs[currentIndex].order_number = newFaqs[newIndex].order_number;
    newFaqs[newIndex].order_number = temp;

    try {
      const { error } = await supabase
        .from('faqs')
        .upsert([
          { ...newFaqs[currentIndex] },
          { ...newFaqs[newIndex] }
        ]);

      if (error) throw error;
      await fetchFaqs();
    } catch (err) {
      console.error('Error reordering FAQs:', err);
      setError('Failed to reorder FAQs');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage FAQs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add FAQ
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
            {formData.id ? 'Edit FAQ' : 'Create New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question
              </label>
              <input
                type="text"
                value={formData.question || ''}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Answer
              </label>
              <textarea
                value={formData.answer || ''}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <HelpCircle size={20} className="text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveItem(faq.id, 'up')}
                      disabled={index === 0}
                      className={`p-1 ${
                        index === 0
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      <MoveUp size={16} />
                    </button>
                    <button
                      onClick={() => moveItem(faq.id, 'down')}
                      disabled={index === faqs.length - 1}
                      className={`p-1 ${
                        index === faqs.length - 1
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      <MoveDown size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(faq);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
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

export default AdminFaqPage;