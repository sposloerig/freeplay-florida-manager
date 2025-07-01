import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Update the interface to include an optional onImageChange callback
interface ImageModalProps {
  images: string[];
  activeIndex: number;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, activeIndex, onClose, onImageChange }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    if (onImageChange) onImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    if (onImageChange) onImageChange(newIndex);
  };

  // Close the modal when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touch = e.changedTouches[0];
    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;

    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;
    
    // Check if horizontal swipe is more significant than vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left, show next image
        handleNext();
      } else {
        // Swiped right, show previous image
        handlePrevious();
      }
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl p-2 md:p-4">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <div 
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img 
            src={images[currentIndex]} 
            alt={`Game image ${currentIndex + 1}`} 
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg select-none"
          />
          
          <button 
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Previous image" 
            disabled={images.length <= 1}
            style={{ opacity: images.length <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Next image"
            disabled={images.length <= 1}
            style={{ opacity: images.length <= 1 ? 0.5 : 1 }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="mt-4 flex justify-center">
          {images.length > 1 && 
            images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  if (onImageChange) onImageChange(index);
                }}
                className={`w-2 h-2 mx-1 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))
          }
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm">
          <div>{currentIndex + 1} / {images.length}</div>
          {images.length > 1 && (
            <div className="text-xs text-white/70 mt-1 md:hidden">
              Swipe left or right to navigate
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;