import React, { useState } from 'react';
import { X, DollarSign, MessageSquare, User, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BuyerInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    name: string;
    askingPrice?: number;
    acceptOffers?: boolean;
    ownerName?: string;
    ownerEmail?: string;
  };
}

const BuyerInquiryModal: React.FC<BuyerInquiryModalProps> = ({
  isOpen,
  onClose,
  game
}) => {
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    offer_amount: '',
    message: '',
  });
  const [inquiryType, setInquiryType] = useState<'offer' | 'purchase'>('purchase');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill offer amount with asking price when purchase is selected
  React.useEffect(() => {
    if (inquiryType === 'purchase' && game.askingPrice && !formData.offer_amount) {
      setFormData(prev => ({
        ...prev,
        offer_amount: game.askingPrice!.toString()
      }));
    }
  }, [inquiryType, game.askingPrice, formData.offer_amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare inquiry data
      const inquiryData = {
        game_id: game.id,
        buyer_name: formData.buyer_name.trim(),
        buyer_email: formData.buyer_email.trim(),
        buyer_phone: formData.buyer_phone.trim() || null,
        offer_amount: formData.offer_amount ? parseFloat(formData.offer_amount) : null,
        message: formData.message.trim(),
      };

      // Save inquiry to database
      const { error } = await supabase
        .from('buyer_inquiries')
        .insert([inquiryData]);

      if (error) throw error;

      // Send email notification to managers
      try {
        const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/buyer-inquiry-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            game_id: game.id,
            game_name: game.name,
            buyer_name: inquiryData.buyer_name,
            buyer_email: inquiryData.buyer_email,
            buyer_phone: inquiryData.buyer_phone,
            offer_amount: inquiryData.offer_amount,
            message: inquiryData.message,
            inquiry_type: inquiryType,
            owner_name: game.ownerName,
            owner_email: game.ownerEmail,
          }),
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send email notification, but inquiry was saved');
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      const actionText = inquiryType === 'purchase' ? 'purchase request' : 'offer';
      alert(`Your ${actionText} has been submitted successfully! The owner will be notified and will contact you soon.`);
      
      // Reset form and close modal
      setFormData({
        buyer_name: '',
        buyer_email: '',
        buyer_phone: '',
        offer_amount: '',
        message: '',
      });
      setInquiryType('purchase');
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to submit your inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('BuyerInquiryModal render:', { isOpen, game: game?.name });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Game Owner
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {game.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Inquiry Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What would you like to do?
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inquiryType"
                  value="purchase"
                  checked={inquiryType === 'purchase'}
                  onChange={(e) => setInquiryType(e.target.value as 'offer' | 'purchase')}
                  className="h-4 w-4 text-fpf-600 focus:ring-fpf-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Buy at asking price
                  {game.askingPrice && (
                    <span className="text-fpf-600 font-medium ml-1">
                      (${game.askingPrice.toLocaleString()})
                    </span>
                  )}
                </span>
              </label>
              {game.acceptOffers && (
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="offer"
                    checked={inquiryType === 'offer'}
                    onChange={(e) => setInquiryType(e.target.value as 'offer' | 'purchase')}
                    className="h-4 w-4 text-fpf-600 focus:ring-fpf-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Make an offer</span>
                </label>
              )}
            </div>
          </div>

          {/* Your Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <User className="w-4 h-4 mr-2 text-fpf-600" />
              Your Information
            </h3>

            <div>
              <label htmlFor="buyer_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="buyer_name"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="buyer_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="buyer_email"
                name="buyer_email"
                value={formData.buyer_email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="buyer_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="buyer_phone"
                name="buyer_phone"
                value={formData.buyer_phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Purchase/Offer Amount */}
          <div>
            <label htmlFor="offer_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="w-4 h-4 inline mr-1 text-fpf-600" />
              {inquiryType === 'purchase' ? 'Purchase Amount' : 'Your Offer Amount'}
              {inquiryType === 'offer' && game.askingPrice && (
                <span className="text-xs text-gray-500 ml-2">
                  (Asking: ${game.askingPrice.toLocaleString()})
                </span>
              )}
            </label>
            <input
              type="number"
              id="offer_amount"
              name="offer_amount"
              value={formData.offer_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              readOnly={inquiryType === 'purchase'}
              className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                inquiryType === 'purchase' ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
              }`}
              placeholder={inquiryType === 'purchase' ? 'Asking price will be used' : 'Enter your offer'}
            />
            {inquiryType === 'purchase' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                You are purchasing at the full asking price of ${game.askingPrice?.toLocaleString() || 'TBD'}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <MessageSquare className="w-4 h-4 inline mr-1 text-fpf-600" />
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder={
                inquiryType === 'offer' 
                  ? "Tell the owner why you're interested in their game and any details about your offer..."
                  : "Let the owner know you're interested in purchasing at their asking price and any questions you have..."
              }
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 
               inquiryType === 'offer' ? 'Submit Offer' : 'Submit Purchase Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerInquiryModal;
