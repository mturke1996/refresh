import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string;
  title: string;
  onClose: () => void;
}

export default function ImageLightbox({ imageUrl, title, onClose }: ImageLightboxProps) {
  useEffect(() => {
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    // Close on Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full"
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
          />
          <p className="text-white text-center mt-4 text-lg font-medium">
            {title}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

