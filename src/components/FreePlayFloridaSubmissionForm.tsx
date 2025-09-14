import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GameType } from '../types';
import { Upload, AlertTriangle, CheckCircle, Phone, Mail, User, Gamepad2, DollarSign, Settings, Building, Star, Plus, Trash2, Camera, X } from 'lucide-react';

interface GameSubmission {
  name: string;
  type: GameType;
  maker: string;
  forSale: boolean;
  askingPrice?: string;
  acceptOffers?: boolean;
  saleNotes?: string;
  images: File[];
  imageUrls: string[];
  serviceNotes: string;
  allowOthersToService: boolean;
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
    displayContactPublicly: false,
    
    // Games (start with 1, can add more)
    games: [{
      name: '',
      type: 'Pinball' as GameType,
      maker: 'Any',
      forSale: false,
      askingPrice: '',
      acceptOffers: false,
      saleNotes: '',
      images: [],
      imageUrls: [],
      serviceNotes: '',
      allowOthersToService: true
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
          saleNotes: '',
          images: [],
          imageUrls: [],
          serviceNotes: '',
          allowOthersToService: true
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

  const handleImageUpload = (gameIndex: number, files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    const currentGame = formData.games[gameIndex];
    
    // Limit to 3 images per game
    const totalImages = currentGame.images.length + newFiles.length;
    if (totalImages > 3) {
      setErrors(prev => ({ ...prev, [`game${gameIndex}Images`]: 'Maximum 3 images per game' }));
      return;
    }
    
    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== newFiles.length) {
      setErrors(prev => ({ ...prev, [`game${gameIndex}Images`]: 'Only image files under 5MB are allowed' }));
      return;
    }
    
    // Create preview URLs
    const newImageUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      games: prev.games.map((game, index) => 
        index === gameIndex ? {
          ...game,
          images: [...game.images, ...validFiles],
          imageUrls: [...game.imageUrls, ...newImageUrls]
        } : game
      )
    }));
    
    // Clear any previous errors
    if (errors[`game${gameIndex}Images`]) {
      setErrors(prev => ({ ...prev, [`game${gameIndex}Images`]: '' }));
    }
  };

  const removeImage = (gameIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      games: prev.games.map((game, index) => 
        index === gameIndex ? {
          ...game,
          images: game.images.filter((_, idx) => idx !== imageIndex),
          imageUrls: game.imageUrls.filter((_, idx) => idx !== imageIndex)
        } : game
      )
    }));
  };

  const uploadGameImages = async (gameId: string, images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${gameId}_${i + 1}.${fileExt}`;
      const filePath = `game-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
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
        // First, insert the game to get an ID
        const gameData = {
          name: game.name.trim(),
          type: game.type,
          type_other: game.type === 'Other' ? 'Custom' : null,
          
          // Owner information
          owner_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          owner_email: formData.email.trim().toLowerCase(),
          owner_phone: formData.phone.trim(),
            owner_notes: formData.notes ? `Notes: ${formData.notes}` : null,
          display_contact_publicly: formData.displayContactPublicly,
          
          // Service preferences
          allow_others_to_service: game.allowOthersToService,
          service_notes: game.serviceNotes.trim() || null,
          
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

        const { data: insertedGame, error: insertError } = await supabase
          .from('games')
          .insert([gameData])
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }

        // Upload images if any
        if (game.images.length > 0) {
          try {
            const imageUrls = await uploadGameImages(insertedGame.id, game.images);
            
            // Update the game with image URLs
            const { error: updateError } = await supabase
              .from('games')
              .update({ images: imageUrls })
              .eq('id', insertedGame.id);

            if (updateError) {
              console.error('Error updating game with images:', updateError);
              // Don't throw here - game is still submitted, just without images
            }
          } catch (imageError) {
            console.error('Error uploading images for game:', game.name, imageError);
            // Continue without images - don't fail the whole submission
          }
        }
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting games:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error messages
      let errorMessage = 'An error occurred while submitting your games. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Submission failed: ${error.message}`;
      }
      
      setErrors({ submit: errorMessage });
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
          className="px-6 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 transition-colors"
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
            <User className="w-5 h-5 text-fpf-600 dark:text-fpf-400 mr-2" />
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              placeholder="Any special requirements, setup notes, or other information..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.notes.length}/350
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="displayContactPublicly"
                name="displayContactPublicly"
                checked={formData.displayContactPublicly}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-fpf-600 focus:ring-fpf-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label htmlFor="displayContactPublicly" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Display my contact information publicly
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  If checked, your name and contact information will be visible to the public on the marketplace and game detail pages. This allows potential buyers or other participants to contact you directly about your games.
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Games Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Gamepad2 className="w-5 h-5 text-fpf-600 dark:text-fpf-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Games ({formData.games.length}/6)
              </h2>
            </div>
            {formData.games.length < 6 && (
              <button
                type="button"
                onClick={addGame}
                className="flex items-center px-4 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </button>
            )}
          </div>

          {/* Important Reminders */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Important: Please ensure your games are:
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• <strong>In good, clean working condition</strong></li>
                  <li>• <strong>Set up for Free Play Mode</strong> (if possible)</li>
                  <li>• <strong>Have locks and keys</strong> for security</li>
                </ul>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  Games that don't meet these requirements may not be accepted for the event.
                </p>
              </div>
            </div>
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Game Name {index === 0 && '*'}
                    </label>
                    <input
                      type="text"
                      value={game.name}
                      onChange={(e) => handleGameChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
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

                {/* Service Preferences for this game */}
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                  <div className="flex items-center mb-3">
                    <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Service Preferences for {game.name || 'this game'}
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={game.allowOthersToService}
                        onChange={(e) => handleGameChange(index, 'allowOthersToService', e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-fpf-600 focus:ring-fpf-500 border-gray-300 rounded"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Allow others to service this game if issues arise
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          If unchecked, we'll contact you first for any repairs needed during the event.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Service Notes for this game
                      </label>
                      <textarea
                        value={game.serviceNotes}
                        onChange={(e) => handleGameChange(index, 'serviceNotes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Any specific service instructions, known quirks, or special requirements for this game?"
                      />
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
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white ${
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
                          className="mr-2 h-4 w-4 text-fpf-600 focus:ring-fpf-500 border-gray-300 rounded"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        placeholder="Condition details, terms, etc."
                      />
                    </div>
                  </div>
                )}

                {/* Image Upload Section */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Game Photos ({game.images.length}/3)
                    </h4>
                    <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e.target.files)}
                        className="hidden"
                        disabled={game.images.length >= 3}
                      />
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        game.images.length >= 3 
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      }`}>
                        <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {game.images.length >= 3 
                            ? 'Maximum 3 images reached' 
                            : 'Click to upload images (max 3, 5MB each)'
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                    {errors[`game${index}Images`] && (
                      <p className="mt-2 text-sm text-red-600">{errors[`game${index}Images`]}</p>
                    )}
                  </div>

                  {/* Image Previews */}
                  {game.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {game.imageUrls.map((url, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={url}
                            alt={`${game.name} preview ${imgIndex + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, imgIndex)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
            className={`px-8 py-3 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 focus:outline-none focus:ring-2 focus:ring-fpf-500 font-semibold ${
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
