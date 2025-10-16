import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCategories, useMenuItems } from '../hooks/useFirestore';
import MenuItem from './MenuItem';
import SkeletonLoader from './SkeletonLoader';

export default function MenuSection() {
  const { data: categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { data: items, loading: itemsLoading } = useMenuItems(selectedCategory);

  if (categoriesLoading) {
    return (
      <section id="menu" className="section-padding bg-gray-50">
        <div className="container-custom">
          <SkeletonLoader type="menu" />
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">قائمتنا</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            اختر من بين مجموعة متنوعة من المشروبات والحلويات اللذيذة
          </p>
        </motion.div>

        {/* Category Tabs - Mobile Optimized */}
        <div className="mb-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-all shadow-sm touch-manipulation text-sm sm:text-base flex items-center gap-2 group ${
                selectedCategory === undefined
                  ? 'bg-gradient-to-r from-black to-gray-800 text-white scale-105 shadow-lg'
                  : 'bg-white text-black hover:bg-gray-100 active:scale-95 border border-gray-200'
              }`}
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>الكل</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium whitespace-nowrap transition-all shadow-sm touch-manipulation text-sm sm:text-base flex items-center gap-2 group ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-black to-gray-800 text-white scale-105 shadow-lg'
                    : 'bg-white text-black hover:bg-gray-100 active:scale-95 border border-gray-200'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          {/* Scroll Indicator for Mobile */}
          <div className="text-center mt-2 text-xs text-gray-400 sm:hidden flex items-center justify-center gap-2">
            <ChevronLeft className="w-3 h-3" />
            اسحب لمشاهدة المزيد
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Menu Items Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} type="card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">لا توجد منتجات في هذه الفئة</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <MenuItem key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
