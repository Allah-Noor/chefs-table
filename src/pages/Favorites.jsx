import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFromFavorites } from '../libs/db'; 
import RecipeCard from '../components/ui/RecipeCard';
import Button from '../components/ui/Button';
import { Heart, Loader2, BookHeart } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Favorites Page
 * Displays a grid of recipes saved by the authenticated user.
 * Allows users to manage their collection by removing items.
 */
const Favorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      if (currentUser) {
        try {
          const data = await getFavorites(currentUser.uid);
          setFavorites(data);
        } catch (error) {
          console.error("Error fetching favorites:", error);
          toast.error("Failed to load favorites");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchFavs();
  }, [currentUser]);

  const handleRemoveRecipe = async (recipeId) => {
    try {
      await removeFromFavorites(currentUser.uid, recipeId);
      
      // Optimistically update local state to remove the item immediately
      setFavorites((prev) => prev.filter((recipe) => recipe.idMeal !== recipeId));
      
      toast.success("Removed from favorites");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove recipe");
    }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-orange-100 rounded-full text-orange-600">
           <Heart size={28} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900">My Saved Recipes</h1>
          <p className="text-gray-500 mt-2">{favorites.length} items saved</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favorites.map(recipe => (
            <RecipeCard 
              key={recipe.idMeal} 
              recipe={recipe} 
              onRemove={handleRemoveRecipe} 
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-center mb-6 text-orange-200">
             <BookHeart size={64} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-500 mb-8">Start exploring and save your top picks here!</p>
          <Link to="/">
            <Button className="px-8">Explore Recipes</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;