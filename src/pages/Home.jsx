import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { useTrendingRecipes } from '../hooks/useRecipes';
import { useAuth } from '../context/AuthContext';
import { getLatestCustomRecipes } from '../libs/db'; 
import RecipeCard from '../components/ui/RecipeCard';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import Categories from '../components/layout/Categories';

/**
 * Home Page Component
 * The landing page of the application that aggregates content from multiple sources:
 * 1. Trending Recipes: Fetched from external API (TheMealDB) via custom hook.
 * 2. Community Recipes: Fetched from internal Firestore database.
 * 3. Static Categories: Navigation helpers.
 */
const Home = () => {
  // --- Hooks & Context ---
  const { recipes: trendingRecipes, loading: trendingLoading, error: trendingError } = useTrendingRecipes();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- Local State ---
  const [query, setQuery] = useState('');
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);

  // --- Data Fetching ---

  // Fetch latest community recipes on component mount
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const data = await getLatestCustomRecipes();
        setCommunityRecipes(data);
      } catch (error) {
        console.error("Failed to load community recipes", error);
      } finally {
        setCommunityLoading(false);
      }
    };
    fetchCommunity();
  }, []);

  // --- Handlers ---

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query}`);
    }
  };

  return (
    <div className="w-full">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-[600px] w-full flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543353071-087092ec393a?q=80&w=2070&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-sm font-semibold backdrop-blur-md mb-2">
            #1 Recipe Community
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight drop-shadow-lg">
            Taste the <span className="text-orange-500">Magic</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover thousands of recipes from top chefs and home cooks. Save your favorites and start cooking today.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 flex items-center max-w-lg mx-auto shadow-2xl">
            <Search className="text-gray-300 ml-4 w-6 h-6" />
            <input 
              type="text" 
              placeholder="Find a recipe (e.g., Pasta, Chicken)..." 
              className="grow bg-transparent px-4 py-3 outline-none text-white placeholder-gray-300 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" className="rounded-full px-8 py-3">Search</Button>
          </form>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <Categories />

      {/* --- COMMUNITY RECIPES (Firestore) --- */}
      <section className="py-16 bg-orange-50/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <Users size={24} />
            </div>
            <div>
               <h2 className="text-3xl font-serif font-bold text-gray-900">Fresh from the Community</h2>
               <p className="text-gray-500">Latest creations by our talented chefs</p>
            </div>
          </div>

          {communityLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : communityRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {communityRecipes.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No community recipes yet. Be the first to add one!</p>
              <Link to="/create" className="text-orange-600 font-bold hover:underline mt-2 inline-block">
                Share your recipe
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* --- TRENDING RECIPES (TheMealDB API) --- */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900">Trending Global Recipes</h2>
            <p className="text-gray-500 mt-2">Our most popular daily picks from around the world</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {trendingError && <div className="col-span-full text-center text-red-500 py-10">{trendingError}</div>}
          
          {trendingLoading && Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="space-y-3">
               <Skeleton className="h-48 w-full rounded-2xl" />
               <Skeleton className="h-4 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
             </div>
          ))}

          {!trendingLoading && !trendingError && trendingRecipes.map((recipe) => (
            <RecipeCard key={recipe.idMeal} recipe={recipe} />
          ))}
        </div>
      </section>

      {/* --- FOOTER CTA (Conditional) --- */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          {currentUser ? (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Ready to Cook, {currentUser.displayName?.split(' ')[0] || 'Chef'}?
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/dashboard">
                   <Button className="px-8 py-4 text-lg gap-2 shadow-xl shadow-orange-200">
                     <LayoutDashboard size={20} /> Go to Dashboard
                   </Button>
                </Link>
                <Link to="/create">
                   <Button variant="outline" className="px-8 py-4 text-lg gap-2 bg-white">
                     <PlusCircle size={20} /> Create New
                   </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
                Share Your Culinary Masterpiece
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Join our community. Save recipes, create shopping lists, and share your own creations.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/signup">
                   <Button className="px-8 py-4 text-lg shadow-xl shadow-orange-200">Join for Free</Button>
                </Link>
                <Link to="/login">
                   <Button variant="outline" className="px-8 py-4 text-lg bg-white">Log In</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;