import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import ImageModal from '../components/ImageModal';
import RepairHistory from '../components/RepairHistory';
import GameQRCode from '../components/GameQRCode';
import { supabase } from '../lib/supabase';
import { 
  Calendar, 
  Trophy, 
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
  ImageOff,
  ChevronUp,
  ChevronDown,
  Mail,
  Phone,
  User,
  DollarSign,
  ShoppingCart,
  Tag
} from 'lucide-react';
import { Game, Repair } from '../types';

const GameDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { games, getGame, deleteGame } = useGameContext();
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  
  // Find game by slug (URL-friendly name) - Move this before any state that depends on it
  const game = games.find(g => {
    const gameSlug = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return gameSlug === slug;
  });
  
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [imageGalleryVisible, setImageGalleryVisible] = useState(true);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<number, boolean>>({});
  const [mainImageError, setMainImageError] = useState(!game?.images?.[0]);
  const [deleting, setDeleting] = useState(false);

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

    if (user) {
      fetchRepairs();
    } else {
      setLoading(false);
    }
  }, [slug, game, user]);

  const fetchRepairs = async () => {
    if (!game) return;

    try {
      const { data, error: repairsError } = await supabase
        .from('repairs')
        .select(`
          *,
          game:games(
            id,
            name
          )
        `)
        .eq('game_id', game.id)
        .order('resolved', { ascending: true })
        .order('created_at', { ascending: false });

      if (repairsError) throw repairsError;

      // Transform the data to match our interface
      const transformedRepairs: Repair[] = (data || []).map(repair => ({
        id: repair.id,
        gameId: repair.game_id,
        comment: repair.comment,
        resolved: repair.resolved || false,
        resolvedAt: repair.resolved_at,
        createdAt: repair.created_at,
        updatedAt: repair.updated_at,
        game: repair.game
      }));

      setRepairs(transformedRepairs);
      setError(null);
    } catch (error) {
      console.error('Error fetching repairs:', error);
      setError('Failed to load repair history');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!game) return;
    
    setDeleting(true);
    try {
      await deleteGame(game.id);
      navigate('/collection');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
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
          className="inline-flex items-center px-4 py-2 bg-fpf-600 text-white rounded-md hover:bg-fpf-700 transition-colors"
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
          className="inline-flex items-center text-fpf-600 dark:text-fpf-400 hover:text-fpf-800 dark:hover:text-fpf-300"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back to Collection
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Main image */}
          <div className="md:w-1/2 h-64 md:h-auto relative cursor-pointer" onClick={() => game.images.length > 0 && setActiveImageIndex(0)}>
            {mainImageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
                <ImageOff size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
                <span className="text-base font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                  Game Image Coming Soon
                </span>
              </div>
            ) : game.images && game.images.length > 0 ? (
              <img 
                src={game.images[0]} 
                alt={game.name}
                className="w-full h-full object-cover"
                onError={() => setMainImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
                <ImageOff size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
                <span className="text-base font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                  No Images Available
                </span>
              </div>
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
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-fpf-600 dark:hover:text-fpf-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <QrCode size={20} />
                </button>
                {user && (
                  <>
                    <button
                      onClick={() => navigate(`/edit/${game.id}`)}
                      aria-label="Edit game"
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-fpf-600 dark:hover:text-fpf-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
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
                  <div className="bg-fpf-100 dark:bg-fpf-900/40 p-2 rounded-full mr-3">
                    <Calendar size={18} className="text-fpf-600 dark:text-fpf-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Year Made</p>
                    <p>{game.yearMade}</p>
                  </div>
                </div>
              )}
              
              
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="bg-fpf-100 dark:bg-fpf-900/40 p-2 rounded-full mr-3">
                  <Trophy size={18} className="text-fpf-600 dark:text-fpf-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Game Type</p>
                  <p>{game.type === 'Other' ? game.otherType : game.type}</p>
                </div>
              </div>
              
              {game.highScore && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <div className="bg-fpf-100 dark:bg-fpf-900/40 p-2 rounded-full mr-3">
                    <Trophy size={18} className="text-fpf-600 dark:text-fpf-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High Score</p>
                    <p className="font-semibold">{game.highScore.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sales Information Section - Only visible when game is for sale */}
            {game.forSale && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <ShoppingCart size={18} className="text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    For Sale
                  </h3>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <DollarSign size={16} className="text-green-600 dark:text-green-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Asking Price</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {game.askingPrice ? `$${game.askingPrice.toLocaleString()}` : 'Price on request'}
                        </p>
                      </div>
                    </div>
                    {game.acceptOffers && (
                      <div className="flex items-center">
                        <Tag size={16} className="text-green-600 dark:text-green-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Offers</p>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            Accepts Offers
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {game.saleConditionNotes && (
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Sale Condition:</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {game.saleConditionNotes}
                      </p>
                    </div>
                  )}
                  
                  {game.missingParts && game.missingParts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <strong>Missing Parts:</strong>
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                        {game.missingParts.map((part, index) => (
                          <li key={index}>{part}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {game.saleNotes && (
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <strong>Additional Notes:</strong>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {game.saleNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Condition Notes Section - Only visible to authenticated users */}
            {user && game.conditionNotes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <ClipboardList size={18} className="text-fpf-600 dark:text-fpf-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Condition Notes
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {game.conditionNotes}
                </p>
              </div>
            )}

            {/* Owner Contact Information - Only visible when owner allows public display */}
            {game.displayContactPublicly && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-3">
                  <User size={18} className="text-fpf-600 dark:text-fpf-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Contact Owner
                  </h3>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    The owner has made their contact information public. You can reach out directly:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <User size={16} className="mr-2 text-fpf-600 dark:text-fpf-400" />
                      <span className="font-medium">{game.ownerName}</span>
                    </div>
                    {game.ownerEmail && (
                      <div className="flex items-center">
                        <Mail size={16} className="mr-2 text-fpf-600 dark:text-fpf-400" />
                        <a 
                          href={`mailto:${game.ownerEmail}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {game.ownerEmail}
                        </a>
                      </div>
                    )}
                    {game.ownerPhone && (
                      <div className="flex items-center">
                        <Phone size={16} className="mr-2 text-fpf-600 dark:text-fpf-400" />
                        <a 
                          href={`tel:${game.ownerPhone}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {game.ownerPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            

            {showQRCode && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <GameQRCode 
                  gameId={game.id} 
                  gameName={game.name} 
                  zone={game.zone}
                  printable={isManager}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Image gallery */}
        {game.images && game.images.length > 0 && (
          <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Game Images ({game.images.length})
              </h2>
              <button
                onClick={() => setImageGalleryVisible(!imageGalleryVisible)}
                className="flex items-center text-sm text-fpf-600 dark:text-fpf-400 hover:text-fpf-800 dark:hover:text-fpf-300 px-3 py-1 border border-indigo-200 dark:border-indigo-800 rounded-md"
              >
                {imageGalleryVisible ? 'Hide Gallery' : 'Show All Images'} 
                {imageGalleryVisible ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </button>
            </div>
            
            {imageGalleryVisible && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {game.images.map((image, index) => (
                  <div 
                    key={index}
                    className="relative h-48 overflow-hidden rounded-md cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => setActiveImageIndex(index)}
                  >
                    {imageLoadErrors[index] || !image ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <ImageOff size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-4">
                          Image Failed to Load
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
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Repair History - Only visible to authenticated users */}
        {user ? (
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
                onRepairUpdated={fetchRepairs}
              />
            )}
          </div>
        ) : (
          <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
              <Lock size={18} className="mr-2" />
              <p>Repair history is only visible to staff members</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4 p-6 animate-scaleIn">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Game</h3>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete "{game.name}"? This action cannot be undone and will also delete all associated repair records.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 flex items-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={18} className="mr-1" />
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 flex items-center text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Check size={18} className="mr-1" />
                    Delete
                  </>
                )}
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