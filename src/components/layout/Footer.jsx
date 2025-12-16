import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Utensils } from 'lucide-react';

/**
 * Footer Component
 * Displays site branding and functional navigation links.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4 text-white w-fit hover:opacity-80 transition">
            <Utensils className="text-orange-500" />
            <span className="text-xl font-serif font-bold">Chef'sTable</span>
          </Link>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Your daily source for culinary inspiration. Discover new flavors, save your favorite recipes, and master the kitchen.
          </p>
        </div>
        
        {/* Links Column */}
        <div>
          <h3 className="text-white font-bold mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-orange-500 transition block">
                Trending Recipes
              </Link>
            </li>
            <li>
              <Link to="/search" className="hover:text-orange-500 transition block">
                Browse All
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-orange-500 transition block">
                My Favorites
              </Link>
            </li>
            <li>
              <Link to="/create" className="hover:text-orange-500 transition block">
                Submit a Recipe
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Column */}
        <div>
          <h3 className="text-white font-bold mb-4">Connect</h3>
          <div className="flex gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white text-gray-400 transition"
              aria-label="Github"
            >
              <Github className="w-5 h-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-white text-gray-400 transition"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
        © {currentYear} Chef'sTable Inc. All rights reserved.
      </div>
    </footer>
  );
}