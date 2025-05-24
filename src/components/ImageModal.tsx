import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalProps {
  images: string[];
  activeIndex: number;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, activeIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  // Close the modal when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
        
        <div className="relative">
          <img 
            src={images[currentIndex]} 
            alt={`Game image ${currentIndex + 1}`} 
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
          
          <button 
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="mt-4 flex justify-center">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 mx-1 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;