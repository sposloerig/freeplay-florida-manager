import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GameType, GameLocation } from '../types';
import { Upload, AlertTriangle, CheckCircle, Phone, Mail, MapPin, User, Gamepad2, DollarSign, Settings } from 'lucide-react';

const PublicGameSubmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Game Information
    name: '',
    type: 'Arcade' as GameType,
    otherType: '',
    yearMade: '',
    conditionNotes: '',
    
    // Owner Information
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerAddress: '',
    ownerNotes: '',
    
    // Service Preferences
    allowOthersToService: false,
    serviceNotes: '',
    
    // Sales Information
    forSale: false,
    askingPrice: '',
    acceptOffers: false,
    saleConditionNotes: '',
    saleNotes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Game name is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Your name is required';
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Your email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.ownerEmail && !emailRegex.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Please enter a valid email address';
    }

    // Other type validation
    if (formData.type === 'Other' && !formData.otherType.trim()) {
      newErrors.otherType = 'Please specify the game type';
    }

    // Sales validation
    if (formData.forSale && formData.askingPrice && isNaN(Number(formData.askingPrice))) {
      newErrors.askingPrice = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const gameData = {
        name: formData.name.trim(),
        type: formData.type,
        type_other: formData.type === 'Other' ? formData.otherType.trim() : null,
        year_made: formData.yearMade ? parseInt(formData.yearMade) : null,
        condition_notes: formData.conditionNotes.trim() || null,
        
        // Owner information
        owner_name: formData.ownerName.trim(),
        owner_email: formData.ownerEmail.trim().toLowerCase(),
        owner_phone: formData.ownerPhone.trim() || null,
        owner_address: formData.ownerAddress.trim() || null,
        owner_notes: formData.ownerNotes.trim() || null,
        
        // Service preferences
        allow_others_to_service: formData.allowOthersToService,
        service_notes: formData.serviceNotes.trim() || null,
        
        // Sales information
        for_sale: formData.forSale,
        asking_price: formData.forSale && formData.askingPrice ? parseFloat(formData.askingPrice) : null,
        accept_offers: formData.acceptOffers,
        sale_condition_notes: formData.forSale ? formData.saleConditionNotes.trim() || null : null,
        sale_notes: formData.forSale ? formData.saleNotes.trim() || null : null,
        
        // Default values
        status: 'Operational',
        approval_status: 'pending',
        images: [],
      };

      const { error } = await supabase
        .from('games')
        .insert([gameData]);

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting game:', error);
      setErrors({ submit: 'An error occurred while submitting your game. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Game Submitted Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for submitting your game to Free Play Florida! We'll review your submission and contact you at{' '}
          <span className="font-medium">{formData.ownerEmail}</span> with updates.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>• Your game is now pending approval</p>
          <p>• We'll contact you within 2-3 business days</p>
          <p>• You'll receive location and setup details once approved</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Submit Your Game to Free Play Florida
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Share your arcade or pinball machine with fellow enthusiasts at our next event!
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Game Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Gamepad2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Game Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Game Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Medieval Madness, Galaga, etc."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Game Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="Arcade">Arcade</option>
                <option value="Pinball">Pinball</option>
                <option value="Skeeball">Skeeball</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.type === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specify Game Type *
                </label>
                <input
                  type="text"
                  name="otherType"
                  value={formData.otherType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                    errors.otherType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Redemption, Electromechanical, etc."
                />
                {errors.otherType && <p className="mt-1 text-sm text-red-600">{errors.otherType}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year Made
              </label>
              <input
                type="number"
                name="yearMade"
                value={formData.yearMade}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="e.g., 1982"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condition Notes
            </label>
            <textarea
              name="conditionNotes"
              value={formData.conditionNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              placeholder="Describe the current condition, any known issues, recent repairs, etc."
            />
          </div>
        </div>

        {/* Owner Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.ownerName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.ownerEmail ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ownerEmail && <p className="mt-1 text-sm text-red-600">{errors.ownerEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address/Location
              </label>
              <input
                type="text"
                name="ownerAddress"
                value={formData.ownerAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="City, State (for logistics planning)"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="ownerNotes"
              value={formData.ownerNotes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              placeholder="Anything else we should know? Special requirements, availability, etc."
            />
          </div>
        </div>

        {/* Service Preferences Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Service Preferences</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="allowOthersToService"
                checked={formData.allowOthersToService}
                onChange={handleInputChange}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow others to service my game if issues arise
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  If unchecked, we'll contact you first for any repairs needed during the event.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Notes
              </label>
              <textarea
                name="serviceNotes"
                value={formData.serviceNotes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="Any specific service instructions, known quirks, or contact preferences?"
              />
            </div>
          </div>
        </div>

        {/* Sales Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Information (Optional)</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <input
                type="checkbox"
                name="forSale"
                checked={formData.forSale}
                onChange={handleInputChange}
                className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This game is for sale
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Check this if you're interested in selling your game. It will be listed in our marketplace.
                </p>
              </div>
            </div>

            {formData.forSale && (
              <div className="ml-7 space-y-4 border-l-2 border-indigo-200 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Asking Price ($)
                    </label>
                    <input
                      type="number"
                      name="askingPrice"
                      value={formData.askingPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                        errors.askingPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 5000"
                    />
                    {errors.askingPrice && <p className="mt-1 text-sm text-red-600">{errors.askingPrice}</p>}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="acceptOffers"
                      checked={formData.acceptOffers}
                      onChange={handleInputChange}
                      className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Accept offers
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition for Sale
                  </label>
                  <textarea
                    name="saleConditionNotes"
                    value={formData.saleConditionNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Detailed condition description for potential buyers..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sales Notes
                  </label>
                  <textarea
                    name="saleNotes"
                    value={formData.saleNotes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    placeholder="Any additional information for buyers, terms, etc."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicGameSubmissionForm;