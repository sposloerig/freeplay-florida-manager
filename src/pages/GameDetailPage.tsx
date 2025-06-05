import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import ImageModal from '../components/ImageModal';
import RepairHistory from '../components/RepairHistory';
import GameQRCode from '../components/GameQRCode';
import { createClient } from '@supabase/supabase-js';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Clock, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Check,
  X,
  ArrowLeft,
  Wrench,
  QrCode,
  ClipboardList,
  Lock,
  ImageOff
} from 'lucide-react';
import { Game, Repair } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { games, getGame, deleteGame } = useGameContext();
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  const [mainImageError, setMainImageError] = useState(!game?.images?.[0]);
  
  // Find game by slug (URL-friendly name)
  const game = games.find(g => {
    const gameSlug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return gameSlug === slug;
  });

  useEffect(() => {
    if (!slug) {
      setError('Game ID is missing');
      setLoading(false);
      return;
    }

    if (!game) {
      setError('Game not found');
      setLoading(false);
      return;
    }

    if (isManager) {
      fetchRepairs();
    } else {
      setLoading(false);
    }
  }, [slug, game, isManager]);

  const fetchRepairs = async () => {
    if (!game) return;

    try {
      const { data, error: repairsError } = await supabase
        .from('repairs')
        .select(`
          *,
          parts (
            *,
            vendor:vendors(*)
          )
        `)
        .eq('game_id', game.id)
        .order('created_at', { ascending: false });

      if (repairsError) throw repairsError;

      setRepairs(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      setError('Failed to load repair history');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = () => {
    if (!game) return;
    deleteGame(game.id);
    navigate('/');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Repair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Awaiting Parts':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddRepair = () => {
    if (!game) return;
    navigate(`/repairs/new?gameId=${game.id}`);
  };

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  if (!slug || !game) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {!slug ? 'Invalid Game ID' : 'Game Not Found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {!slug ? 'The game ID is missing or invalid.' : 'The game you\'re looking for doesn\'t exist or has been removed.'}
        </p>
        <Link 
          to="/collection" 
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Collection
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/collection')}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Collection
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Main image */}
          <div className="md:w-1/2 h-64 md:h-auto relative">
            {mainImageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
                <ImageOff size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
                <span className="text-base font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                  Game Image Coming Soon
                </span>
              </div>
            ) : (
              <img 
                src={game.images[0]} 
                alt={game.name}
                className="w-full h-full object-cover"
                onError={() => setMainImageError(true)}
                onClick={() => !mainImageError && setActiveImageIndex(0)}
              />
            )}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(game.status)}`}>
                {game.status}
              </span>
            </div>
          </div>
          
          {/* Game details */}
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {game.name}
              </h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowQRCode(!showQRCode)}
                  aria-label="Show QR Code"
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <QrCode size={20} />
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => navigate(`/edit/${game.id}`)}
                      aria-label="Edit game"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      aria-label="Delete game"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {game.yearMade && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full mr-3">
                    <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Year Made</p>
                    <p>{game.yearMade}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full mr-3">
                  <MapPin size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p>{game.location === 'Other' ? game.otherLocation : game.location}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full mr-3">
                  <Trophy size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Game Type</p>
                  <p>{game.type === 'Other' ? game.otherType : game.type}</p>
                </div>
              </div>
              
              {game.highScore && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-full mr-3">
                    <Trophy size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High Score</p>
                    <p className="font-semibold">{game.highScore.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Condition Notes Section - Only visible to managers */}
            {isManager && game.conditionNotes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <ClipboardList size={18} className="text-indigo-600 dark:text-indigo-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Condition Notes
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {game.conditionNotes}
                </p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                <Clock size={16} className="mr-1" />
                <span>Added: {formatDate(game.dateAdded)}</span>
                {game.dateAdded.toString() !== game.lastUpdated.toString() && (
                  <span className="ml-4">Updated: {formatDate(game.lastUpdated)}</span>
                )}
              </div>
            </div>

            {showQRCode && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <GameQRCode gameId={game.id} gameName={game.name} />
              </div>
            )}
          </div>
        </div>
        
        {/* Image gallery */}
        <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Game Images
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {game.images.map((image, index) => (
              <div 
                key={index}
                className="relative h-48 overflow-hidden rounded-md cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setActiveImageIndex(index)}
              >
                {imageLoadErrors[index] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <ImageOff size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                      Game Image Coming Soon
                    </span>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${game.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => handleImageError(index)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Repair History - Only visible to managers */}
        {isManager ? (
          <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} className="mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : (
              <RepairHistory
                gameId={game.id}
                repairs={repairs}
                onAddRepair={handleAddRepair}
              />
            )}
          </div>
        ) : user && (
          <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
              <Lock size={18} className="mr-2" />
              <p>Repair history is only visible to managers</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 m-4 animate-scaleIn">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Game</h3>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete "{game.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 flex items-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X size={18} className="mr-1" />
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 flex items-center text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <Check size={18} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image modal */}
      {activeImageIndex !== null && (
        <ImageModal
          images={game.images}
          activeIndex={activeImageIndex}
          onClose={() => setActiveImageIndex(null)}
        />
      )}
    </div>
  );
};

export default GameDetailPage;