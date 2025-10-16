import { motion } from 'framer-motion';
import { useFeaturedItems } from '../hooks/useFirestore';
import MenuItem from './MenuItem';
import SkeletonLoader from './SkeletonLoader';

export default function FeaturedSection() {
  const { data: offers, loading: offersLoading } = useFeaturedItems('offer');
  const { data: newItems, loading: newLoading } = useFeaturedItems('new');

  const hasOffers = offers.length > 0;
  const hasNewItems = newItems.length > 0;

  if (!hasOffers && !hasNewItems && !offersLoading && !newLoading) {
    return null;
  }

  return (
    <section id="featured" className="section-padding bg-white">
      <div className="container-custom space-y-16">
        {/* Offers Section */}
        {(hasOffers || offersLoading) && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">العروض الخاصة</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                استفد من عروضنا المميزة على مجموعة مختارة من المنتجات
              </p>
            </motion.div>

            {offersLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((item, index) => (
                  <MenuItem key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Items Section */}
        {(hasNewItems || newLoading) && (
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">الجديد في القائمة</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                اكتشف أحدث إضافاتنا من المشروبات والحلويات اللذيذة
              </p>
            </motion.div>

            {newLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newItems.map((item, index) => (
                  <MenuItem key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

