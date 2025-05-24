import React from 'react';
import { ShoppingBag, Tag, Gift } from 'lucide-react';

// Mock products until Shopify integration
const products = [
  {
    id: 1,
    name: 'Replay Museum T-Shirt',
    description: 'Classic black t-shirt with Replay Museum logo',
    price: 24.99,
    image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg',
    category: 'Apparel'
  },
  {
    id: 2,
    name: 'Arcade Lover Gift Card',
    description: 'The perfect gift for arcade enthusiasts',
    price: 50.00,
    image: 'https://images.pexels.com/photos/6956892/pexels-photo-6956892.jpeg',
    category: 'Gift Cards'
  },
  {
    id: 3,
    name: 'Retro Gaming Cap',
    description: 'Embroidered cap with classic gaming icons',
    price: 19.99,
    image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg',
    category: 'Apparel'
  },
  {
    id: 4,
    name: 'Annual Membership Pass',
    description: 'Unlimited visits for a full year',
    price: 199.99,
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    category: 'Memberships'
  }
];

const categories = ['All', ...new Set(products.map(product => product.category))];

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <ShoppingBag size={32} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Museum Shop
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Take home a piece of arcade history with our exclusive merchandise and gift cards
        </p>
      </div>

      {/* Category filters */}
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

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                  <Tag size={12} className="mr-1" />
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {/* Shopify Buy Button will replace this button */}
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gift Cards Section */}
      <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-xl overflow-hidden">
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0 md:mr-8">
            <div className="flex items-center mb-4">
              <Gift size={32} className="mr-3" />
              <h2 className="text-2xl font-bold">Gift Cards Available</h2>
            </div>
            <p className="text-indigo-100 max-w-xl">
              Give the gift of gaming! Our gift cards are perfect for birthdays, 
              holidays, or any special occasion. Available in various denominations 
              and can be used for admission, merchandise, or special events.
            </p>
          </div>
          <button className="px-6 py-3 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium">
            Purchase Gift Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;