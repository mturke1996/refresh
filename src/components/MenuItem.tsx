import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, X, ZoomIn } from 'lucide-react';
import { MenuItem as MenuItemType } from '../types';
import { useCartStore } from '../store/cartStore';
import { formatPrice, calculateDiscountedPrice } from '../utils/formatters';
import toast from 'react-hot-toast';
import ImageLightbox from './ImageLightbox';

interface MenuItemProps {
  item: MenuItemType;
  index: number;
}

export default function MenuItem({ item, index }: MenuItemProps) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!item.available) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }

    addItem(item);
    toast.success('تمت الإضافة إلى السلة');
  };

  const discountedPrice = calculateDiscountedPrice(item.price, item.discountPercent);
  const hasDiscount = item.discountPercent && item.discountPercent > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="card group relative overflow-hidden"
      >
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {item.isNew && (
            <span className="px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
              جديد
            </span>
          )}
          {hasDiscount && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              خصم {item.discountPercent}%
            </span>
          )}
          {!item.available && (
            <span className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
              <X className="w-3 h-3" />
              غير متوفر
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative aspect-product bg-gray-200 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${
              item.available
                ? 'group-hover:scale-110'
                : 'grayscale opacity-50'
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Zoom button */}
          <button
            onClick={() => setShowLightbox(true)}
            className="absolute top-3 left-3 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="تكبير الصورة"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className={`p-3 rounded-xl transition-all ${
                item.available
                  ? 'bg-black text-white hover:bg-gray-800 active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label="أضف إلى السلة"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox */}
      {showLightbox && (
        <ImageLightbox
          imageUrl={item.imageUrl}
          title={item.name}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

