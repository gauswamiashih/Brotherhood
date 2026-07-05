import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-purpleDeep bg-opacity-70 border-t border-luxury-border pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-widest text-gold-gradient font-serif">
              BROTHERHOOD
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Palanpur's premier fashion marketplace, curating the finest clothing boutiques and design houses for an elite, luxury shopping experience.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://www.instagram.com/gauswami_8_07_18" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full border border-luxury-border flex items-center justify-center text-gray-400 hover:text-luxury-gold hover:border-luxury-gold transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-luxury-gold uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">Premium Marketplace</Link>
              </li>
              <li>
                <Link to="/register-shop" className="hover:text-white transition-colors">Register Your Store</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Support & Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Categories */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-luxury-gold uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/marketplace?category=Menswear" className="hover:text-white transition-colors">Menswear</Link>
              </li>
              <li>
                <Link to="/marketplace?category=Womenswear" className="hover:text-white transition-colors">Womenswear</Link>
              </li>
              <li>
                <Link to="/marketplace?category=All%20Wear" className="hover:text-white transition-colors">All Wear Essentials</Link>
              </li>
              <li>
                <Link to="/marketplace?category=Accessories" className="hover:text-white transition-colors">Luxury Accessories</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info (Founder Details) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-luxury-gold uppercase mb-4">Founder Headquarters</h4>
            <div className="flex items-start text-xs text-gray-400 space-x-2">
              <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
              <span>Palanpur, Gujarat, India</span>
            </div>
            <div className="flex items-center text-xs text-gray-400 space-x-2">
              <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
              <a href="tel:+919664592743" className="hover:text-white transition-colors">+91 96645 92743</a>
            </div>
            <div className="flex items-center text-xs text-gray-400 space-x-2">
              <Mail className="w-4 h-4 text-luxury-gold shrink-0" />
              <a href="mailto:gauswamiashish760@gmail.com" className="hover:text-white transition-colors">gauswamiashish760@gmail.com</a>
            </div>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="border-t border-luxury-border border-opacity-40 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} Brotherhood Clothing. Crafted for Palanpur's Premium Outlets.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
