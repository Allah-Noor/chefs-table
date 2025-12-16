import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, X, Utensils, LogOut, Heart, 
  ChevronDown, LayoutDashboard, PlusCircle, 
  Calendar 
} from 'lucide-react';
import Button from '../ui/Button';

// Static categories configuration for the dropdown menus
const CATEGORIES = [
  { name: 'Beef', path: 'Beef' },
  { name: 'Chicken', path: 'Chicken' },
  { name: 'Seafood', path: 'Seafood' },
  { name: 'Vegetarian', path: 'Vegetarian' },
  { name: 'Breakfast', path: 'Breakfast' },
  { name: 'Dessert', path: 'Dessert' },
  { name: 'Pasta', path: 'Pasta' },
];

/**
 * Navbar Component
 * Handles the main site navigation, including responsive mobile menus,
 * category dropdowns, and authenticated user controls.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);      // Mobile menu state
  const [isUserOpen, setIsUserOpen] = useState(false); // User profile dropdown state
  const [isCatOpen, setIsCatOpen] = useState(false);   // Categories dropdown state
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef(null); 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); 
      setIsUserOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/search?q=${category}`);
    // Close all menus upon selection to clear the view
    setIsCatOpen(false); 
    setIsOpen(false); 
  };

  // Event listener to close dropdowns when clicking outside the navbar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsUserOpen(false);
        setIsCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navClasses = "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md";

  return (
    <nav className={navClasses} ref={navRef}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* --- Logo --- */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-gray-900">
          <Utensils className="text-orange-600" />
          <span>Chef'sTable</span>
        </Link>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition">Home</Link>
          
          {/* Categories Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsCatOpen(!isCatOpen)}
              className={`text-sm font-medium transition flex items-center gap-1 ${isCatOpen ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'}`}
            >
              Categories <ChevronDown size={14} className={`transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs text-gray-400 font-medium uppercase">Popular</p>
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-2"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated User Controls */}
          {currentUser ? (
            <>
              <Link to="/favorites" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition flex items-center gap-1">
                <Heart size={18} /> Favorites
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 pl-6 border-l border-gray-200 hover:opacity-80 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border border-orange-200 overflow-hidden">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      currentUser.email?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                      {currentUser.displayName || currentUser.email?.split('@')[0]} 
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400 font-medium uppercase">My Account</p>
                    </div>
                    
                    <Link to="/dashboard" onClick={() => setIsUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    
                    <Link to="/planner" onClick={() => setIsUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
                      <Calendar size={16} /> Meal Planner
                    </Link>

                    <Link to="/create" onClick={() => setIsUserOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition">
                      <PlusCircle size={16} /> Create Recipe
                    </Link>
                    
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Controls */
            <div className="flex items-center gap-4">
              <Link to="/login"><Button variant="ghost">Log In</Button></Link>
              <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
            </div>
          )}
        </div>

        {/* --- MOBILE HAMBURGER BUTTON --- */}
        <button className="md:hidden text-gray-600 p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 absolute w-full shadow-xl animate-in slide-in-from-top-5 max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setIsOpen(false)} className="text-gray-600 text-lg font-medium">Home</Link>
            
            {/* Mobile Categories Grid */}
            <div className="py-2">
              <p className="text-xs text-gray-400 font-bold uppercase mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="text-left px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {currentUser ? (
              <>
                <Link to="/favorites" onClick={() => setIsOpen(false)} className="text-gray-600 text-lg flex items-center gap-2 font-medium">
                   <Heart size={18} /> My Favorites
                </Link>
                
                <div className="border-t border-gray-100 my-2 pt-2">
                   <p className="text-xs text-gray-400 font-bold uppercase mb-2">My Account</p>
                   
                   <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-gray-600 text-lg flex items-center gap-2 mb-3">
                      <LayoutDashboard size={18} /> Dashboard
                   </Link>
                   
                   <Link to="/planner" onClick={() => setIsOpen(false)} className="text-gray-600 text-lg flex items-center gap-2 mb-3">
                      <Calendar size={18} /> Meal Planner
                   </Link>

                   <Link to="/create" onClick={() => setIsOpen(false)} className="text-gray-600 text-lg flex items-center gap-2 mb-3">
                      <PlusCircle size={18} /> Create Recipe
                   </Link>
                   
                   <button onClick={handleLogout} className="text-red-500 text-lg flex items-center gap-2 text-left w-full">
                      <LogOut size={18} /> Logout
                   </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2 text-orange-600 font-bold border border-orange-200 rounded-xl">Login</Link>
                <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center py-2 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;