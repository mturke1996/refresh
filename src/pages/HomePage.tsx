import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import FeaturedSection from '../components/FeaturedSection';
import ReviewsSection from '../components/ReviewsSection';
import JobsSection from '../components/JobsSection';
import ContactMessagesSection from '../components/ContactMessagesSection';
import Footer from '../components/Footer';
import Cart from '../components/Cart';

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <Hero />
      <MenuSection />
      <FeaturedSection />
      <ReviewsSection />
      <JobsSection />
      <ContactMessagesSection />
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
