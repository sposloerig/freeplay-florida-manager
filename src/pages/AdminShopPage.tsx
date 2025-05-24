import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingBag, Plus, Edit, Trash2, AlertTriangle, Gift } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  in_stock: boolean;
}

interface GiftCard {
  id: string;
  denomination: number;
  description: string;
  active: boolean;
}

const AdminShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product | GiftCard>>({});

  useEffect(() => {
    fetchProducts();
    fetchGiftCards();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchGiftCards = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('denomination');

      if (error) throw error;
      setGiftCards(data || []);
    } catch (err) {
      console.error('Error fetching gift cards:', err);
      setError('Failed to load gift cards');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ('denomination' in formData) return; // Guard against gift card data

      const { error } = await supabase
        .from('products')
        .upsert([formData]);

      if (error) throw error;

      setShowProductForm(false);
      setFormData({});
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
    }
  };

  const handleGiftCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ('price' in formData) return; // Guard against product data

      const { error } = await supabase
        .from('gift_cards')
        .upsert([formData]);

      if (error) throw error;

      setShowGiftCardForm(false);
      setFormData({});
      await fetchGiftCards();
    } catch (err) {
      console.error('Error saving gift card:', err);
      setError('Failed to save gift card');
    }
  };

  const handleDelete = async (id: string, type: 'product' | 'giftCard') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const { error } = await supabase
        .from(type === 'product' ? 'products' : 'gift_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (type === 'product') {
        await fetchProducts();
      } else {
        await fetchGiftCards();
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Failed to delete ${type}`);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Shop</h1>
        <div className="space-x-4">
          <button
            onClick={() => setShowProductForm(!showProductForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
          <button
            onClick={() => setShowGiftCardForm(!showGiftCardForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Gift size={20} className="mr-2" />
            Add Gift Card
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Product Form */}
      {showProductForm && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {formData.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={(formData as Partial<Product>).name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={(formData as Partial<Product>).category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(formData as Partial<Product>).price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={(formData as Partial<Product>).image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={(formData as Partial<Product>).description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={(formData as Partial<Product>).in_stock || false}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                In Stock
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProductForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gift Card Form */}
      {showGiftCardForm && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {formData.id ? 'Edit Gift Card' : 'Add New Gift Card'}
          </h2>
          <form onSubmit={handleGiftCardSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Denomination
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={(formData as Partial<GiftCard>).denomination || ''}
                  onChange={(e) => setFormData({ ...formData, denomination: parseFloat(e.target.value) })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={(formData as Partial<GiftCard>).description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={(formData as Partial<GiftCard>).active || false}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowGiftCardForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Save Gift Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Products</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <div key={product.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                      <div className="mt-1">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          product.in_stock
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFormData(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, 'product')}
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

      {/* Gift Cards List */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Gift Cards</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {giftCards.map((giftCard) => (
              <div key={giftCard.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      ${giftCard.denomination.toFixed(2)} Gift Card
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{giftCard.description}</p>
                    <span className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${
                      giftCard.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}>
                      {giftCard.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFormData(giftCard);
                        setShowGiftCardForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(giftCard.id, 'giftCard')}
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
    </div>
  );
};

export default AdminShopPage;