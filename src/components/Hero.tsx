import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Import social media icons - using SVG for Snapchat and TikTok
const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const SnapchatIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.498.011.047.031.097.059.145.184.314.421.555.665.788.288.276.591.553.776.932.283.601.157 1.279-.351 1.804-.519.537-1.327.851-2.13.851-.137 0-.272-.014-.407-.036-.002.014-.004.028-.004.042 0 .075.016.15.05.225.049.11.125.222.22.334.16.19.357.384.555.577l.019.018c.276.263.545.516.754.816.28.403.458.895.458 1.412 0 .287-.049.568-.146.839-.41 1.149-1.566 1.902-3.002 1.955l-.23.007c-.75 0-1.47-.109-2.144-.309-.584-.173-1.095-.28-1.602-.28-.515 0-1.034.11-1.627.287-.653.195-1.371.301-2.118.301-.028 0-.056 0-.084-.001-1.479-.062-2.655-.838-3.053-2.008-.087-.258-.13-.526-.13-.803 0-.517.178-1.009.458-1.412.209-.3.478-.553.754-.816l.019-.018c.198-.193.395-.387.555-.577.095-.112.171-.224.22-.334.034-.075.05-.15.05-.225 0-.014-.002-.028-.004-.042-.135.022-.27.036-.407.036-.803 0-1.611-.314-2.13-.851-.508-.525-.634-1.203-.351-1.804.185-.379.488-.656.776-.932.244-.233.481-.474.665-.788.028-.048.048-.098.059-.145-.008-.153-.018-.318-.03-.498l-.003-.06c-.104-1.628-.23-3.654.299-4.847 1.583-3.545 4.94-3.821 5.93-3.821zm0-0.793C11.113 0 7.339.276 5.55 4.177c-.595 1.341-.45 3.537-.339 5.255-.007.105-.014.204-.021.298-.412.732-1.271 1.266-1.904 1.827-.242.215-.469.419-.656.639-.427.509-.686 1.155-.686 1.852 0 .458.097.901.283 1.31.653 1.437 2.228 2.334 3.946 2.334.177 0 .356-.012.536-.037.01.072.015.145.015.218 0 .31-.072.616-.208.899-.203.422-.516.807-.854 1.179-.144.159-.294.314-.439.468-.232.246-.456.479-.626.747-.368.581-.559 1.245-.559 1.926 0 .438.069.867.206 1.281.576 1.733 2.298 2.827 4.486 2.895.031.001.061.001.092.001.907 0 1.711-.12 2.456-.367.65-.215 1.23-.322 1.77-.322.531 0 1.103.105 1.745.32.746.25 1.552.371 2.463.371.031 0 .062 0 .092-.001 2.188-.068 3.91-1.162 4.486-2.895.137-.414.206-.843.206-1.281 0-.681-.191-1.345-.559-1.926-.17-.268-.394-.501-.626-.747-.145-.154-.295-.309-.439-.468-.338-.372-.651-.757-.854-1.179-.136-.283-.208-.589-.208-.899 0-.073.005-.146.015-.218.18.025.359.037.536.037 1.718 0 3.293-.897 3.946-2.334.186-.409.283-.852.283-1.31 0-.697-.259-1.343-.686-1.852-.187-.22-.414-.424-.656-.639-.633-.561-1.492-1.095-1.904-1.827-.007-.094-.014-.193-.021-.298.111-1.718.256-3.914-.339-5.255C16.661.276 12.887 0 11.794 0h.412z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1920&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=80',
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images] = useState(DEFAULT_IMAGES);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    menuSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const socialLinks = [
    {
      name: 'Instagram',
      icon: InstagramIcon,
      url: settings?.socialMedia?.instagram || 'https://instagram.com/refresh_cafe',
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      hoverColor: 'hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
    },
    {
      name: 'Facebook',
      icon: FacebookIcon,
      url: settings?.socialMedia?.facebook || 'https://facebook.com/refresh.cafe',
      color: 'bg-gradient-to-br from-blue-600 to-blue-500',
      hoverColor: 'hover:from-blue-700 hover:to-blue-600',
    },
    {
      name: 'Snapchat',
      icon: SnapchatIcon,
      url: settings?.socialMedia?.snapchat || 'https://snapchat.com/add/refresh_cafe',
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-300',
      hoverColor: 'hover:from-yellow-500 hover:to-yellow-400',
    },
    {
      name: 'TikTok',
      icon: TikTokIcon,
      url: settings?.socialMedia?.tiktok || 'https://tiktok.com/@refresh_cafe',
      color: 'bg-gradient-to-br from-gray-900 via-pink-600 to-cyan-400',
      hoverColor: 'hover:from-black hover:via-pink-700 hover:to-cyan-500',
    },
  ];

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Carousel Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-6 max-w-4xl"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight drop-shadow-2xl">
            Refresh
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto drop-shadow-lg">
            استمتع بأفضل القهوة والمشروبات في أجواء مريحة ومميزة
          </p>
          <motion.button
            onClick={scrollToMenu}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-4 bg-white text-black rounded-xl font-medium text-lg hover:bg-gray-100 transition-all shadow-xl"
          >
            اطلع على القائمة
          </motion.button>

          {/* Social Media Icons - Colorful */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-3 mt-8 pt-4"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 ${social.color} ${social.hoverColor} rounded-xl shadow-lg transition-all backdrop-blur-sm border border-white/20 group`}
                title={social.name}
              >
                <social.icon />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
