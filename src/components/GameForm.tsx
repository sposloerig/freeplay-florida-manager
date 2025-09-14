import React, { useState, useEffect } from 'react';
import { Game, GameType, GameLocation, GameStatus } from '../types';
import { useGameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Upload, Loader2, DollarSign, Plus, Trash2, MessageSquare, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import imageCompression from 'browser-image-compression';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface GameFormProps {
  editMode?: boolean;
  gameId?: string;
}

interface BuyerInquiry {
  id: string;
  game_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  offer_amount?: number;
  message: string;
  status: string;
  created_at: string;
  game?: { name: string };
}

const GameForm: React.FC<GameFormProps> = ({ editMode = false, gameId }) => {
  const { addGame, updateGame, getGame } = useGameContext();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [showSalesSection, setShowSalesSection] = useState(false);
  const [showInquiriesSection, setShowInquiriesSection] = useState(false);
  const [inquiries, setInquiries] = useState<BuyerInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [newPart, setNewPart] = useState('');

  const defaultFormState = {
    name: '',
    type: 'Arcade' as GameType,
    otherType: '',
    location: 'Main Hall' as GameLocation,
    otherLocation: '',
    status: 'Operational' as GameStatus,
    zone: '',
    conditionNotes: '',
    highScore: undefined as number | undefined,
    yearMade: undefined as number | undefined,
    images: [] as string[],
    // Sales fields
    askingPrice: undefined as number | undefined,
    forSale: false,
    saleConditionNotes: '',
    missingParts: [] as string[],
    saleNotes: '',
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editMode && gameId) {
      const game = getGame(gameId);
      if (game) {
        setFormData({
          name: game.name,
          type: game.type,
          otherType: game.otherType || '',
          location: game.location,
          otherLocation: game.otherLocation || '',
          status: game.status,
          conditionNotes: game.conditionNotes || '',
          highScore: game.highScore,
          yearMade: game.yearMade,
          images: game.images || [],
          // Sales fields
          askingPrice: game.askingPrice,
          forSale: game.forSale !== false,
          saleConditionNotes: game.saleConditionNotes || '',
          missingParts: game.missingParts || [],
          saleNotes: game.saleNotes || '',
        });
        // If there are sales details, expand the sales section
        if (game.askingPrice || game.forSale || game.saleConditionNotes || game.missingParts?.length || game.saleNotes) {
          setShowSalesSection(true);
        }
      } else {
        navigate('/');
      }
    }
  }, [editMode, gameId, getGame, navigate]);

  const fetchInquiries = async () => {
    if (!editMode || !gameId) return;
    
    setLoadingInquiries(true);
    try {
      const { data, error } = await supabase
        .from('buyer_inquiries')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Fetch inquiries when showing inquiries section
  useEffect(() => {
    if (showInquiriesSection && editMode && gameId) {
      fetchInquiries();
    }
  }, [showInquiriesSection, editMode, gameId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handlePriceChange = (value: string) => {
    if (value === '' || value === null || value === undefined) {
      setFormData({ ...formData, askingPrice: undefined });
    } else {
      const numValue = parseFloat(value);
      setFormData({ 
        ...formData, 
        askingPrice: isNaN(numValue) ? undefined : numValue 
      });
    }
  };

  const addMissingPart = () => {
    if (!newPart.trim()) return;
    
    setFormData({
      ...formData,
      missingParts: [...formData.missingParts, newPart.trim()]
    });
    setNewPart('');
  };

  const removeMissingPart = (index: number) => {
    const parts = [...formData.missingParts];
    parts.splice(index, 1);
    setFormData({
      ...formData,
      missingParts: parts
    });
  };

  const updateInquiryStatus = async (inquiryId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('buyer_inquiries')
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;
      await fetchInquiries();
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry status');
    }
  };

  const getInquiryStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'responded':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const newFiles = Array.from(e.target.files);
    const totalFiles = newFiles.length;
    let completedUploads = 0;

    try {
      setUploading(true);
      setErrors({});
      
      // Process all selected files
      const uploadPromises = newFiles.map(async (file) => {
        const compressedFile = await compressImage(file);
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('game-images')
          .upload(filePath, compressedFile);
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('game-images')
          .getPublicUrl(filePath);
        
        completedUploads++;
        
        return publicUrl;
      });
      
      // Wait for all uploads to complete
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Add all new images to the existing array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        upload: 'Failed to upload one or more images. Please try again.',
      }));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = formData.images[index];
    const fileName = imageUrl.split('/').pop();

    try {
      if (fileName) {
        await supabase.storage
          .from('game-images')
          .remove([fileName]);
      }

      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages,
      }));
    } catch (error) {
      console.error('Error removing image:', error);
      setErrors(prev => ({
        ...prev,
        upload: 'Failed to remove image. Please try again.',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Game name is required';
    }

    if (formData.type === 'Other' && !formData.otherType.trim()) {
      newErrors.otherType = 'Please specify the game type';
    }

    if (formData.location === 'Other' && !formData.otherLocation.trim()) {
      newErrors.otherLocation = 'Please specify the location';
    }

    if (formData.yearMade && (formData.yearMade < 1900 || formData.yearMade > new Date().getFullYear())) {
      newErrors.yearMade = `Year must be between 1900 and ${new Date().getFullYear()}`;
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
      if (editMode && gameId) {
        await updateGame(gameId, {
          ...formData,
        });
        navigate(`/game/${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${formData.location.toLowerCase()}`);
      } else {
        await addGame({
          ...formData,
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving game:', error);
      setErrors({
        ...errors,
        submit: 'An error occurred while saving the game. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {editMode ? 'Edit Game' : 'Add New Game'}
      </h2>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
          <span>{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Name */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Game Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.name ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          {/* Game Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Game Type*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="Arcade">Arcade</option>
              <option value="Pinball">Pinball</option>
              <option value="Skeeball">Skeeball</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Other Type (conditional) */}
          {formData.type === 'Other' && (
            <div>
              <label htmlFor="otherType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specify Type*
              </label>
              <input
                type="text"
                id="otherType"
                name="otherType"
                value={formData.otherType}
                onChange={handleChange}
                placeholder="Specify game type"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.otherType ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-gray-300'
                }`}
              />
              {errors.otherType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.otherType}</p>}
            </div>
          )}

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location*
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="Replay">Replay</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Other Location (conditional) */}
          {formData.location === 'Other' && (
            <div>
              <label htmlFor="otherLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specify Location*
              </label>
              <input
                type="text"
                id="otherLocation"
                name="otherLocation"
                value={formData.otherLocation}
                onChange={handleChange}
                placeholder="Specify location"
                className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  errors.otherLocation ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-gray-300'
                }`}
              />
              {errors.otherLocation && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.otherLocation}</p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status*
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="Operational">Operational</option>
              <option value="In Repair">In Repair</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
            </select>
          </div>

          {/* Zone Assignment (Admin Only) */}
          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zone Assignment
            </label>
            <select
              id="zone"
              name="zone"
              value={formData.zone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fpf-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">No Zone Assigned</option>
              <option value="Zone 1">Zone 1</option>
              <option value="Zone 2">Zone 2</option>
              <option value="Zone 3">Zone 3</option>
              <option value="Zone 4">Zone 4</option>
              <option value="Zone 5">Zone 5</option>
              <option value="Zone 6">Zone 6</option>
              <option value="Zone 7">Zone 7</option>
              <option value="Zone 8">Zone 8</option>
              <option value="Zone 9">Zone 9</option>
              <option value="Zone 10">Zone 10</option>
              <option value="Zone 11">Zone 11</option>
              <option value="Zone 12">Zone 12</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Assign this game to a specific zone for the event layout
            </p>
          </div>

          {/* Year Made */}
          <div>
            <label htmlFor="yearMade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year Made
            </label>
            <input
              type="number"
              id="yearMade"
              name="yearMade"
              value={formData.yearMade || ''}
              onChange={handleChange}
              placeholder="e.g., 1985"
              className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                errors.yearMade ? 'border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-900/20' : 'border-gray-300'
              }`}
            />
            {errors.yearMade && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.yearMade}</p>}
          </div>

          {/* High Score */}
          <div>
            <label htmlFor="highScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              High Score
            </label>
            <input
              type="number"
              id="highScore"
              name="highScore"
              value={formData.highScore || ''}
              onChange={handleChange}
              placeholder="e.g., 1000000"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        {/* Condition Notes */}
        <div>
          <label htmlFor="conditionNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Condition Notes
          </label>
          <textarea
            id="conditionNotes"
            name="conditionNotes"
            value={formData.conditionNotes}
            onChange={handleChange}
            rows={4}
            placeholder="Enter any notes about the game's condition..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Images</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (Optional)
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer mb-4
                  ${uploading 
                    ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700' 
                    : 'border-indigo-300 hover:border-indigo-400 dark:border-indigo-600 dark:hover:border-indigo-500'
                  }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Uploading images...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-indigo-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload images</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {formData.images.length > 0 
                        ? `${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} selected` 
                        : 'Select multiple files by holding Ctrl/Cmd'}
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  multiple
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {errors.upload && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.upload}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {formData.images && formData.images.length > 0 ? formData.images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Game image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Image {index + 1}
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-4 text-gray-500 dark:text-gray-400">
                  No images uploaded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales Management Section */}
        <div className="border-t pt-6">
          <button
            type="button"
            onClick={() => setShowSalesSection(!showSalesSection)}
            className="flex items-center justify-between w-full p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <div className="flex items-center">
              <DollarSign className="mr-3 text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Sales Management
              </span>
            </div>
            {showSalesSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showSalesSection && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Configure pricing and sales details. Only games marked "Available for Sale" will appear on the public sales page.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="forSale"
                      checked={formData.forSale}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Available for Sale
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Uncheck to temporarily remove from sales page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Asking Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.askingPrice || ''}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Leave empty for 'Make Offer'"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Clear this field to show "Make Offer" instead of a price
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sale Condition Notes
                </label>
                <textarea
                  name="saleConditionNotes"
                  value={formData.saleConditionNotes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Detailed condition information for buyers..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Missing Parts
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPart}
                      onChange={(e) => setNewPart(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="Add missing part..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMissingPart())}
                    />
                    <button
                      type="button"
                      onClick={addMissingPart}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.missingParts.map((part, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 p-2 rounded">
                        <span className="text-sm">{part}</span>
                        <button
                          type="button"
                          onClick={() => removeMissingPart(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Sale Notes
                </label>
                <textarea
                  name="saleNotes"
                  value={formData.saleNotes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Any additional information for buyers..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Buyer Inquiries Section - Only show in edit mode */}
        {editMode && gameId && (
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={() => setShowInquiriesSection(!showInquiriesSection)}
              className="flex items-center justify-between w-full p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="mr-3 text-green-600 dark:text-green-400" size={20} />
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  Buyer Inquiries
                  {inquiries.length > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                      {inquiries.filter(i => i.status === 'pending').length} pending
                    </span>
                  )}
                </span>
              </div>
              {showInquiriesSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {showInquiriesSection && (
              <div className="mt-4 space-y-4">
                {loadingInquiries ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No buyer inquiries yet.</p>
                  </div>
                ) : (
                  inquiries.map(inquiry => (
                    <div key={inquiry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            {inquiry.buyer_name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {inquiry.buyer_email}
                          </p>
                          {inquiry.buyer_phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Phone: {inquiry.buyer_phone}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getInquiryStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </div>

                      {inquiry.offer_amount && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Offer: ${inquiry.offer_amount.toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {inquiry.message}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => updateInquiryStatus(inquiry.id, 'responded')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Mark Responded
                        </button>
                        <button
                          type="button"
                          onClick={() => updateInquiryStatus(inquiry.id, 'accepted')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => updateInquiryStatus(inquiry.id, 'declined')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(editMode && gameId ? `/game/${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '/')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              (isSubmitting || uploading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : editMode ? 'Update Game' : 'Add Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameForm;