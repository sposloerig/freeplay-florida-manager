import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GameType } from '../types';
import { Upload, AlertTriangle, CheckCircle, Phone, Mail, User, Gamepad2, DollarSign, Settings, Building, Star, Plus, Trash2 } from 'lucide-react';

interface GameSubmission {
  name: string;
  type: GameType;
  maker: string;
  forSale: boolean;
  askingPrice?: string;
  acceptOffers?: boolean;
  saleNotes?: string;
}

const GAME_MAKERS = [
  'Any', 'Alvin G', 'Atari', 'Bally', 'Barrels of Fun!', 'Capcom', 'Centuri', 
  'Cinematronics', 'Custom', 'Data East', 'Gottlieb', 'Jersey Jack', 'Konami', 
  'Multimorphic', 'Namco', 'Nintendo', 'Sega', 'Spooky', 'Stern', 'Taito', 
  'Williams', 'Other'
];

const FreePlayFloridaSubmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Owner Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    
    // Service Preferences (your addition)
    allowOthersToService: false,
    serviceNotes: '',
    
    // Games (start with 1, can add more)
    games: [{
      name: '',
      type: 'Pinball' as GameType,
      maker: 'Any',
      forSale: false,
      askingPrice: '',
      acceptOffers: false,
      saleNotes: ''
    }] as GameSubmission[]
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

  const handleGameChange = (gameIndex: number, field: keyof GameSubmission, value: any) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.map((game, index) => 
        index === gameIndex ? { ...game, [field]: value } : game
      )
    }));
  };

  const addGame = () => {
    if (formData.games.length < 6) {
      setFormData(prev => ({
        ...prev,
        games: [...prev.games, {
          name: '',
          type: 'Pinball' as GameType,
          maker: 'Any',
          forSale: false,
          askingPrice: '',
          acceptOffers: false,
          saleNotes: ''
        }]
      }));
    }
  };

  const removeGame = (gameIndex: number) => {
    if (formData.games.length > 1) {
      setFormData(prev => ({
        ...prev,
        games: prev.games.filter((_, index) => index !== gameIndex)
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // At least one game required
    const hasValidGame = formData.games.some(game => game.name.trim());
    if (!hasValidGame) newErrors.games = 'At least one game is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate games with names have required fields
    formData.games.forEach((game, index) => {
      if (game.name.trim()) {
        if (game.forSale && game.askingPrice && isNaN(Number(game.askingPrice))) {
          newErrors[`game${index}Price`] = 'Please enter a valid price';
        }
      }
    });

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
      // Submit each game with name as a separate entry
      const validGames = formData.games.filter(game => game.name.trim());
      
      for (const game of validGames) {
        const gameData = {
          name: game.name.trim(),
          type: game.type,
          type_other: game.type === 'Other' ? 'Custom' : null,
          
          // Owner information
          owner_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          owner_email: formData.email.trim().toLowerCase(),
          owner_phone: formData.phone.trim(),
            owner_notes: [
              formData.notes ? `Notes: ${formData.notes}` : '',
              `Maker: ${game.maker}`
            ].filter(Boolean).join(' | '),
          
          // Service preferences
          allow_others_to_service: formData.allowOthersToService,
          service_notes: formData.serviceNotes.trim() || null,
          
          // Sales information
          for_sale: game.forSale,
          asking_price: game.forSale && game.askingPrice ? parseFloat(game.askingPrice) : null,
          accept_offers: game.acceptOffers,
          sale_notes: game.forSale ? game.saleNotes.trim() || null : null,
          
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
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting games:', error);
      setErrors({ submit: 'An error occurred while submitting your games. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    const gameCount = formData.games.filter(game => game.name.trim()).length;
    const freePassCount = Math.min(gameCount, 4);
    
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Games Submitted Successfully!
        </h2>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-yellow-500 mr-2" />
            <span className="text-lg font-semibold text-green-800 dark:text-green-200">
              You've earned {freePassCount} free weekend pass{freePassCount !== 1 ? 'es' : ''}!
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your first four games each earn you a free weekend pass, plus other perks!
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Thank you for submitting {gameCount} game{gameCount !== 1 ? 's' : ''} to Free Play Florida! 
          We'll review your submission and contact you at{' '}
          <span className="font-medium">{formData.email}</span> with updates.
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <p>• Your games are now pending approval</p>
          <p>• We'll contact you with location and setup details</p>
          <p>• You'll have floor access during open hours once approved</p>
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
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          2025 Game Submission
        </h1>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            <span className="text-lg font-semibold text-blue-800 dark:text-blue-200">
              Free Weekend Passes Available!
            </span>
          </div>
          <p className="text-blue-700 dark:text-blue-300">
            Your first four games will <strong>each</strong> earn you a free weekend pass (up to 4 total) 
            plus other perks! If your games are on the floor, you have access during all open hours.
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Submit your game(s) for the show! Please only submit once - email us if you need to make changes.
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Owner Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Do you have any notes for us?
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              maxLength={350}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              placeholder="Any special requirements, setup notes, or other information..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.notes.length}/350
            </div>
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
                  Allow others to service my games if issues arise
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

        {/* Games Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gamepad2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Games ({formData.games.length}/6)
              </h2>
            </div>
            {formData.games.length < 6 && (
              <button
                type="button"
                onClick={addGame}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </button>
            )}
          </div>
          
          {errors.games && <p className="mb-4 text-sm text-red-600">{errors.games}</p>}
          
          <div className="space-y-6">
            {formData.games.map((game, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Game {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                  </h3>
                  {formData.games.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGame(index)}
                      className="flex items-center px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Game Name {index === 0 && '*'}
                    </label>
                    <input
                      type="text"
                      value={game.name}
                      onChange={(e) => handleGameChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      placeholder="e.g., Medieval Madness"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type {game.name && '*'}
                    </label>
                    <select
                      value={game.type}
                      onChange={(e) => handleGameChange(index, 'type', e.target.value as GameType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="Pinball">Pinball</option>
                      <option value="Arcade">Arcade</option>
                      <option value="Console">Console</option>
                      <option value="Computer">Computer</option>
                      <option value="Handheld">Handheld</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maker
                    </label>
                    <select
                      value={game.maker}
                      onChange={(e) => handleGameChange(index, 'maker', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      {GAME_MAKERS.map(maker => (
                        <option key={maker} value={maker}>{maker}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      For Sale?
                    </label>
                    <div className="flex items-center space-x-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`game${index}ForSale`}
                          checked={game.forSale}
                          onChange={() => handleGameChange(index, 'forSale', true)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`game${index}ForSale`}
                          checked={!game.forSale}
                          onChange={() => handleGameChange(index, 'forSale', false)}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sales Information */}
                {game.forSale && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                      Sales Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Asking Price ($)
                        </label>
                        <input
                          type="number"
                          value={game.askingPrice}
                          onChange={(e) => handleGameChange(index, 'askingPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
                            errors[`game${index}Price`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 5000"
                        />
                        {errors[`game${index}Price`] && <p className="mt-1 text-sm text-red-600">{errors[`game${index}Price`]}</p>}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={game.acceptOffers}
                          onChange={(e) => handleGameChange(index, 'acceptOffers', e.target.checked)}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Accept offers
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sales Notes
                      </label>
                      <textarea
                        value={game.saleNotes}
                        onChange={(e) => handleGameChange(index, 'saleNotes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Condition details, terms, etc."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
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
            className={`px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting Games...' : 'Submit My Games!'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FreePlayFloridaSubmissionForm;
