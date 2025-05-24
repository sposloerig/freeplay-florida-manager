import React, { useState, useEffect } from 'react';
import { Game, GameType, GameLocation, GameStatus } from '../types';
import { useGameContext } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Upload, Loader2 } from 'lucide-react';
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

const GameForm: React.FC<GameFormProps> = ({ editMode = false, gameId }) => {
  const { addGame, updateGame, getGame } = useGameContext();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const defaultFormState = {
    name: '',
    type: 'Arcade' as GameType,
    otherType: '',
    location: 'Replay' as GameLocation,
    otherLocation: '',
    status: 'Operational' as GameStatus,
    conditionNotes: '',
    highScore: undefined as number | undefined,
    yearMade: undefined as number | undefined,
    images: [] as string[],
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
        });
      } else {
        navigate('/');
      }
    }
  }, [editMode, gameId, getGame, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
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

    try {
      setUploading(true);
      const file = e.target.files[0];
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

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, publicUrl],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({
        ...prev,
        upload: 'Failed to upload image. Please try again.',
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
        updateGame(gameId, {
          ...formData,
        });
        navigate(`/game/${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
      } else {
        addGame({
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
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="Operational">Operational</option>
              <option value="In Repair">In Repair</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
            </select>
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
                className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
                  ${uploading 
                    ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700' 
                    : 'border-indigo-300 hover:border-indigo-400 dark:border-indigo-600 dark:hover:border-indigo-500'
                  }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-indigo-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload an image</p>
                  </div>
                )}
                <input
                  id="image-upload"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Game image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

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